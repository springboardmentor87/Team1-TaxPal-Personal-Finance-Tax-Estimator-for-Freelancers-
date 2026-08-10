const BudgetModel = require("../models/budgetModel");

// Create a budget
const createBudget = async (userId, budgetData) => {
    const { category, limit, month } = budgetData;

    // Validate fields
    if (!category || typeof category !== "string" || category.trim() === "") {
        throw new Error("Category is required");
    }
    if (limit === undefined || limit === null) {
        throw new Error("Limit is required");
    }
    const numLimit = Number(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
        throw new Error("Limit must be a positive number");
    }
    if (!month || typeof month !== "string" || month.trim() === "") {
        throw new Error("Month is required");
    }

    return await BudgetModel.create({
        user_id: userId,
        category: category.trim(),
        limit: numLimit,
        month: month.trim()
    });
};

// Get budgets for the logged-in user
const getBudgets = async (userId) => {
    return await BudgetModel.getAllByUserId(userId);
};

// Get a specific budget belonging to the logged-in user
const getBudgetById = async (id, userId) => {
    const budget = await BudgetModel.getByIdAndUserId(id, userId);
    if (!budget) {
        throw new Error("Budget not found or unauthorized");
    }
    return budget;
};

// Update a budget
const updateBudget = async (id, userId, budgetData) => {
    const { category, limit, month } = budgetData;

    // Validate fields
    if (!category || typeof category !== "string" || category.trim() === "") {
        throw new Error("Category is required");
    }
    if (limit === undefined || limit === null) {
        throw new Error("Limit is required");
    }
    const numLimit = Number(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
        throw new Error("Limit must be a positive number");
    }
    if (!month || typeof month !== "string" || month.trim() === "") {
        throw new Error("Month is required");
    }

    // Verify ownership and existence
    const budget = await BudgetModel.getByIdAndUserId(id, userId);
    if (!budget) {
        throw new Error("Budget not found or unauthorized");
    }

    const updated = await BudgetModel.update(id, userId, {
        category: category.trim(),
        limit: numLimit,
        month: month.trim()
    });

    if (!updated) {
        throw new Error("Failed to update budget");
    }

    return {
        id: Number(id),
        user_id: userId,
        category: category.trim(),
        limit: numLimit,
        month: month.trim()
    };
};

// Delete a budget
const deleteBudget = async (id, userId) => {
    // Verify ownership and existence
    const budget = await BudgetModel.getByIdAndUserId(id, userId);
    if (!budget) {
        throw new Error("Budget not found or unauthorized");
    }

    const deleted = await BudgetModel.delete(id, userId);
    if (!deleted) {
        throw new Error("Failed to delete budget");
    }

    return true;
};

module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget
};
