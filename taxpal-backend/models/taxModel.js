const db = require("../config/db");

const TaxModel = {

    getTaxSummary: async (user_id, year) => {

        const query = `
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'income'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_income,

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'expense'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_expenses

            FROM transactions

            WHERE user_id = ?
            AND YEAR(transaction_date) = ?
        `;

        const [rows] = await db.execute(
            query,
            [user_id, year]
        );

        return rows[0];
    }

};

module.exports = TaxModel;