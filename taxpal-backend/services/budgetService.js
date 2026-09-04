const BudgetModel = require("../models/budgetModel");

const BudgetService = {

    // ==========================================
    // Create Budget
    // ==========================================
    createBudget: async (user_id, budgetData) => {

        const {
            category,
            budget_limit,
            month,
            description
        } = budgetData;

        if (!category || !budget_limit || !month) {
            throw new Error(
                "Category, budget limit and month are required"
            );
        }

        if (Number(budget_limit) <= 0) {
            throw new Error(
                "Budget limit must be greater than 0"
            );
        }

        const budget = await BudgetModel.createBudget({
            user_id,
            category,
            budget_limit,
            month,
            description
        });

        return budget;
    },


    // ==========================================
    // Get All Budgets
    // ==========================================
    getBudgets: async (user_id) => {

        return await BudgetModel.getBudgetsByUser(
            user_id
        );
    },


    // ==========================================
    // Get Budgets By Month
    // ==========================================
    getBudgetsByMonth: async (user_id, month) => {

        if (!month) {
            throw new Error("Month is required");
        }

        return await BudgetModel.getBudgetsByUserAndMonth(
            user_id,
            month
        );
    },


    // ==========================================
    // Get Single Budget
    // ==========================================
    getBudgetById: async (id, user_id) => {

        const budget =
            await BudgetModel.getBudgetById(
                id,
                user_id
            );

        if (!budget) {
            throw new Error("Budget not found");
        }

        return budget;
    },


    // ==========================================
    // Update Budget
    // ==========================================
    updateBudget: async (
        id,
        user_id,
        budgetData
    ) => {

        const {
            category,
            budget_limit,
            month,
            description
        } = budgetData;

        if (!category || !budget_limit || !month) {
            throw new Error(
                "Category, budget limit and month are required"
            );
        }

        if (Number(budget_limit) <= 0) {
            throw new Error(
                "Budget limit must be greater than 0"
            );
        }

        const existingBudget =
            await BudgetModel.getBudgetById(
                id,
                user_id
            );

        if (!existingBudget) {
            throw new Error("Budget not found");
        }

        const result =
            await BudgetModel.updateBudget(
                id,
                user_id,
                {
                    category,
                    budget_limit,
                    month,
                    description
                }
            );

        return result;
    },


    // ==========================================
    // Delete Budget
    // ==========================================
    deleteBudget: async (
        id,
        user_id
    ) => {

        const existingBudget =
            await BudgetModel.getBudgetById(
                id,
                user_id
            );

        if (!existingBudget) {
            throw new Error("Budget not found");
        }

        const result =
            await BudgetModel.deleteBudget(
                id,
                user_id
            );

        return result;
    },


    // ==========================================
    // Get Budget Progress
    // ==========================================
    getBudgetProgress: async (
        user_id,
        month
    ) => {

        if (!month) {
            throw new Error("Month is required");
        }

        // Expected:
        // 2026-08-01

        const startDate = month;

        // Calculate next month
        const date = new Date(`${month}T00:00:00`);

        date.setMonth(
            date.getMonth() + 1
        );

        const year =
            date.getFullYear();

        const nextMonth =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const endDate =
            `${year}-${nextMonth}-01`;


        // ==========================================
        // Get budgets
        // ==========================================

        const budgets =
            await BudgetModel.getBudgetsByUserAndMonth(
                user_id,
                startDate
            );


        // ==========================================
        // Get actual expenses
        // ==========================================

        const spending =
            await BudgetModel
                .getSpendingByCategoryAndMonth(
                    user_id,
                    startDate,
                    endDate
                );


        // ==========================================
        // Convert spending into map
        // ==========================================

        const spendingMap = {};

        spending.forEach(item => {

            spendingMap[item.category] =
                Number(item.spent);

        });


        // ==========================================
        // Calculate progress
        // ==========================================

        const result = budgets.map(budget => {

            const budgetAmount =
                Number(
                    budget.budget_limit
                );

            const spent =
                spendingMap[
                budget.category
                ] || 0;

            const remaining =
                budgetAmount - spent;

            let percentage = 0;

            if (budgetAmount > 0) {

                percentage =
                    (
                        spent /
                        budgetAmount
                    ) * 100;

            }


            // ======================================
            // Status
            // ======================================

            let status = "Good";

            if (percentage >= 100) {

                status = "Exceeded";

            } else if (percentage >= 80) {

                status = "Warning";

            }


            return {

                id: budget.id,

                category:
                    budget.category,

                budget:
                    budgetAmount,

                spent:
                    spent,

                remaining:
                    remaining,

                percentage:
                    Number(
                        percentage.toFixed(2)
                    ),

                status:
                    status,

                month:
                    budget.month,

                description:
                    budget.description

            };

        });


        return result;
    }

};

module.exports = BudgetService;