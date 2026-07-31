const getDashboardData = async () => {

    return {

        summary: {
            totalIncome: 0,
            totalExpense: 0,
            balance: 0
        },

        recentTransactions: []

    };

};

module.exports = {
    getDashboardData
};