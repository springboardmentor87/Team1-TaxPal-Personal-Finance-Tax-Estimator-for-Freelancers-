const express = require("express");
const router = express.Router();

const {
    addTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction
} = require("../controllers/transactionControllers");

const transactionValidation = require("../middleware/transactionValidation");

// POST   /api/transactions/add        → Create a new transaction
router.post("/add", transactionValidation, addTransaction);

// GET    /api/transactions/get        → Get all transactions
router.get("/get", getTransactions);

// PUT    /api/transactions/update/:id → Update a transaction by ID
router.put("/update/:id", transactionValidation, updateTransaction);

// DELETE /api/transactions/delete/:id → Delete a transaction by ID
router.delete("/delete/:id", deleteTransaction);

module.exports = router;