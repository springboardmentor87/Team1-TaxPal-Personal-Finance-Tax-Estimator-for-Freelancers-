const express = require("express");

const router = express.Router();

const TaxController = require("../controllers/taxController");

const authMiddleware = require("../middleware/authMiddleware");

const TaxEventController = require("../controllers/taxEventController");

router.get(
    "/calculate",
    authMiddleware,
    TaxController.calculateTax
);

router.post(
    "/calculate",
    authMiddleware,
    TaxController.calculateTax
);

router.get(
    "/reminders",
    authMiddleware,
    TaxEventController.getTaxEvents
);

module.exports = router;