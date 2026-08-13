const SpendingModel = require("../models/spendingModel");

const SpendingService = {

    getSpending: async (user_id, month) => {

        if (!month) {
            throw new Error("Month is required");
        }


        const startDate = month;

  
        const date = new Date(`${month}T00:00:00`);

        date.setMonth(date.getMonth() + 1);

        const year = date.getFullYear();

        const nextMonth = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const endDate = `${year}-${nextMonth}-01`;


   
        const incomeExpense =
            await SpendingModel.getIncomeExpense(
                user_id,
                startDate,
                endDate
            );


  
        const categoryExpenses =
            await SpendingModel.getExpenseByCategory(
                user_id,
                startDate,
                endDate
            );


        let income = 0;
        let expense = 0;


      
        incomeExpense.forEach(item => {

            if (item.type === "Income") {
                income = Number(item.total);
            }

            if (item.type === "Expense") {
                expense = Number(item.total);
            }

        });



        const categories =
            categoryExpenses.map(item => {

                const amount = Number(item.total);

                let percentage = 0;

                if (expense > 0) {
                    percentage =
                        (amount / expense) * 100;
                }

                return {
                    category: item.category,
                    amount: amount,
                    percentage: Number(
                        percentage.toFixed(2)
                    )
                };

            });


        return {
            month: startDate,
            income: income,
            expense: expense,
            categories: categories
        };
    }

};

module.exports = SpendingService;