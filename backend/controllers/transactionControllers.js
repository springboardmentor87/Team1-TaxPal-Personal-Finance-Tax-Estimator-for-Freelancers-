const db = require("../config/db");

// Add Transaction
const addTransaction = (req, res) => {

    const { title, amount, type, category, transaction_date } = req.body;

    // Logged-in user id from JWT
    const user_id = req.user.id;

    const sql = `
        INSERT INTO transactions
        (user_id, title, amount, type, category, transaction_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [user_id, title, amount, type, category, transaction_date],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to add transaction",
                    error: err.message
                });
            }

            return res.status(201).json({
                success: true,
                message: "Transaction added successfully",
                transactionId: result.insertId
            });

        }
    );
};

// Get All Transactions
const getTransactions = (req, res) => {

    const user_id = req.user.id;

    const sql = `
        SELECT *
        FROM transactions
        WHERE user_id = ?
        ORDER BY transaction_date DESC
    `;

    db.query(sql, [user_id], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch transactions",
                error: err.message
            });
        }

        return res.status(200).json({
            success: true,
            data: result
        });

    });

};

module.exports = {
    addTransaction,
    getTransactions
};