const express = require("express");
const router = express.Router();

const { addTransaction, getTransactions, deleteTransaction } = require("../controllers/transactionControllers");
const transactionValidation = require("../middleware/transactionValidation");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, transactionValidation, addTransaction);
router.get("/get", authMiddleware, getTransactions);
router.delete("/delete/:id", authMiddleware, deleteTransaction);
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;