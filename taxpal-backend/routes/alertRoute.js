const express = require("express");

const router = express.Router();

const AlertController =
    require("../controllers/alertController");

const authMiddleware =
    require("../middleware/authMiddleware");


router.post(
    "/quarterly",
    authMiddleware,
    AlertController.createQuarterlyTaxAlerts
);


router.get(
    "/",
    authMiddleware,
    AlertController.getAlerts
);


router.patch(
    "/:id/read",
    authMiddleware,
    AlertController.markAlertAsRead
);


router.patch(
    "/:id/resolve",
    authMiddleware,
    AlertController.markAlertAsResolved
);


router.delete(
    "/:id",
    authMiddleware,
    AlertController.deleteAlert
);


module.exports = router;