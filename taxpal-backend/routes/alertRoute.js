const express = require("express");

const router = express.Router();

const AlertController =
    require("../controllers/alertController");

const authMiddleware =
    require("../middleware/authMiddleware");


// Create quarterly alerts
router.post(
    "/quarterly",
    authMiddleware,
    AlertController.createQuarterlyTaxAlerts
);


// Get all alerts
router.get(
    "/",
    authMiddleware,
    AlertController.getAlerts
);


// Mark alert as read
router.patch(
    "/:id/read",
    authMiddleware,
    AlertController.markAlertAsRead
);


// Mark alert as resolved
router.patch(
    "/:id/resolve",
    authMiddleware,
    AlertController.markAlertAsResolved
);


// Delete alert
router.delete(
    "/:id",
    authMiddleware,
    AlertController.deleteAlert
);


module.exports = router;