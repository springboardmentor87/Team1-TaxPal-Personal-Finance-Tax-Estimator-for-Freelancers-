const express =
    require("express");

const router =
    express.Router();


const reportController =
    require("../controllers/reportController");


const authMiddleware =
    require("../middleware/authMiddleware");


// ==========================================
// Authentication
// ==========================================

router.use(
    authMiddleware
);



// ==========================================
// GET ALL REPORTS
// ==========================================

router.get(
    "/",
    reportController.getAllReports
);



// ==========================================
// SAVE REPORT
// ==========================================

router.post(
    "/",
    reportController.saveReport
);



// ==========================================
// GET ONE REPORT
// ==========================================

router.get(
    "/:id",
    reportController.getReportById
);



// ==========================================
// UPDATE PDF/CSV FILE PATH
// ==========================================

router.patch(
    "/:id/file",
    reportController.updateReportFile
);


module.exports = router;