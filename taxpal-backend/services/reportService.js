const ReportModel = require("../models/reportModel");


// ========================================
// GET NEXT MONTH
// ========================================
const getNextMonth = (year, month) => {

    if (month === 12) {
        return {
            year: year + 1,
            month: 1
        };
    }

    return {
        year: year,
        month: month + 1
    };
};


// ========================================
// FORMAT MONTH
// ========================================
const formatMonth = (year, month) => {

    return `${year}-${String(month).padStart(2, "0")}`;
};


// ========================================
// MONTHLY REPORT
// ========================================
const getMonthlyReport = async (
    userId,
    month
) => {

    if (!month) {
        throw new Error("Month is required");
    }


    // Expected format: YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error(
            "Month must be in YYYY-MM format"
        );
    }


    const [yearString, monthString] =
        month.split("-");


    const year = Number(yearString);

    const monthNumber = Number(monthString);


    if (
        monthNumber < 1 ||
        monthNumber > 12
    ) {
        throw new Error("Invalid month");
    }


    const startDate =
        `${year}-${String(monthNumber).padStart(2, "0")}-01`;


    const next =
        getNextMonth(
            year,
            monthNumber
        );


    const endDate =
        `${next.year}-${String(next.month).padStart(2, "0")}-01`;


    // Get income and expense
    const incomeExpense =
        await ReportModel.getIncomeExpense(
            userId,
            startDate,
            endDate
        );


    // Get category-wise expenses
    const categoryExpenses =
        await ReportModel.getExpenseByCategory(
            userId,
            startDate,
            endDate
        );


    let income = 0;

    let expense = 0;


    incomeExpense.forEach(item => {

        const type =
            String(item.type).toLowerCase();


        const amount =
            Number(item.total) || 0;


        if (type === "income") {
            income += amount;
        }


        if (type === "expense") {
            expense += amount;
        }

    });


    const categories =
        categoryExpenses.map(item => {

            const amount =
                Number(item.total) || 0;


            const percentage =
                expense > 0
                    ? Number(
                        ((amount / expense) * 100)
                            .toFixed(2)
                    )
                    : 0;


            return {
                category: item.category,
                amount: amount,
                percentage: percentage
            };

        });


    return {

        reportType: "monthly",

        period: month,

        startDate: startDate,

        endDate: endDate,

        summary: {

            income: income,

            expense: expense,

            netIncome: income - expense

        },

        categories: categories

    };
};


// ========================================
// QUARTERLY REPORT
// ========================================
const getQuarterlyReport = async (
    userId,
    year,
    quarter
) => {

    year = Number(year);


    if (!Number.isInteger(year)) {
        throw new Error("Invalid year");
    }


    quarter =
        String(quarter).toUpperCase();


    if (
        !["Q1", "Q2", "Q3", "Q4"]
            .includes(quarter)
    ) {
        throw new Error(
            "Quarter must be Q1, Q2, Q3 or Q4"
        );
    }


    const quarterNumber =
        Number(quarter.substring(1));


    const startMonth =
        ((quarterNumber - 1) * 3) + 1;


    const endMonth =
        startMonth + 2;


    const startDate =
        `${year}-${String(startMonth).padStart(2, "0")}-01`;


    const next =
        getNextMonth(
            year,
            endMonth
        );


    const endDate =
        `${next.year}-${String(next.month).padStart(2, "0")}-01`;


    // Get income and expense
    const incomeExpense =
        await ReportModel.getIncomeExpense(
            userId,
            startDate,
            endDate
        );


    // Get category-wise expenses
    const categoryExpenses =
        await ReportModel.getExpenseByCategory(
            userId,
            startDate,
            endDate
        );


    let income = 0;

    let expense = 0;


    incomeExpense.forEach(item => {

        const type =
            String(item.type).toLowerCase();


        const amount =
            Number(item.total) || 0;


        if (type === "income") {
            income += amount;
        }


        if (type === "expense") {
            expense += amount;
        }

    });


    const categories =
        categoryExpenses.map(item => {

            const amount =
                Number(item.total) || 0;


            const percentage =
                expense > 0
                    ? Number(
                        ((amount / expense) * 100)
                            .toFixed(2)
                    )
                    : 0;


            return {
                category: item.category,
                amount: amount,
                percentage: percentage
            };

        });


    return {

        reportType: "quarterly",

        period: `${year}-${quarter}`,

        startDate: startDate,

        endDate: endDate,

        summary: {

            income: income,

            expense: expense,

            netIncome: income - expense

        },

        categories: categories

    };
};


// ========================================
// EXPORT
// ========================================
module.exports = {

    getMonthlyReport,

    getQuarterlyReport

};