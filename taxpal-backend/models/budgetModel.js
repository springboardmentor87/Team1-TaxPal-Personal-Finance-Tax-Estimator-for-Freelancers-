const db = require("../config/db");

const BudgetModel = {
    // Create a budget
    create: (budgetData) => {
        const { user_id, category, limit, month } = budgetData;
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO budgets (user_id, category, `limit`, month) VALUES (?, ?, ?, ?)";
            db.query(sql, [user_id, category, limit, month], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve({
                    id: result.insertId,
                    user_id,
                    category,
                    limit,
                    month
                });
            });
        });
    },

    // Get budgets for the logged-in user
    getAllByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM budgets WHERE user_id = ?";
            db.query(sql, [userId], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    // Get a specific budget belonging to the logged-in user
    getByIdAndUserId: (id, userId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM budgets WHERE id = ? AND user_id = ?";
            db.query(sql, [id, userId], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results[0] || null);
            });
        });
    },

    // Update a budget
    update: (id, userId, budgetData) => {
        const { category, limit, month } = budgetData;
        return new Promise((resolve, reject) => {
            const sql = "UPDATE budgets SET category = ?, `limit` = ?, month = ? WHERE id = ? AND user_id = ?";
            db.query(sql, [category, limit, month, id, userId], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result.affectedRows > 0);
            });
        });
    },

    // Delete a budget
    delete: (id, userId) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM budgets WHERE id = ? AND user_id = ?";
            db.query(sql, [id, userId], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result.affectedRows > 0);
            });
        });
    }
};

module.exports = BudgetModel;
