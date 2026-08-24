const db = require("../config/db");

const BudgetModel = {


    createBudget: (budgetData) => {

        const {
            user_id,
            category,
            budget_limit,
            month,
            description
        } = budgetData;

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO budgets
                (
                    user_id,
                    category,
                    budget_limit,
                    month,
                    description
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    user_id,
                    category,
                    budget_limit,
                    month,
                    description || null
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: result.insertId,
                        user_id,
                        category,
                        budget_limit,
                        month,
                        description: description || null
                    });
                }
            );
        });
    },


    getBudgetsByUser: (user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM budgets
                WHERE user_id = ?
                ORDER BY month DESC, category ASC
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



    getBudgetsByUserAndMonth: (user_id, month) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM budgets
                WHERE user_id = ?
                AND month = ?
                ORDER BY category ASC
            `;

            db.query(
                sql,
                [user_id, month],
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(results);
                }
            );
        });
    },


    getBudgetById: (id, user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM budgets
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

    updateBudget: (id, user_id, budgetData) => {

        const {
            category,
            budget_limit,
            month,
            description
        } = budgetData;

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE budgets
                SET
                    category = ?,
                    budget_limit = ?,
                    month = ?,
                    description = ?
                WHERE id = ?
                AND user_id = ?
            `;

            db.query(
                sql,
                [
                    category,
                    budget_limit,
                    month,
                    description || null,
                    id,
                    user_id
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(result);
                }
            );
        });
    },

    deleteBudget: (id, user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                DELETE FROM budgets
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

    getSpendingByCategoryAndMonth: (
        user_id,
        startDate,
        endDate
    ) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT
                    category,
                    SUM(amount) AS spent
                FROM transactions
                WHERE user_id = ?
                AND type = 'Expense'
                AND transaction_date >= ?
                AND transaction_date < ?
                GROUP BY category
            `;

            db.query(
                sql,
                [
                    user_id,
                    startDate,
                    endDate
                ],
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(results);
                }
            );
        });
    }

};

module.exports = BudgetModel;