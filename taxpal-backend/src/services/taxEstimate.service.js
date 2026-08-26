const TaxEstimate = require('../models/TaxEstimate');
const { ApiError } = require('../utils/ApiError');
const { computeTaxEstimate } = require('../utils/taxCalculator');
const { AlertService } = require('./alert.service');

class TaxEstimateService {
  static async createTaxEstimate(userId, data) {
    const calculation = computeTaxEstimate({
      country: data.country,
      state: data.state,
      quarter: data.quarter,
      year: data.year,
      grossIncomeForQuarter: data.grossIncomeForQuarter,
      businessExpenses: data.businessExpenses,
      retirementContribution: data.retirementContribution,
      healthInsurancePremiums: data.healthInsurancePremiums,
      homeOfficeDeduction: data.homeOfficeDeduction,
      filingStatus: data.filingStatus,
    });

    const deductionsTotal =
      (data.businessExpenses || 0) +
      (data.retirementContribution || 0) +
      (data.healthInsurancePremiums || 0) +
      (data.homeOfficeDeduction || 0);

    const effectiveRate = calculation.annualTaxableIncome > 0
      ? Number(((calculation.annualEstimatedTax / (data.grossIncomeForQuarter * 4)) * 100).toFixed(2))
      : 0;

    const savedEstimate = await TaxEstimate.create({
      userId,
      country: data.country,
      state: data.state || '',
      quarter: calculation.quarter,
      year: data.year || new Date().getFullYear(),
      grossIncomeForQuarter: data.grossIncomeForQuarter,
      businessExpenses: data.businessExpenses || 0,
      retirementContribution: data.retirementContribution || 0,
      healthInsurancePremiums: data.healthInsurancePremiums || 0,
      homeOfficeDeduction: data.homeOfficeDeduction || 0,
      deductionsTotal,
      taxableIncome: calculation.taxableIncome,
      effectiveTaxRate: effectiveRate,
      estimatedTax: calculation.estimatedTax,
      calculationDetails: calculation,
    });

    try {
      await AlertService.createTaxReminderAlert(userId, calculation.quarter, calculation.dueDate);
    } catch (err) {
      console.error('Failed to auto-generate tax reminder alert:', err);
    }

    return savedEstimate;
  }

  static async getTaxEstimates(userId) {
    return await TaxEstimate.findByUserId(userId);
  }

  static async getTaxEstimateById(userId, estimateId) {
    const taxEstimate = await TaxEstimate.findById(estimateId, userId);
    if (!taxEstimate) {
      throw new ApiError(404, 'Tax estimate not found');
    }
    return taxEstimate;
  }

  static async updateTaxEstimate(userId, estimateId, data) {
    const existing = await TaxEstimate.findById(estimateId, userId);
    if (!existing) {
      throw new ApiError(404, 'Tax estimate not found');
    }
    const calculation = data.calculationDetails || existing.calculationDetails || {};
    if (data.status) {
      calculation.status = data.status;
    }
    return await TaxEstimate.updateById(estimateId, userId, {
      ...data,
      calculationDetails: calculation
    });
  }

  static async deleteTaxEstimate(userId, estimateId) {
    const deleted = await TaxEstimate.deleteById(estimateId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Tax estimate not found');
    }
  }
}

module.exports = {
  TaxEstimateService,
};
