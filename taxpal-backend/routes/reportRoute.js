const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");


// ========================================
// ALL REPORT ROUTES REQUIRE LOGIN
// ========================================
router.use(authMiddleware);


// ========================================
// MONTHLY REPORT
// GET /reports/monthly?month=2026-09
// ========================================
router.get(
    "/monthly",
    reportController.getMonthlyReport
);


// ========================================
// QUARTERLY REPORT
// GET /reports/quarterly?year=2026&quarter=3
// ========================================
router.get(
    "/quarterly",
    reportController.getQuarterlyReport
);


// ========================================
// SAVE REPORT
// POST /reports
// ========================================
router.post(
    "/",
    reportController.saveReport
);


// ========================================
// GET ALL SAVED REPORTS
// GET /reports
// ========================================
router.get(
    "/",
    reportController.getAllReports
);


// ========================================
// EXPORT CSV
// GET /reports/export/csv
// ========================================
router.get(
    "/export/csv",
    reportController.exportCSV
);


// ========================================
// EXPORT PDF
// GET /reports/export/pdf
// ========================================
router.get(
    "/export/pdf",
    reportController.exportPDF
);


// ========================================
// GET ONE REPORT
// GET /reports/:id
// ========================================
router.get(
    "/:id",
    reportController.getReportById
);


module.exports = router;