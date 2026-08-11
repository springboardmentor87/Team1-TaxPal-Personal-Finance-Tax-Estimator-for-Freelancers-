const express = require("express");

const router = express.Router();

const {
    createBudget,
    getBudgets,
    getBudgetsByMonth,
    getBudgetProgress,
    getBudgetById,
    updateBudget,
    deleteBudget
} = require("../controllers/budgetController");

const authMiddleware = require("../middleware/authMiddleware");


// ==========================================
// Create Budget
// POST /api/budget
// ==========================================
router.post(
    "/",
    authMiddleware,
    createBudget
);


// ==========================================
// Get All Budgets
// GET /api/budget
// ==========================================
router.get(
    "/",
    authMiddleware,
    getBudgets
);


// ==========================================
// Get Budgets By Month
// GET /api/budget/month?month=2026-08-01
// ==========================================
router.get(
    "/month",
    authMiddleware,
    getBudgetsByMonth
);


// ==========================================
// Get Budget Progress
// GET /api/budget/progress?month=2026-08-01
// ==========================================
router.get(
    "/progress",
    authMiddleware,
    getBudgetProgress
);


// ==========================================
// Get Single Budget
// GET /api/budget/:id
// ==========================================
router.get(
    "/:id",
    authMiddleware,
    getBudgetById
);


// ==========================================
// Update Budget
// PUT /api/budget/:id
// ==========================================
router.put(
    "/:id",
    authMiddleware,
    updateBudget
);


// ==========================================
// Delete Budget
// DELETE /api/budget/:id
// ==========================================
router.delete(
    "/:id",
    authMiddleware,
    deleteBudget
);


// IMPORTANT: Export router itself
module.exports = router;