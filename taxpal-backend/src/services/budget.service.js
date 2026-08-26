const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

class BudgetService {
  static async getBudgetsAndSpending(userId, monthStr) {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
      const parts = monthStr.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
    } else {
      monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    }

    const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-31T23:59:59`;

    const budgets = await Budget.findByUserIdAndMonth(userId, monthStr);

    const transactions = await Transaction.findByUserId(userId, {
      type: 'expense',
      startDate: startOfMonth,
      endDate: endOfMonth,
    });

    const spendingMap = new Map();
    transactions.forEach((tx) => {
      const cat = tx.category;
      const current = spendingMap.get(cat) || 0;
      spendingMap.set(cat, current + Number(tx.amount || 0));
    });

    const budgetList = [];
    const processedCategories = new Set();

    budgets.forEach((b) => {
      const category = b.category;
      const limit = b.limit;
      const spent = spendingMap.get(category) || 0;
      const remaining = limit - spent;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      budgetList.push({
        _id: b.id,
        id: b.id,
        category,
        limit,
        spent,
        remaining,
        percentage,
        month: b.month,
        description: b.description || '',
      });
      processedCategories.add(category);
    });

    spendingMap.forEach((spent, category) => {
      if (!processedCategories.has(category)) {
        budgetList.push({
          category,
          limit: 0,
          spent,
          remaining: -spent,
          percentage: 0,
          month: monthStr,
          description: '',
        });
      }
    });

    const user = await User.findById(userId);

    return {
      budgets: budgetList,
      settings: {
        autoCategorizeEnabled: user ? user.autoCategorizeEnabled : true,
        categoryMappings: user ? user.categoryMappings : {},
      },
    };
  }

  static async setBudget(userId, category, limit, month, description = '') {
    return await Budget.upsert(userId, category, limit, month, description);
  }

  static async deleteBudget(userId, category, month) {
    return await Budget.deleteByCategory(userId, category, month);
  }
}

module.exports = {
  BudgetService,
};
