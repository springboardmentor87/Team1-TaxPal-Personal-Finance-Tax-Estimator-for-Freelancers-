const express = require("express");
const router = express.Router();

const { addTransaction, getTransactions } = require("../controllers/transactionControllers");

const transactionValidation = require("../middleware/transactionValidation");

router.post("/add", transactionValidation, addTransaction);

router.get("/get", getTransactions);

module.exports = router;