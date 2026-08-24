const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    calculateTax,
    getTaxReminders,
    updateReminderStatus,
    getAlerts
} = require("../controllers/taxController");

router.get(
    "/alerts",
    authMiddleware,
    getAlerts
);


// Calculate estimated tax
router.post(
    "/calculate",
    authMiddleware,
    calculateTax
);


// Get quarterly tax reminders
router.get(
    "/reminders",
    authMiddleware,
    getTaxReminders
);


// Update reminder status
router.put(
    "/reminders/:id/status",
    authMiddleware,
    updateReminderStatus
);


module.exports = router;