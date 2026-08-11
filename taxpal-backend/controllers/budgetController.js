const BudgetService = require("../services/budgetService");

// ==========================================
// Create Budget
// ==========================================
const createBudget = async (req, res) => {
    try {
        const user_id = req.user.id;

        const budget = await BudgetService.createBudget(
            user_id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Budget created successfully",
            data: budget
        });

    } catch (error) {
        console.error("Create Budget Error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// Get All Budgets
// ==========================================
const getBudgets = async (req, res) => {
    try {
        const user_id = req.user.id;

        const budgets = await BudgetService.getBudgets(
            user_id
        );

        return res.status(200).json({
            success: true,
            message: "Budgets fetched successfully",
            data: budgets
        });

    } catch (error) {
        console.error("Get Budgets Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch budgets",
            error: error.message
        });
    }
};


// ==========================================
// Get Budgets By Month
// ==========================================
const getBudgetsByMonth = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { month } = req.query;

        const budgets =
            await BudgetService.getBudgetsByMonth(
                user_id,
                month
            );

        return res.status(200).json({
            success: true,
            message: "Monthly budgets fetched successfully",
            data: budgets
        });

    } catch (error) {
        console.error(
            "Get Monthly Budgets Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// Get Budget Progress
// ==========================================
const getBudgetProgress = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { month } = req.query;

        console.log("Budget Progress User ID:", user_id);
        console.log("Budget Progress Month:", month);

        const result =
            await BudgetService.getBudgetProgress(
                user_id,
                month
            );

        return res.status(200).json({
            success: true,
            message: "Budget progress fetched successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "Budget Progress Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// Get Single Budget
// ==========================================
const getBudgetById = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        const budget =
            await BudgetService.getBudgetById(
                id,
                user_id
            );

        return res.status(200).json({
            success: true,
            message: "Budget fetched successfully",
            data: budget
        });

    } catch (error) {
        console.error(
            "Get Budget Error:",
            error.message
        );

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// Update Budget
// ==========================================
const updateBudget = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        await BudgetService.updateBudget(
            id,
            user_id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Budget updated successfully"
        });

    } catch (error) {
        console.error(
            "Update Budget Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// Delete Budget
// ==========================================
const deleteBudget = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        await BudgetService.deleteBudget(
            id,
            user_id
        );

        return res.status(200).json({
            success: true,
            message: "Budget deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete Budget Error:",
            error.message
        );

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createBudget,
    getBudgets,
    getBudgetsByMonth,
    getBudgetProgress,
    getBudgetById,
    updateBudget,
    deleteBudget
};