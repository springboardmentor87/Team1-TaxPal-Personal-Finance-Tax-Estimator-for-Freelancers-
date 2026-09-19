const PDFDocument = require("pdfkit");

const colors = {
    navy: "#17213a",
    muted: "#64748b",
    blue: "#16a9e0",
    border: "#d9e3ef",
    card: "#f8fafc",
    income: "#10b981",
    expense: "#ef4444",
    tax: "#f59e0b"
};

const money = value => `₹${(Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})}`;

const periodLabel = period => {
    if (!period) return "Selected Period";
    const match = /^(\d{4})-(\d{2})$/.exec(period);
    if (!match) return period;
    return new Date(Number(match[1]), Number(match[2]) - 1, 1)
        .toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const drawCard = (doc, x, y, width, label, value, color) => {
    doc.roundedRect(x, y, width, 132, 9)
        .lineWidth(1)
        .strokeColor(colors.border)
        .fillColor(colors.card)
        .fillAndStroke();

    doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(colors.muted)
        .text(label, x + 20, y + 25, { width: width - 40 });

    doc.font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(color)
        .text(value, x + 20, y + 61, { width: width - 40 });
};

const drawTable = (doc, transactions, x, y, width) => {
    const columns = [
        { label: "Date", width: 287 },
        { label: "Description", width: 136 },
        { label: "Category", width: 118 },
        { label: "Type", width: 109 },
        { label: "Amount", width: 112 }
    ];
    const headerHeight = 45;
    const rowHeight = 45;

    doc.rect(x, y, width, headerHeight)
        .fillColor("#f8fafc")
        .fill()
        .lineWidth(1)
        .strokeColor(colors.border)
        .stroke();

    let cursor = x;
    columns.forEach(column => {
        doc.font("Helvetica")
            .fontSize(11)
            .fillColor("#475569")
            .text(column.label, cursor + 16, y + 15, { width: column.width - 32 });
        cursor += column.width;
    });

    let rowY = y + headerHeight;
    transactions.forEach(transaction => {
        doc.rect(x, rowY, width, rowHeight)
            .fillColor("#ffffff")
            .fill()
            .lineWidth(1)
            .strokeColor(colors.border)
            .stroke();

        const type = String(transaction.type || "").toLowerCase();
        const isIncome = type === "income";
        const amountColor = isIncome ? colors.income : colors.expense;
        const amount = `${isIncome ? "+" : "-"}${money(transaction.amount)}`;
        const values = [
            transaction.transaction_date || transaction.date || "—",
            transaction.title || transaction.description || "Transaction",
            transaction.category || "Other",
            type.toUpperCase() || "—",
            amount
        ];

        cursor = x;
        values.forEach((value, index) => {
            if (index === 3) {
                doc.roundedRect(cursor + 12, rowY + 12, 68, 22, 4)
                    .fillColor(isIncome ? "#dcfce7" : "#fee2e2")
                    .fill();
                doc.font("Helvetica-Bold")
                    .fontSize(9)
                    .fillColor(amountColor)
                    .text(value, cursor + 12, rowY + 19, { width: 68, align: "center" });
            } else {
                doc.font(index === 1 ? "Helvetica-Bold" : "Helvetica")
                    .fontSize(11)
                    .fillColor(index === 4 ? amountColor : (index === 0 ? colors.muted : "#334155"))
                    .text(value, cursor + 16, rowY + 15, {
                        width: columns[index].width - 32,
                        align: index === 4 ? "right" : "left"
                    });
            }
            cursor += columns[index].width;
        });
        rowY += rowHeight;
    });
};

const generatePDF = (report, res) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
    const contentWidth = doc.page.width - 80;
    const summary = report.summary || {};
    const income = Number(summary.income) || 0;
    const expense = Number(summary.expense) || 0;
    const netIncome = Number(summary.netIncome) || income - expense;
    const tax = Math.round(Math.max(0, income - expense) * 0.22);
    const gap = 20;
    const cardWidth = (contentWidth - gap * 3) / 4;

    doc.pipe(res);

    const headerY = 40;
    doc.roundedRect(40, headerY, 100, 55, 10).fillColor(colors.blue).fill();
    doc.font("Helvetica-Bold").fontSize(20).fillColor("#ffffff")
        .text("TaxPal", 57, headerY + 18);

    doc.font("Helvetica-Bold").fontSize(25).fillColor(colors.navy)
        .text("Income Statement", 161, headerY + 3);
    doc.font("Helvetica").fontSize(16).fillColor(colors.muted)
        .text(`Period: ${periodLabel(report.period)}`, 161, headerY + 39);

    doc.font("Helvetica").fontSize(12).fillColor("#475569")
        .text("User:", 610, headerY + 3, { width: 42, align: "right" })
        .text(report.userName || "TaxPal User", 657, headerY + 3, { width: 103 });
    doc.font("Helvetica").fontSize(12).fillColor("#475569")
        .text("Email:", 610, headerY + 27, { width: 42, align: "right" })
        .text(report.userEmail || "—", 657, headerY + 27, { width: 103 });
    doc.font("Helvetica").fontSize(12).fillColor("#475569")
        .text("Generated:", 590, headerY + 51, { width: 62, align: "right" })
        .text(new Date().toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit"
        }), 657, headerY + 51, { width: 103 });

    doc.moveTo(40, 140).lineTo(doc.page.width - 40, 140)
        .lineWidth(1.5).strokeColor(colors.blue).stroke();

    const cardsY = 171;
    drawCard(doc, 40, cardsY, cardWidth, "GROSS INCOME", money(income), colors.income);
    drawCard(doc, 40 + cardWidth + gap, cardsY, cardWidth, "TOTAL EXPENSES", money(expense), colors.expense);
    drawCard(doc, 40 + (cardWidth + gap) * 2, cardsY, cardWidth, "NET OPERATING INCOME", money(netIncome), colors.income);
    drawCard(doc, 40 + (cardWidth + gap) * 3, cardsY, cardWidth, "EST. TAX LIABILITY (22%)", money(tax), colors.tax);

    doc.font("Helvetica-Bold").fontSize(16).fillColor(colors.navy)
        .text("Itemized Transactions", 40, 354);
    doc.moveTo(40, 382).lineTo(doc.page.width - 40, 382)
        .lineWidth(1).strokeColor(colors.border).stroke();

    drawTable(doc, report.transactions || [], 40, 399, contentWidth);

    const footerY = Math.min(doc.page.height - 80, 399 + 45 + ((report.transactions || []).length * 45) + 40);
    doc.moveTo(40, footerY).lineTo(doc.page.width - 40, footerY)
        .lineWidth(1).strokeColor(colors.border).stroke();
    doc.font("Helvetica").fontSize(10).fillColor("#94a3b8")
        .text("Generated by TaxPal • Personal Finance & Tax Estimator for Freelancers", 40, footerY + 24, {
            width: contentWidth, align: "center"
        })
        .text("All values calculated based on recorded transactions and selected tax configurations.", 40, footerY + 43, {
            width: contentWidth, align: "center"
        });

    doc.end();
};

module.exports = { generatePDF };
