export type ReportType = 'Income Statement' | 'Expense Breakdown' | 'Tax Summary' | 'Cash Flow Summary';

export type ReportPeriod =
    | 'Current Month'
    | 'Last Month'
    | 'Q1 2025'
    | 'Q2 2025'
    | 'Q3 2025'
    | 'Q4 2025'
    | 'Year 2025'
    | 'Custom Range';

export type ReportFormat = 'PDF' | 'CSV';

export interface CategoryBreakdownItem {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
}

export interface PeriodFinancialBreakdown {
    label: string;
    income: number;
    expenses: number;
    netIncome: number;
    savingsRate: number;
}

export interface ReportData {
    reportType: ReportType;
    period: string;
    startDate: string;
    endDate: string;
    generatedDate: string;
    userName: string;
    userEmail: string;
    currencySymbol: string;

    // High-level figures
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    savingsRate: number;

    // Tax estimations
    estimatedTax: number;
    effectiveTaxRate: number;
    taxDeductions: number;

    // Breakdowns
    incomeCategories: CategoryBreakdownItem[];
    expenseCategories: CategoryBreakdownItem[];
    periodBreakdowns: PeriodFinancialBreakdown[];
    transactions: {
        id: string;
        date: string;
        description: string;
        category: string;
        type: 'income' | 'expense';
        amount: number;
    }[];
}

export interface GeneratedReport {
    id: string;
    name: string;
    reportType: ReportType;
    period: string;
    format: ReportFormat;
    createdAt: string;
    filePath?: string;
    data: ReportData;
}