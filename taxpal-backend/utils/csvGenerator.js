const { Parser } = require("json2csv");

/**
 * Generate CSV content for a financial report.
 *
 * @param {Object} reportData
 * @param {string} reportData.period
 * @param {string} reportData.reportType
 * @param {Array} reportData.transactions
 * @param {number} reportData.totalIncome
 * @param {number} reportData.totalExpenses
 * @param {number} reportData.netIncome
 * @returns {string}
 */
const generateCSV = ({
    period,
    reportType,
    transactions,
    totalIncome,
    totalExpenses,
    netIncome
}) => {

    const summaryRows = [
        {
            section: "SUMMARY",
            period,
            reportType,
            totalIncome,
            totalExpenses,
            netIncome
        }
    ];

    const transactionRows = transactions.map((transaction) => ({
        section: "TRANSACTION",
        date:
            transaction.transaction_date ||
            transaction.date,
        title: transaction.title,
        category: transaction.category,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || "",
        notes: transaction.notes || ""
    }));

    const rows = [
        ...summaryRows,
        ...transactionRows
    ];

    const fields = [
        "section",
        "period",
        "reportType",
        "date",
        "title",
        "category",
        "type",
        "amount",
        "totalIncome",
        "totalExpenses",
        "netIncome",
        "description",
        "notes"
    ];

    const parser = new Parser({ fields });

    return parser.parse(rows);
};

module.exports = {
    generateCSV
};