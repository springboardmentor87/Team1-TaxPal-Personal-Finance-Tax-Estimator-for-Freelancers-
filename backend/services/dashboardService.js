const db = require("../config/db");

const getDashboard = (userId) => {
    return new Promise((resolve, reject) => {

        // Total Income
        db.query(
            "SELECT IFNULL(SUM(amount),0) AS totalIncome FROM transactions WHERE user_id = ? AND type = 'Income'",
            [userId],
            (err, incomeResult) => {

                if (err) return reject(err);

                // Total Expense
                db.query(
                    "SELECT IFNULL(SUM(amount),0) AS totalExpense FROM transactions WHERE user_id = ? AND type = 'Expense'",
                    [userId],
                    (err, expenseResult) => {

                        if (err) return reject(err);

                        // Recent Transactions
                        db.query(
                            `SELECT id, category, amount, type, transaction_date
                             FROM transactions
                             WHERE user_id = ?
                             ORDER BY transaction_date DESC`,
                            [userId],
                            (err, transactionResult) => {

                                if (err) return reject(err);

                                const totalIncome = incomeResult[0].totalIncome;
                                const totalExpense = expenseResult[0].totalExpense;

                                const balance = totalIncome - totalExpense;

                                resolve({
                                    totalIncome,
                                    totalExpense,
                                    balance,
                                    transactions: transactionResult
                                });

                            }
                        );

                    }
                );

            }
        );

    });
};

module.exports = {
    getDashboard
};