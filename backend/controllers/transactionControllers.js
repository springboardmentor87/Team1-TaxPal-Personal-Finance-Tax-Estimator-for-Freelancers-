const db = require("../config/db");

// Add Transaction
const addTransaction = (req, res) => {
    const { title, amount, type, category, transaction_date } = req.body;

    const sql = `
        INSERT INTO transactions
        (title, amount, type, category, transaction_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, amount, type, category, transaction_date],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to add transaction",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Transaction added successfully",
                transactionId: result.insertId
            });
        }
    );
};

// Get All Transactions
const getTransactions = (req, res) => {

    const sql = "SELECT * FROM transactions ORDER BY created_at DESC";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch transactions",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Transaction list",
            data: result
        });

    });

};

module.exports = {
    addTransaction,
    getTransactions
};