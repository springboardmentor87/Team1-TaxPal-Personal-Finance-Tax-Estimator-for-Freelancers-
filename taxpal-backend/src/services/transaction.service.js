const Transaction = require('../models/Transaction');
const { ApiError } = require('../utils/ApiError');

class TransactionService {
  static async createTransaction(userId, data) {
    return await Transaction.create({
      userId,
      ...data,
    });
  }

  static async getTransactions(userId, filters = {}) {
    return await Transaction.findByUserId(userId, filters);
  }

  static async getTransactionById(userId, transactionId) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new ApiError(404, 'Transaction not found or unauthorized');
    }
    return transaction;
  }

  static async updateTransaction(userId, transactionId, data) {
    const updated = await Transaction.updateById(transactionId, userId, data);
    if (!updated) {
      throw new ApiError(404, 'Transaction not found or unauthorized');
    }
    return updated;
  }

  static async deleteTransaction(userId, transactionId) {
    const deleted = await Transaction.deleteById(transactionId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Transaction not found or unauthorized');
    }
  }
}

module.exports = {
  TransactionService,
};
