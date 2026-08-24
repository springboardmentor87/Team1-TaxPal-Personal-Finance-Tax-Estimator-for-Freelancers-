const db = require("../config/db");

const TaxModel = {

    getTaxSummary: async (user_id, year) => {

        const query = `
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'income'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_income,

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'expense'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_expenses

            FROM transactions

            WHERE user_id = ?
            AND YEAR(transaction_date) = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(query, [user_id, year], (err, rows) => {
                if (err) return reject(err);
                resolve(rows && rows.length ? rows[0] : { total_income: 0, total_expenses: 0 });
            });
        });
    },

    createTaxCalculation: async (data) => {
        const query = `
            INSERT INTO tax_calculations (
                user_id, year, country, state, filing_status, quarter,
                gross_income, business_expenses, retirement_contributions,
                health_insurance_premiums, home_office_deduction, total_deductions,
                taxable_income, federal_tax, state_tax, self_employment_tax,
                total_estimated_tax, effective_tax_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.user_id, data.year, data.country, data.state, data.filing_status, data.quarter,
            data.gross_income, data.business_expenses, data.retirement_contributions,
            data.health_insurance_premiums, data.home_office_deduction, data.total_deductions,
            data.taxable_income, data.federal_tax, data.state_tax, data.self_employment_tax,
            data.total_estimated_tax, data.effective_tax_rate
        ];

        return new Promise((resolve, reject) => {
            db.query(query, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    updateTaxSummary: async (data) => {
        const query = `
            INSERT INTO tax_summaries (user_id, year, total_income, total_expenses, taxable_income, estimated_tax)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.user_id, data.year, data.total_income, data.total_expenses, data.taxable_income, data.estimated_tax
        ];

        return new Promise((resolve, reject) => {
            db.query(query, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
};

module.exports = TaxModel;