const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const authMiddleware = require("../middleware/authMiddleware");

// All budget routes are protected by JWT authentication
router.use(authMiddleware);

// POST   /api/budgets      - Create a budget
router.post("/", budgetController.createBudget);

// GET    /api/budgets      - Get all budgets for the logged-in user
router.get("/", budgetController.getBudgets);

// GET    /api/budgets/:id  - Get a specific budget belonging to the logged-in user
router.get("/:id", budgetController.getBudgetById);

// PUT    /api/budgets/:id  - Update a budget belonging to the logged-in user
router.put("/:id", budgetController.updateBudget);

// DELETE /api/budgets/:id  - Delete a budget belonging to the logged-in user
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;
