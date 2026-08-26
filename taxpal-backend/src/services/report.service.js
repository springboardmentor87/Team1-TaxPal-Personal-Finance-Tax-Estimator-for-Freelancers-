const PDFDocument = require('pdfkit');
const Report = require('../models/Report');
const Transaction = require('../models/Transaction');
const TaxEstimate = require('../models/TaxEstimate');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

class ReportService {
  static calculateDateRange(period, customStart, customEnd) {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    let periodStart;
    let periodEnd;
    let periodLabel = period || 'Current Month';

    switch (period) {
      case 'Current Month':
      case 'Monthly': {
        periodStart = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
        periodEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
        periodLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        break;
      }
      case 'Last Month': {
        const lastMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
        const lmYear = lastMonthDate.getUTCFullYear();
        const lmMonth = lastMonthDate.getUTCMonth();
        periodStart = new Date(Date.UTC(lmYear, lmMonth, 1, 0, 0, 0, 0));
        periodEnd = new Date(Date.UTC(lmYear, lmMonth + 1, 0, 23, 59, 59, 999));
        periodLabel = lastMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        break;
      }
      case 'Current Quarter':
      case 'Quarterly': {
        const quarterIndex = Math.floor(currentMonth / 3);
        const qStartMonth = quarterIndex * 3;
        periodStart = new Date(Date.UTC(currentYear, qStartMonth, 1, 0, 0, 0, 0));
        periodEnd = new Date(Date.UTC(currentYear, qStartMonth + 3, 0, 23, 59, 59, 999));
        periodLabel = `Q${quarterIndex + 1} ${currentYear}`;
        break;
      }
      case 'Last Quarter': {
        const currentQ = Math.floor(currentMonth / 3);
        let lastQ = currentQ - 1;
        let qYear = currentYear;
        if (lastQ < 0) {
          lastQ = 3;
          qYear -= 1;
        }
        const qStartMonth = lastQ * 3;
        periodStart = new Date(Date.UTC(qYear, qStartMonth, 1, 0, 0, 0, 0));
        periodEnd = new Date(Date.UTC(qYear, qStartMonth + 3, 0, 23, 59, 59, 999));
        periodLabel = `Q${lastQ + 1} ${qYear}`;
        break;
      }
      case 'Year to Date':
      case 'YTD': {
        periodStart = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
        periodEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
        periodLabel = `YTD ${currentYear}`;
        break;
      }
      case 'Annual':
      case 'Full Year': {
        periodStart = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
        periodEnd = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
        periodLabel = `Annual ${currentYear}`;
        break;
      }
      case 'Custom Range':
      case 'Custom': {
        if (!customStart || !customEnd) {
          periodStart = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
          periodEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
          periodLabel = 'Custom Range';
        } else {
          periodStart = new Date(customStart);
          periodStart.setUTCHours(0, 0, 0, 0);
          periodEnd = new Date(customEnd);
          periodEnd.setUTCHours(23, 59, 59, 999);
          periodLabel = `${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`;
        }
        break;
      }
      default: {
        periodStart = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
        periodEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
        periodLabel = period || 'Current Period';
        break;
      }
    }

    return { periodStart, periodEnd, periodLabel };
  }

  static async generateReport(userId, input) {
    const reportType = input.reportType || input.type || 'Income Statement';
    const period = input.period || 'Current Month';
    const format = (input.format || 'PDF').toUpperCase();
    const { periodStart, periodEnd, periodLabel } = this.calculateDateRange(period, input.startDate, input.endDate);

    const allTransactions = await Transaction.findByUserId(userId);
    const transactions = allTransactions.filter((t) => {
      const d = new Date(t.transactionDate || t.createdAt);
      return !isNaN(d.getTime()) && d >= periodStart && d <= periodEnd;
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const expenseCategoryTotals = {};
    const incomeCategoryTotals = {};
    const monthlyMap = {};

    transactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      const txDate = new Date(tx.transactionDate || tx.createdAt);
      const monthKey = !isNaN(txDate.getTime())
        ? txDate.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
        : 'Current';

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { income: 0, expenses: 0 };
      }

      if (String(tx.type).toLowerCase() === 'income') {
        totalIncome += amount;
        monthlyMap[monthKey].income += amount;

        const cat = tx.category || 'General';
        if (!incomeCategoryTotals[cat]) incomeCategoryTotals[cat] = { amount: 0, count: 0 };
        incomeCategoryTotals[cat].amount += amount;
        incomeCategoryTotals[cat].count += 1;
      } else {
        totalExpenses += amount;
        monthlyMap[monthKey].expenses += amount;

        const cat = tx.category || 'General';
        if (!expenseCategoryTotals[cat]) expenseCategoryTotals[cat] = { amount: 0, count: 0 };
        expenseCategoryTotals[cat].amount += amount;
        expenseCategoryTotals[cat].count += 1;
      }
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round(((netSavings / totalIncome) * 100) * 100) / 100 : 0;

    const categoryBreakdown = Object.entries(expenseCategoryTotals)
      .map(([category, info]) => ({
        category,
        amount: info.amount,
        percentage: totalExpenses > 0 ? Math.round((info.amount / totalExpenses) * 1000) / 10 : 0,
        count: info.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    const incomeCategoryBreakdown = Object.entries(incomeCategoryTotals)
      .map(([category, info]) => ({
        category,
        amount: info.amount,
        percentage: totalIncome > 0 ? Math.round((info.amount / totalIncome) * 1000) / 10 : 0,
        count: info.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    const monthlyBreakdown = Object.entries(monthlyMap).map(([month, stats]) => ({
      month,
      income: stats.income,
      expenses: stats.expenses,
      netSavings: stats.income - stats.expenses,
    }));

    // Estimated tax calculation integration for Tax Summaries
    let estimatedTax = 0;
    try {
      const taxRecords = await TaxEstimate.findByUserId(userId);
      if (taxRecords && taxRecords.length > 0) {
        estimatedTax = Number(taxRecords[0].estimatedTax) || 0;
      }
    } catch (e) {
      console.warn('Could not fetch tax estimate for report:', e.message);
    }

    const reportData = {
      reportType,
      totalIncome,
      totalExpenses,
      netSavings,
      estimatedTax,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      categoryBreakdown,
      incomeCategoryBreakdown,
      monthlyBreakdown,
      transactionCount: transactions.length,
      savingsRate,
      recentTransactions: transactions.slice(0, 50).map((t) => ({
        id: t.id,
        date: t.transactionDate || t.createdAt,
        description: t.description,
        category: t.category,
        type: t.type,
        amount: Number(t.amount) || 0,
      })),
    };

    return await Report.create({
      userId,
      type: reportType,
      title: `${reportType} (${periodLabel})`,
      period: periodLabel,
      format,
      data: reportData,
      summary: `Total Income: ${totalIncome.toFixed(2)}, Total Expenses: ${totalExpenses.toFixed(2)}, Net Savings: ${netSavings.toFixed(2)}`,
    });
  }

  static async getReports(userId) {
    return await Report.findByUserId(userId);
  }

  static async getReportById(userId, reportId) {
    const report = await Report.findById(reportId, userId);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }
    return report;
  }

  static async deleteReport(userId, reportId) {
    const deleted = await Report.deleteById(reportId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Report not found');
    }
    return true;
  }

  static generateCSV(report) {
    const lines = [];
    const rType = report.reportType || report.type || 'Financial Report';
    const period = report.period || 'N/A';
    const data = typeof report.data === 'string' ? JSON.parse(report.data || '{}') : report.data || {};

    lines.push(`"TAXPAL FINANCIAL REPORT"`);
    lines.push(`"Report Type:","${rType}"`);
    lines.push(`"Period:","${period}"`);
    lines.push(`"Generated At:","${report.generatedAt || new Date().toISOString()}"`);
    lines.push(``);
    lines.push(`"EXECUTIVE SUMMARY"`);
    lines.push(`"Metric","Amount"`);
    lines.push(`"Total Gross Income",${Number(report.totalIncome || 0).toFixed(2)}`);
    lines.push(`"Total Expenses",${Number(report.totalExpenses || 0).toFixed(2)}`);
    lines.push(`"Net Savings / Profit",${Number(report.netSavings || 0).toFixed(2)}`);
    lines.push(`"Savings Rate",${data.savingsRate || 0}%`);
    lines.push(``);

    const catBreakdown = data.categoryBreakdown || [];
    if (catBreakdown.length > 0) {
      lines.push(`"EXPENSE BREAKDOWN BY CATEGORY"`);
      lines.push(`"Category","Amount","Share (%)","Transactions Count"`);
      catBreakdown.forEach((cat) => {
        lines.push(`"${cat.category}",${Number(cat.amount).toFixed(2)},${cat.percentage}%,${cat.count}`);
      });
      lines.push(``);
    }

    const incBreakdown = data.incomeCategoryBreakdown || [];
    if (incBreakdown.length > 0) {
      lines.push(`"INCOME BREAKDOWN BY CATEGORY"`);
      lines.push(`"Category","Amount","Share (%)","Transactions Count"`);
      incBreakdown.forEach((cat) => {
        lines.push(`"${cat.category}",${Number(cat.amount).toFixed(2)},${cat.percentage}%,${cat.count}`);
      });
      lines.push(``);
    }

    const txs = data.recentTransactions || [];
    if (txs.length > 0) {
      lines.push(`"DETAILED TRANSACTIONS LEDGER"`);
      lines.push(`"Date","Description","Type","Category","Amount"`);
      txs.forEach((tx) => {
        const d = String(tx.date || '').split('T')[0];
        lines.push(`"${d}","${(tx.description || '').replace(/"/g, '""')}","${tx.type}","${tx.category}",${Number(tx.amount).toFixed(2)}`);
      });
    }

    return Buffer.from(lines.join('\n'), 'utf-8');
  }

  static async generatePDF(report, userName = 'Freelancer') {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const rType = report.reportType || report.type || 'Financial Report';
        const period = report.period || 'All';
        const data = typeof report.data === 'string' ? JSON.parse(report.data || '{}') : report.data || {};

        // Top Corporate Header Banner
        doc.rect(40, 40, 515, 60).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('TaxPal Financial Report', 55, 50);
        doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').text(`Generated for ${userName} | ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, 55, 75);

        // Report Meta Card
        let y = 115;
        doc.rect(40, y, 515, 45).fill('#f8fafc');
        doc.rect(40, y, 515, 45).stroke('#e2e8f0');
        doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold');
        doc.text('Report Type: ', 55, y + 10, { continued: true }).font('Helvetica').fillColor('#334155').text(rType);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text('Period: ', 55, y + 25, { continued: true }).font('Helvetica').fillColor('#334155').text(period);

        // Executive Summary KPI Grid (3 Columns)
        y = 175;
        const boxWidth = 165;
        const boxHeight = 55;

        // Income Box
        doc.rect(40, y, boxWidth, boxHeight).fill('#ecfdf5');
        doc.rect(40, y, boxWidth, boxHeight).stroke('#a7f3d0');
        doc.fillColor('#065f46').fontSize(8.5).font('Helvetica-Bold').text('TOTAL GROSS INCOME', 50, y + 10);
        doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text(`$${Number(report.totalIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 50, y + 26);

        // Expenses Box
        doc.rect(215, y, boxWidth, boxHeight).fill('#fff1f2');
        doc.rect(215, y, boxWidth, boxHeight).stroke('#fecdd3');
        doc.fillColor('#9f1239').fontSize(8.5).font('Helvetica-Bold').text('TOTAL EXPENDITURES', 225, y + 10);
        doc.fillColor('#e11d48').fontSize(14).font('Helvetica-Bold').text(`$${Number(report.totalExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 225, y + 26);

        // Net Savings Box
        doc.rect(390, y, boxWidth, boxHeight).fill('#eff6ff');
        doc.rect(390, y, boxWidth, boxHeight).stroke('#bfdbfe');
        doc.fillColor('#1e40af').fontSize(8.5).font('Helvetica-Bold').text('NET SAVINGS / PROFIT', 400, y + 10);
        doc.fillColor('#2563eb').fontSize(14).font('Helvetica-Bold').text(`$${Number(report.netSavings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 400, y + 26);

        y += 75;

        // Expense Category Breakdown Section
        const catBreakdown = data.categoryBreakdown || [];
        if (catBreakdown.length > 0) {
          doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('Expense Breakdown by Category', 40, y);
          y += 18;

          // Table Header
          doc.rect(40, y, 515, 20).fill('#1e293b');
          doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
          doc.text('Category', 50, y + 5, { width: 200 });
          doc.text('Transactions', 260, y + 5, { width: 80, align: 'center' });
          doc.text('Amount ($)', 350, y + 5, { width: 90, align: 'right' });
          doc.text('Share (%)', 450, y + 5, { width: 95, align: 'right' });
          y += 20;

          catBreakdown.slice(0, 10).forEach((cat, idx) => {
            const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            doc.rect(40, y, 515, 18).fill(rowBg);
            doc.fillColor('#334155').fontSize(8.5).font('Helvetica');
            doc.text(cat.category, 50, y + 4, { width: 200 });
            doc.text(String(cat.count || 1), 260, y + 4, { width: 80, align: 'center' });
            doc.text(`$${Number(cat.amount).toFixed(2)}`, 350, y + 4, { width: 90, align: 'right' });
            doc.text(`${cat.percentage}%`, 450, y + 4, { width: 95, align: 'right' });
            y += 18;
          });
          y += 20;
        }

        // Detailed Transactions Section
        const txs = data.recentTransactions || [];
        if (txs.length > 0 && y < 650) {
          doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('Recent Recorded Transactions', 40, y);
          y += 18;

          doc.rect(40, y, 515, 20).fill('#334155');
          doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
          doc.text('Date', 50, y + 5, { width: 75 });
          doc.text('Description', 130, y + 5, { width: 170 });
          doc.text('Category', 305, y + 5, { width: 90 });
          doc.text('Type', 400, y + 5, { width: 50 });
          doc.text('Amount', 460, y + 5, { width: 85, align: 'right' });
          y += 20;

          const limit = Math.min(txs.length, 12);
          for (let i = 0; i < limit; i++) {
            if (y > 740) {
              doc.addPage();
              y = 40;
            }
            const tx = txs[i];
            const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
            doc.rect(40, y, 515, 18).fill(rowBg);
            doc.fillColor('#334155').fontSize(8).font('Helvetica');
            const d = String(tx.date || '').split('T')[0];
            doc.text(d, 50, y + 4, { width: 75 });
            doc.text(tx.description || 'Transaction', 130, y + 4, { width: 170 });
            doc.text(tx.category || 'General', 305, y + 4, { width: 90 });
            
            const isInc = String(tx.type).toLowerCase() === 'income';
            doc.fillColor(isInc ? '#059669' : '#e11d48').font('Helvetica-Bold');
            doc.text(tx.type || 'Expense', 400, y + 4, { width: 50 });
            doc.text(`${isInc ? '+' : '-'}$${Number(tx.amount).toFixed(2)}`, 460, y + 4, { width: 85, align: 'right' });
            y += 18;
          }
        }

        // Footer
        doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('Generated by TaxPal - Personal Finance & Tax Estimator for Freelancers', 40, 780, { align: 'center', width: 515 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = {
  ReportService,
};
