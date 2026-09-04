const db = require("../config/db");

const TaxEstimatorModel = {

    saveAssessment: (assessmentData) => {
        const {
            user_id,
            financial_year,
            gross_income,
            business_expenses,
            other_deductions,
            taxable_income,
            old_regime_tax,
            new_regime_tax,
            selected_regime,
            estimated_tax,
            cess,
            total_tax,
            effective_tax_rate,
            net_income
        } = assessmentData;

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO tax_assessments (
                    user_id,
                    financial_year,
                    gross_income,
                    business_expenses,
                    other_deductions,
                    taxable_income,
                    old_regime_tax,
                    new_regime_tax,
                    selected_regime,
                    estimated_tax,
                    cess,
                    total_tax,
                    effective_tax_rate,
                    net_income
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    user_id,
                    financial_year,
                    gross_income,
                    business_expenses,
                    other_deductions,
                    taxable_income,
                    old_regime_tax,
                    new_regime_tax,
                    selected_regime,
                    estimated_tax,
                    cess,
                    total_tax,
                    effective_tax_rate,
                    net_income
                ],
                (err, result) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: result.insertId,
                        user_id,
                        financial_year,
                        gross_income,
                        business_expenses,
                        other_deductions,
                        taxable_income,
                        old_regime_tax,
                        new_regime_tax,
                        selected_regime,
                        estimated_tax,
                        cess,
                        total_tax,
                        effective_tax_rate,
                        net_income,
                        created_at: new Date()
                    });
                }
            );
        });
    },

    getAssessmentsByUser: (user_id) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT *
                FROM tax_assessments
                WHERE user_id = ?
                ORDER BY created_at DESC
            `;

            db.query(
                sql,
                [user_id],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results || []);
                }
            );
        });
    },

    getAssessmentById: (id, user_id) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT *
                FROM tax_assessments
                WHERE id = ? AND user_id = ?
            `;

            db.query(
                sql,
                [id, user_id],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results[0] || null);
                }
            );
        });
    },

    deleteAssessment: (id, user_id) => {
        return new Promise((resolve, reject) => {
            const sql = `
                DELETE FROM tax_assessments
                WHERE id = ? AND user_id = ?
            `;

            db.query(
                sql,
                [id, user_id],
                (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                }
            );
        });
    }
};

module.exports = TaxEstimatorModel;
