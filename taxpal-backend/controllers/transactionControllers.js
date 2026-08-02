const db = require("../config/db");

// Add Transaction
const addTransaction = (req, res) => {

    const { title, description, amount, type, category, transaction_date, date, notes } = req.body;

    const txTitle = description || title || "Transaction";
    const txDate = date || transaction_date || new Date().toISOString().split('T')[0];
    const txNotes = notes || null;

    // Logged-in user id from JWT
    const user_id = req.user.id;

    const sql = `
        INSERT INTO transactions
        (user_id, title, description, amount, type, category, transaction_date, date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [user_id, txTitle, txTitle, amount, type, category, txDate, txDate, txNotes],
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
        ORDER BY transaction_date DESC, id DESC
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

// Delete Transaction
const deleteTransaction = (req, res) => {
    const user_id = req.user.id;
    const { id } = req.params;

    const sql = `
        DELETE FROM transactions
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [id, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete transaction",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found or unauthorized"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully"
        });
    });
};

module.exports = {
    addTransaction,
    getTransactions,
    deleteTransaction
};