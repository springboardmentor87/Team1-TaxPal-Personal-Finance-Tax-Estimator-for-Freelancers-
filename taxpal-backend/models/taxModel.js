const db = require("../config/db");

const TaxModel = {

    // ==========================================
    // Save Tax Estimate
    // ==========================================
    createTaxEstimate: (data) => {

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO tax_estimates
                (
                    user_id,
                    country,
                    quarter,
                    estimated_tax,
                    due_date,
                    state,
                    filing_status,
                    gross_income_for_quarter,
                    business_expenses,
                    retirement_contribution,
                    health_insurance_premiums,
                    home_office_deduction
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    data.user_id,
                    data.country,
                    data.quarter,
                    data.estimated_tax,
                    data.due_date,
                    data.state || null,
                    data.filing_status || "single",
                    data.gross_income_for_quarter || 0,
                    data.business_expenses || 0,
                    data.retirement_contribution || 0,
                    data.health_insurance_premiums || 0,
                    data.home_office_deduction || 0
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: result.insertId,
                        ...data
                    });
                }
            );
        });
    },


    // ==========================================
    // Get user's tax estimates
    // ==========================================
    getTaxEstimatesByUser: (user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM tax_estimates
                WHERE user_id = ?
                ORDER BY due_date ASC
            `;

            db.query(
                sql,
                [user_id],
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(results);
                }
            );
        });
    },


    // ==========================================
    // Get tax estimate by ID
    // ==========================================
    getTaxEstimateById: (id, user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM tax_estimates
                WHERE id = ?
                AND user_id = ?
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


    // ==========================================
    // Get alerts for user
    // ==========================================
    getAlertsByUser: (user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM alerts
                WHERE user_id = ?
                ORDER BY alert_date ASC
            `;

            db.query(
                sql,
                [user_id],
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(results);
                }
            );
        });
    },

    hasAlert: (user_id, type, alert_date) => {
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id
            FROM alerts
            WHERE user_id = ?
              AND type = ?
              AND alert_date = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [user_id, type, alert_date],
            (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(results.length > 0);
            }
        );
    });
},


    // ==========================================
    // Create alert
    // ==========================================
    createAlert: (data) => {

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO alerts
                (
                    user_id,
                    type,
                    message,
                    alert_date,
                    is_read
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    data.user_id,
                    data.type,
                    data.message,
                    data.alert_date,
                    data.is_read || false
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: result.insertId,
                        ...data
                    });
                }
            );
        });
    },


    // ==========================================
    // Mark alert as read
    // ==========================================
    markAlertAsRead: (id, user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE alerts
                SET is_read = TRUE
                WHERE id = ?
                AND user_id = ?
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
    },

    markAlertAsReadByDate: (user_id, alert_date) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE alerts
            SET is_read = TRUE
            WHERE user_id = ?
            AND type = 'TAX_REMINDER'
            AND alert_date = ?
        `;

        db.query(
            sql,
            [user_id, alert_date],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result);
            }
        );
    });
},

markAlertAsReadByDate: (user_id, alert_date) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE alerts
            SET is_read = TRUE
            WHERE user_id = ?
            AND type = 'TAX_REMINDER'
            AND alert_date = ?
        `;

        db.query(
            sql,
            [user_id, alert_date],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result);
            }
        );
    });
},
getAlertByDate: (user_id, alert_date) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM alerts
            WHERE user_id = ?
            AND type = 'TAX_REMINDER'
            AND alert_date = ?
            ORDER BY id DESC
            LIMIT 1
        `;

        db.query(
            sql,
            [user_id, alert_date],
            (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(results[0] || null);
            }
        );
    });
},

};

module.exports = TaxModel;