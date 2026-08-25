const express = require("express");
const router = express.Router();

const {
    calculateTax,
    saveAssessment,
    getAssessments,
    getAssessmentById,
    deleteAssessment
} = require("../controllers/taxEstimatorController");

const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// Calculate Tax (Unsaved)
// POST /api/tax-estimator/calculate
// ==========================================
router.post(
    "/calculate",
    authMiddleware,
    calculateTax
);

// ==========================================
// Save Tax Assessment
// POST /api/tax-estimator
// ==========================================
router.post(
    "/",
    authMiddleware,
    saveAssessment
);

// ==========================================
// Get All Saved Assessments
// GET /api/tax-estimator
// ==========================================
router.get(
    "/",
    authMiddleware,
    getAssessments
);

// ==========================================
// Get Single Assessment
// GET /api/tax-estimator/:id
// ==========================================
router.get(
    "/:id",
    authMiddleware,
    getAssessmentById
);

// ==========================================
// Delete Assessment
// DELETE /api/tax-estimator/:id
// ==========================================
router.delete(
    "/:id",
    authMiddleware,
    deleteAssessment
);

module.exports = router;
