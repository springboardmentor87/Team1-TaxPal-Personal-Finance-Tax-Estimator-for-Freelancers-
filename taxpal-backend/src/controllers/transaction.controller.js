const { TransactionService } = require('../services/transaction.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

class TransactionController {
  static async createTransaction(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const transaction = await TransactionService.createTransaction(userId, req.body);
      res.status(201).json(new ApiResponse(transaction, 'Transaction created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getTransactions(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const filters = {
        type: req.query.type,
        category: req.query.category,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
      };

      const transactions = await TransactionService.getTransactions(userId, filters);
      res.status(200).json(new ApiResponse(transactions, 'Transactions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id: transactionId } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const transaction = await TransactionService.getTransactionById(userId, transactionId);
      res.status(200).json(new ApiResponse(transaction, 'Transaction retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateTransaction(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id: transactionId } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const transaction = await TransactionService.updateTransaction(userId, transactionId, req.body);
      res.status(200).json(new ApiResponse(transaction, 'Transaction updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id: transactionId } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      await TransactionService.deleteTransaction(userId, transactionId);
      res.status(200).json(new ApiResponse(null, 'Transaction deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  TransactionController,
};
