const PDFDocument = require("pdfkit");

const generatePDF = ({
    period,
    reportType,
    transactions,
    totalIncome,
    totalExpenses,
    netIncome
}) => {

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        const chunks = [];

        doc.on("data", (chunk) => {
            chunks.push(chunk);
        });

        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on("error", (error) => {
            reject(error);
        });

        // Header
        doc
            .fontSize(24)
            .text("TAXPAL", {
                align: "center"
            });

        doc.moveDown();

        doc
            .fontSize(18)
            .text("Financial Report", {
                align: "center"
            });

        doc.moveDown(2);

        // Report details
        doc.fontSize(12);

        doc.text(`Period: ${period}`);
        doc.text(`Report Type: ${reportType}`);

        doc.moveDown();

        // Summary
        doc
            .fontSize(16)
            .text("Financial Summary");

        doc.moveDown();

        doc
            .fontSize(12)
            .text(`Total Income: ${Number(totalIncome).toFixed(2)}`)
            .text(`Total Expenses: ${Number(totalExpenses).toFixed(2)}`)
            .text(`Net Income: ${Number(netIncome).toFixed(2)}`);

        doc.moveDown(2);

        // Transactions
        doc
            .fontSize(16)
            .text("Transactions");

        doc.moveDown();

        if (!transactions || transactions.length === 0) {

            doc
                .fontSize(12)
                .text("No transactions found.");

        } else {

            transactions.forEach((transaction, index) => {

                const date =
                    transaction.transaction_date ||
                    transaction.date ||
                    "";

                const title =
                    transaction.title ||
                    "Transaction";

                const category =
                    transaction.category ||
                    "";

                const type =
                    transaction.type ||
                    "";

                const amount =
                    Number(transaction.amount || 0).toFixed(2);

                doc
                    .fontSize(11)
                    .text(
                        `${index + 1}. ${date} | ${title} | ${category} | ${type} | ${amount}`
                    );

                doc.moveDown(0.5);
            });
        }

        doc.end();
    });
};

module.exports = {
    generatePDF
};