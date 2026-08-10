const db = require("../config/db");

const BudgetModel = {
    // Create a budget
    create: (budgetData) => {
        const { user_id, category, description, limit, month } = budgetData;
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO budgets (user_id, category, description, `limit`, month) VALUES (?, ?, ?, ?, ?)";
            db.query(sql, [user_id, category, description, limit, month], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve({
                    id: result.insertId,
                    user_id,
                    category,
                    description,
                    limit,
                    month
                });
            });
        });
    },

    // Get budgets for the logged-in user (with formatted date strings)
    getAllByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT id, user_id, category, description, `limit`, DATE_FORMAT(month, '%Y-%m-%d') AS month FROM budgets WHERE user_id = ?";
            db.query(sql, [userId], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    // Get a specific budget belonging to the logged-in user (with formatted date string)
    getByIdAndUserId: (id, userId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT id, user_id, category, description, `limit`, DATE_FORMAT(month, '%Y-%m-%d') AS month FROM budgets WHERE id = ? AND user_id = ?";
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
        const { category, description, limit, month } = budgetData;
        return new Promise((resolve, reject) => {
            const sql = "UPDATE budgets SET category = ?, description = ?, `limit` = ?, month = ? WHERE id = ? AND user_id = ?";
            db.query(sql, [category, description, limit, month, id, userId], (err, result) => {
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
