const db = require("../config/db");

const SpendingModel = {

    //this api is for total  expense
    getIncomeExpense: (user_id, startDate, endDate) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT
                    type,
                    SUM(amount) AS total
                FROM transactions
                WHERE user_id = ?
                AND transaction_date >= ?
                AND transaction_date < ?
                GROUP BY type
            `;

            db.query(
                sql,
                [user_id, startDate, endDate],
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(results);
                }
            );
        });
    },


    // this api is for get  expense category-wise
    getExpenseByCategory: (user_id, startDate, endDate) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT
                    category,
                    SUM(amount) AS total
                FROM transactions
                WHERE user_id = ?
                AND type = 'Expense'
                AND transaction_date >= ?
                AND transaction_date < ?
                GROUP BY category
                ORDER BY total DESC
            `;

            db.query(
                sql,
                [user_id, startDate, endDate],
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(results);
                }
            );
        });
    }

};

module.exports = SpendingModel;