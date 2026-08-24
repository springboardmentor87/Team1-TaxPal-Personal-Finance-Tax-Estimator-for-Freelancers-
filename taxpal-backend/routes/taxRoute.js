const express = require("express");

const router = express.Router();

const TaxController = require("../controllers/taxController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/calculate",
    authMiddleware,
    TaxController.calculateTax
);

module.exports = router;