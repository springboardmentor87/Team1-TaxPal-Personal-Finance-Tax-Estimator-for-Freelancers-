const db = require("../config/db");

// Add a new transaction
const addTransaction = (req, res, next) => {
    const { title, amount, type, category, transaction_date } = req.body;

    const sql = `
        INSERT INTO transactions
        (title, amount, type, category, transaction_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, amount, type, category, transaction_date], (err, result) => {
        if (err) {
            console.error("DB Error [addTransaction]:", err.message);
            return res.status(500).json({ message: "Failed to add transaction" });
        }

        res.status(201).json({
            message: "Transaction added successfully",
            transactionId: result.insertId
        });
    });
};

// Get all transactions
const getTransactions = (req, res, next) => {
    const sql = "SELECT * FROM transactions ORDER BY created_at DESC";

    db.query(sql, (err, result) => {
        if (err) {
            console.error("DB Error [getTransactions]:", err.message);
            return res.status(500).json({ message: "Failed to fetch transactions" });
        }

        res.status(200).json({
            message: "Transaction list",
            data: result
        });
    });
};

// Update a transaction by ID
const updateTransaction = (req, res, next) => {
    const { id } = req.params;
    const { title, amount, type, category, transaction_date } = req.body;

    const sql = `
        UPDATE transactions
        SET title = ?, amount = ?, type = ?, category = ?, transaction_date = ?
        WHERE id = ?
    `;

    db.query(sql, [title, amount, type, category, transaction_date, id], (err, result) => {
        if (err) {
            console.error("DB Error [updateTransaction]:", err.message);
            return res.status(500).json({ message: "Failed to update transaction" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction updated successfully" });
    });
};

// Delete a transaction by ID
const deleteTransaction = (req, res, next) => {
    const { id } = req.params;

    const sql = "DELETE FROM transactions WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB Error [deleteTransaction]:", err.message);
            return res.status(500).json({ message: "Failed to delete transaction" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted successfully" });
    });
};

module.exports = {
    addTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction
};