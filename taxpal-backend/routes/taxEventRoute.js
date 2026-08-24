const express = require("express");

const router = express.Router();

const TaxEventController =
    require("../controllers/taxEventController");

const authMiddleware =
    require("../middleware/authMiddleware");


router.post(
    "/",
    authMiddleware,
    TaxEventController.createTaxEvent
);


router.post(
    "/quarterly",
    authMiddleware,
    TaxEventController.createQuarterlyTaxEvents
);


router.get(
    "/",
    authMiddleware,
    TaxEventController.getTaxEvents
);


router.get(
    "/month",
    authMiddleware,
    TaxEventController.getTaxEventsByMonth
);


router.put(
    "/:id",
    authMiddleware,
    TaxEventController.updateTaxEvent
);


router.patch(
    "/:id/complete",
    authMiddleware,
    TaxEventController.markEventAsCompleted
);


router.delete(
    "/:id",
    authMiddleware,
    TaxEventController.deleteTaxEvent
);


module.exports = router;