const crypto = require('crypto');
const { query, run, get } = require('../config/db');

class TaxEstimate {
  static format(row) {
    if (!row) return null;
    const calcDetails = typeof row.calculation_details === 'string'
      ? JSON.parse(row.calculation_details || '{}')
      : row.calculation_details || {};

    let dueDate = calcDetails.dueDate;
    if (!dueDate && row.quarter && row.year) {
      const year = Number(row.year);
      if (row.quarter === 'Q1') dueDate = `${year}-04-15`;
      else if (row.quarter === 'Q2') dueDate = `${year}-06-15`;
      else if (row.quarter === 'Q3') dueDate = `${year}-09-15`;
      else if (row.quarter === 'Q4') dueDate = `${year + 1}-01-15`;
    }

    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      country: row.country,
      state: row.state || '',
      quarter: row.quarter,
      year: Number(row.year),
      dueDate: dueDate || null,
      grossIncomeForQuarter: Number(row.gross_income),
      businessExpenses: Number(row.business_expenses),
      retirementContribution: Number(row.retirement_contribution),
      healthInsurancePremiums: Number(row.health_insurance),
      homeOfficeDeduction: Number(row.home_office_deduction),
      deductionsTotal: Number(row.deductions_total),
      taxableIncome: Number(row.taxable_income),
      effectiveTaxRate: Number(row.effective_tax_rate),
      estimatedTax: Number(row.estimated_tax),
      status: calcDetails.status || 'Pending',
      calculationDetails: calcDetails,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findById(id, userId) {
    const row = await get('SELECT * FROM tax_estimates WHERE id = ? AND user_id = ?', [id, userId]);
    return TaxEstimate.format(row);
  }

  static async findByUserId(userId) {
    const rows = await query('SELECT * FROM tax_estimates WHERE user_id = ? ORDER BY year DESC, quarter DESC', [userId]);
    return rows.map(TaxEstimate.format);
  }

  static async create(data) {
    const id = data.id || crypto.randomUUID();
    const calcObj = typeof data.calculationDetails === 'object' ? { ...data.calculationDetails } : {};
    if (data.status) calcObj.status = data.status;
    const calculationDetails = JSON.stringify(calcObj);

    await run(
      `INSERT INTO tax_estimates (
        id, user_id, country, state, quarter, year, gross_income, business_expenses,
        retirement_contribution, health_insurance, home_office_deduction, deductions_total,
        taxable_income, effective_tax_rate, estimated_tax, calculation_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId,
        data.country,
        data.state || '',
        data.quarter,
        data.year || new Date().getFullYear(),
        data.grossIncomeForQuarter || 0,
        data.businessExpenses || 0,
        data.retirementContribution || 0,
        data.healthInsurancePremiums || 0,
        data.homeOfficeDeduction || 0,
        data.deductionsTotal || 0,
        data.taxableIncome || 0,
        data.effectiveTaxRate || 0,
        data.estimatedTax || 0,
        calculationDetails,
      ]
    );

    return await TaxEstimate.findById(id, data.userId);
  }

  static async updateById(id, userId, data) {
    const existing = await get('SELECT * FROM tax_estimates WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) return null;

    let calcObj = {};
    try {
      calcObj = existing.calculation_details ? JSON.parse(existing.calculation_details) : {};
    } catch {
      calcObj = {};
    }
    if (typeof data.calculationDetails === 'object') {
      calcObj = { ...calcObj, ...data.calculationDetails };
    }
    if (data.status) {
      calcObj.status = data.status;
    }
    const calculationDetails = JSON.stringify(calcObj);

    await run(
      `UPDATE tax_estimates SET
        country = COALESCE(?, country),
        state = COALESCE(?, state),
        quarter = COALESCE(?, quarter),
        year = COALESCE(?, year),
        gross_income = COALESCE(?, gross_income),
        business_expenses = COALESCE(?, business_expenses),
        retirement_contribution = COALESCE(?, retirement_contribution),
        health_insurance = COALESCE(?, health_insurance),
        home_office_deduction = COALESCE(?, home_office_deduction),
        deductions_total = COALESCE(?, deductions_total),
        taxable_income = COALESCE(?, taxable_income),
        effective_tax_rate = COALESCE(?, effective_tax_rate),
        estimated_tax = COALESCE(?, estimated_tax),
        calculation_details = ?,
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?`,
      [
        data.country || null,
        data.state || null,
        data.quarter || null,
        data.year || null,
        data.grossIncomeForQuarter !== undefined ? data.grossIncomeForQuarter : null,
        data.businessExpenses !== undefined ? data.businessExpenses : null,
        data.retirementContribution !== undefined ? data.retirementContribution : null,
        data.healthInsurancePremiums !== undefined ? data.healthInsurancePremiums : null,
        data.homeOfficeDeduction !== undefined ? data.homeOfficeDeduction : null,
        data.deductionsTotal !== undefined ? data.deductionsTotal : null,
        data.taxableIncome !== undefined ? data.taxableIncome : null,
        data.effectiveTaxRate !== undefined ? data.effectiveTaxRate : null,
        data.estimatedTax !== undefined ? data.estimatedTax : null,
        calculationDetails,
        id,
        userId,
      ]
    );

    return await TaxEstimate.findById(id, userId);
  }

  static async deleteById(id, userId) {
    const result = await run('DELETE FROM tax_estimates WHERE id = ? AND user_id = ?', [id, userId]);
    return result.changes > 0;
  }
}

module.exports = TaxEstimate;
