const { Parser } =
    require("json2csv");

const generateCSV = (report) => {

    const rows = [];


    rows.push({
        Type: "Summary",
        Category: "Income",
        Amount: report.summary.income,
        Percentage: ""
    });


    rows.push({
        Type: "Summary",
        Category: "Expense",
        Amount: report.summary.expense,
        Percentage: ""
    });


    rows.push({
        Type: "Summary",
        Category: "Net Income",
        Amount: report.summary.netIncome,
        Percentage: ""
    });


    report.categories.forEach(item => {

        rows.push({
            Type: "Expense",
            Category: item.category,
            Amount: item.amount,
            Percentage: item.percentage
        });

    });


    const parser =
        new Parser({
            fields: [
                "Type",
                "Category",
                "Amount",
                "Percentage"
            ]
        });


    return parser.parse(rows);
};


module.exports = {
    generateCSV
};