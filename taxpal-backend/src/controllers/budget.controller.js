const { BudgetService } = require('../services/budget.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

class BudgetController {
  static async getBudgets(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const month = req.query.month;
      const budgetData = await BudgetService.getBudgetsAndSpending(userId, month);
      res.status(200).json(new ApiResponse(budgetData, 'Budgets and spending metrics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async setBudget(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const { category, limit, month, description } = req.body;
      const budget = await BudgetService.setBudget(userId, category, limit, month, description);
      res.status(200).json(new ApiResponse(budget, 'Budget limit updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteBudget(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const { category } = req.params;
      const month = req.query.month;
      if (!category) {
        throw new ApiError(400, 'Category parameter is required');
      }

      await BudgetService.deleteBudget(userId, category, month);
      res.status(200).json(new ApiResponse(null, 'Budget limit deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  BudgetController,
};
