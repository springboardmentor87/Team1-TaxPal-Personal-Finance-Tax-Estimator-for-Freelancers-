const budgetService = require("../services/budgetService");

const createBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, description, limit, month } = req.body;

        const newBudget = await budgetService.createBudget(userId, { category, description, limit, month });

        return res.status(201).json({
            success: true,
            message: "Budget created successfully",
            data: newBudget
        });
    } catch (error) {
        console.error("Create Budget Error:", error.message);
        const isValidationError = 
            error.message.includes("required") || 
            error.message.includes("positive number") ||
            error.message.includes("valid date");
        
        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: error.message || "Failed to create budget"
        });
    }
};

const getBudgets = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgets = await budgetService.getBudgets(userId);

        return res.status(200).json({
            success: true,
            data: budgets
        });
    } catch (error) {
        console.error("Get Budgets Error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch budgets"
        });
    }
};

const getBudgetById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const budget = await budgetService.getBudgetById(id, userId);

        return res.status(200).json({
            success: true,
            data: budget
        });
    } catch (error) {
        console.error("Get Budget By ID Error:", error.message);
        const isNotFound = error.message === "Budget not found or unauthorized";

        return res.status(isNotFound ? 404 : 500).json({
            success: false,
            message: error.message || "Failed to fetch budget"
        });
    }
};

const updateBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { category, description, limit, month } = req.body;

        const updatedBudget = await budgetService.updateBudget(id, userId, { category, description, limit, month });

        return res.status(200).json({
            success: true,
            message: "Budget updated successfully",
            data: updatedBudget
        });
    } catch (error) {
        console.error("Update Budget Error:", error.message);
        const isNotFound = error.message === "Budget not found or unauthorized";
        const isValidationError = 
            error.message.includes("required") || 
            error.message.includes("positive number") ||
            error.message.includes("valid date");

        const statusCode = isNotFound ? 404 : (isValidationError ? 400 : 500);

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to update budget"
        });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await budgetService.deleteBudget(id, userId);

        return res.status(200).json({
            success: true,
            message: "Budget deleted successfully"
        });
    } catch (error) {
        console.error("Delete Budget Error:", error.message);
        const isNotFound = error.message === "Budget not found or unauthorized";

        return res.status(isNotFound ? 404 : 500).json({
            success: false,
            message: error.message || "Failed to delete budget"
        });
    }
};

module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget
};
