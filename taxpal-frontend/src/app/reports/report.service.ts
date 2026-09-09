import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthService } from '../auth/auth.service';
import { CurrencyService } from '../shared/currency.service';
import { Transaction } from '../transactions/transaction.model';

import {
    GeneratedReport,
    ReportData,
    ReportFormat,
    ReportPeriod,
    ReportType,
    CategoryBreakdownItem,
    PeriodFinancialBreakdown
} from './report.model';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    private readonly API_URL =
        'http://localhost:8080/api/reports';

    private reportsSubject =
        new BehaviorSubject<GeneratedReport[]>([]);

    public reports$: Observable<GeneratedReport[]> =
        this.reportsSubject.asObservable();

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private currencyService: CurrencyService
    ) {
        this.authService.currentUser$.subscribe(user => {

            if (user) {
                this.loadReports();
            } else {
                this.reportsSubject.next([]);
            }

        });
    }

    // ============================================================
    // AUTH HEADERS
    // ============================================================

    private getAuthHeaders(): HttpHeaders {

        const token = this.authService.getToken();

        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set(
                'Authorization',
                `Bearer ${token}`
            );
        }

        return headers;
    }

    // ============================================================
    // LOAD RECENT REPORTS
    // GET /api/reports
    // ============================================================

    public loadReports(): void {

        const headers = this.getAuthHeaders();

        this.http.get<any>(
            this.API_URL,
            { headers }
        ).subscribe({

            next: (res) => {

                let list: any[] = [];

                if (Array.isArray(res)) {
                    list = res;
                }
                else if (
                    res &&
                    Array.isArray(res.reports)
                ) {
                    list = res.reports;
                }
                else if (
                    res &&
                    Array.isArray(res.data)
                ) {
                    list = res.data;
                }

                const mapped: GeneratedReport[] =
                    list.map((item: any) => {

                        const reportType =
                            this.normalizeReportType(
                                item.report_type
                            );

                        const period =
                            item.period ||
                            'Current Month';

                        const format =
                            this.normalizeFormat(
                                item.format
                            );

                        return {
                            id: item.id
                                ? String(item.id)
                                : 'rep_' + Date.now(),

                            name:
                                item.name ||
                                `${reportType} - ${period}`,

                            reportType,

                            period,

                            format,

                            createdAt:
                                item.created_at ||
                                new Date().toISOString(),

                            filePath:
                                item.file_path || undefined,

                            data:
                                item.data ||
                                this.createEmptyReportData(
                                    reportType,
                                    period
                                )
                        };
                    });

                this.reportsSubject.next(mapped);
            },

            error: (error) => {

                console.error(
                    'Error loading reports:',
                    error
                );

            }
        });
    }

    // ============================================================
    // GENERATE REPORT DATA
    // ============================================================

    public generateReport(
        reportType: ReportType,
        period: ReportPeriod,
        format: ReportFormat,
        customStart?: string,
        customEnd?: string,
        allTransactions: Transaction[] = []
    ): GeneratedReport {

        const currentUser =
            this.authService.getCurrentUserValue();

        const currency =
            this.currencyService.currentSymbol || '₹';

        const dateRange =
            this.calculateDateRange(
                period,
                customStart,
                customEnd
            );

        const startDate =
            dateRange.startDate;

        const endDate =
            dateRange.endDate;

        const periodLabel =
            dateRange.periodLabel;

        // --------------------------------------------------------
        // FILTER TRANSACTIONS
        // --------------------------------------------------------

        const filteredTransactions =
            allTransactions.filter(transaction => {

                if (!transaction.date) {
                    return false;
                }

                const transactionTime =
                    new Date(
                        transaction.date
                    ).getTime();

                return (
                    transactionTime >=
                    startDate.getTime()
                ) &&
                    (
                        transactionTime <=
                        endDate.getTime()
                    );
            });

        // --------------------------------------------------------
        // TOTALS
        // --------------------------------------------------------

        let totalIncome = 0;
        let totalExpenses = 0;

        const incomeMap =
            new Map<
                string,
                {
                    amount: number;
                    count: number;
                }
            >();

        const expenseMap =
            new Map<
                string,
                {
                    amount: number;
                    count: number;
                }
            >();

        filteredTransactions.forEach(transaction => {

            const amount =
                Number(transaction.amount) || 0;

            const category =
                transaction.category || 'Other';

            if (
                transaction.type === 'income'
            ) {

                totalIncome += amount;

                const existing =
                    incomeMap.get(category) || {
                        amount: 0,
                        count: 0
                    };

                incomeMap.set(
                    category,
                    {
                        amount:
                            existing.amount + amount,

                        count:
                            existing.count + 1
                    }
                );

            }
            else {

                totalExpenses += amount;

                const existing =
                    expenseMap.get(category) || {
                        amount: 0,
                        count: 0
                    };

                expenseMap.set(
                    category,
                    {
                        amount:
                            existing.amount + amount,

                        count:
                            existing.count + 1
                    }
                );
            }
        });

        // --------------------------------------------------------
        // NET INCOME
        // --------------------------------------------------------

        const netIncome =
            totalIncome - totalExpenses;

        const savingsRate =
            totalIncome > 0
                ? (
                    netIncome /
                    totalIncome
                ) * 100
                : 0;

        // --------------------------------------------------------
        // INCOME CATEGORY BREAKDOWN
        // --------------------------------------------------------

        const incomeCategories:
            CategoryBreakdownItem[] =
            Array.from(
                incomeMap.entries()
            )
                .map(([category, data]) => {

                    return {
                        category,

                        amount:
                            data.amount,

                        percentage:
                            totalIncome > 0
                                ? (
                                    data.amount /
                                    totalIncome
                                ) * 100
                                : 0,

                        transactionCount:
                            data.count
                    };

                })
                .sort(
                    (a, b) =>
                        b.amount - a.amount
                );

        // --------------------------------------------------------
        // EXPENSE CATEGORY BREAKDOWN
        // --------------------------------------------------------

        const expenseCategories:
            CategoryBreakdownItem[] =
            Array.from(
                expenseMap.entries()
            )
                .map(([category, data]) => {

                    return {
                        category,

                        amount:
                            data.amount,

                        percentage:
                            totalExpenses > 0
                                ? (
                                    data.amount /
                                    totalExpenses
                                ) * 100
                                : 0,

                        transactionCount:
                            data.count
                    };

                })
                .sort(
                    (a, b) =>
                        b.amount - a.amount
                );

        // --------------------------------------------------------
        // PERIOD BREAKDOWN
        // --------------------------------------------------------

        const periodBreakdowns =
            this.buildPeriodBreakdowns(
                filteredTransactions,
                startDate,
                endDate
            );

        // --------------------------------------------------------
        // TAX CALCULATION
        // --------------------------------------------------------

        const deductibleExpenses =
            expenseCategories
                .filter(category =>
                    ![
                        'Groceries',
                        'Personal',
                        'Entertainment'
                    ].includes(
                        category.category
                    )
                )
                .reduce(
                    (total, category) =>
                        total + category.amount,
                    0
                );

        const taxableProfit =
            Math.max(
                0,
                totalIncome -
                deductibleExpenses
            );

        const estimatedTax =
            Math.round(
                taxableProfit * 0.22
            );

        const effectiveTaxRate =
            totalIncome > 0
                ? (
                    estimatedTax /
                    totalIncome
                ) * 100
                : 0;

        // --------------------------------------------------------
        // REPORT DATA
        // --------------------------------------------------------

        const reportData: ReportData = {

            reportType,

            period:
                periodLabel,

            startDate:
                startDate
                    .toISOString()
                    .split('T')[0],

            endDate:
                endDate
                    .toISOString()
                    .split('T')[0],

            generatedDate:
                new Date().toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                ),

            userName:
                currentUser?.name ||
                currentUser?.username ||
                'User',

            userEmail:
                currentUser?.email || '',

            currencySymbol:
                currency,

            totalIncome,

            totalExpenses,

            netIncome,

            savingsRate:
                Math.max(
                    0,
                    savingsRate
                ),

            estimatedTax,

            effectiveTaxRate,

            taxDeductions:
                deductibleExpenses,

            incomeCategories,

            expenseCategories,

            periodBreakdowns,

            transactions:
                filteredTransactions.map(
                    transaction => ({

                        id:
                            String(
                                transaction.id
                            ),

                        date:
                            transaction.date,

                        description:
                            transaction.description ||
                            '',

                        category:
                            transaction.category ||
                            'Other',

                        type:
                            transaction.type,

                        amount:
                            Number(
                                transaction.amount
                            ) || 0
                    })
                )
        };

        // --------------------------------------------------------
        // CREATE FRONTEND REPORT
        // --------------------------------------------------------

        const newReport:
            GeneratedReport = {

            id:
                'rep_' +
                Date.now(),

            name:
                `${reportType} - ${periodLabel}`,

            reportType,

            period:
                periodLabel,

            format,

            createdAt:
                new Date().toISOString(),

            data:
                reportData
        };

        // --------------------------------------------------------
        // SAVE REPORT TO BACKEND
        //
        // IMPORTANT:
        // Backend route is POST /api/reports/
        // NOT /api/reports/add
        // --------------------------------------------------------

        const payload = {

            period:
                this.convertPeriodForBackend(
                    period,
                    periodLabel
                ),

            report_type:
                this.convertReportTypeForBackend(
                    reportType
                ),

            file_path:
                null
        };

        this.http.post<any>(
            `${this.API_URL}/`,
            payload,
            {
                headers:
                    this.getAuthHeaders()
            }
        ).subscribe({

            next: (response) => {

                if (
                    response &&
                    response.report &&
                    response.report.id
                ) {

                    newReport.id =
                        String(
                            response.report.id
                        );

                }
                else if (
                    response &&
                    response.id
                ) {

                    newReport.id =
                        String(
                            response.id
                        );
                }

                this.loadReports();
            },

            error: (error) => {

                console.warn(
                    'Could not save report to backend:',
                    error
                );

            }
        });

        // --------------------------------------------------------
        // UPDATE UI IMMEDIATELY
        // --------------------------------------------------------

        const currentReports =
            this.reportsSubject.value;

        const updatedReports =
            [
                newReport,
                ...currentReports.filter(
                    report =>
                        report.name !==
                        newReport.name
                )
            ];

        this.reportsSubject.next(
            updatedReports
        );

        return newReport;
    }

    // ============================================================
    // DATE RANGE
    // ============================================================

    private calculateDateRange(
        period: ReportPeriod,
        customStart?: string,
        customEnd?: string
    ): {
        startDate: Date;
        endDate: Date;
        periodLabel: string;
    } {

        const now = new Date();

        const currentYear =
            now.getFullYear();

        const currentMonth =
            now.getMonth();

        let startDate: Date;
        let endDate: Date;

        // IMPORTANT:
        // periodLabel is STRING.
        // Never use ReportPeriod here.
        let periodLabel: string =
            String(period);

        switch (period) {

            case 'Current Month':

                startDate =
                    new Date(
                        currentYear,
                        currentMonth,
                        1
                    );

                endDate =
                    new Date(
                        currentYear,
                        currentMonth + 1,
                        0,
                        23,
                        59,
                        59
                    );

                periodLabel =
                    now.toLocaleString(
                        'en-US',
                        {
                            month: 'long',
                            year: 'numeric'
                        }
                    );

                break;

            case 'Last Month':

                startDate =
                    new Date(
                        currentYear,
                        currentMonth - 1,
                        1
                    );

                endDate =
                    new Date(
                        currentYear,
                        currentMonth,
                        0,
                        23,
                        59,
                        59
                    );

                periodLabel =
                    new Date(
                        currentYear,
                        currentMonth - 1,
                        1
                    ).toLocaleString(
                        'en-US',
                        {
                            month: 'long',
                            year: 'numeric'
                        }
                    );

                break;

            case 'Q1 2025':

                startDate =
                    new Date(
                        2025,
                        0,
                        1
                    );

                endDate =
                    new Date(
                        2025,
                        2,
                        31,
                        23,
                        59,
                        59
                    );

                periodLabel =
                    'Q1 2025 (Jan - Mar)';

                break;

            case 'Q2 2025':

                startDate =
                    new Date(
                        2025,
                        3,
                        1
                    );

                endDate =
                    new Date(
                        2025,
                        5,
                        30,
                        23,
                        59,
                        59
                    );

                periodLabel =
                    'Q2 2025 (Apr - Jun)';

                break;

            case 'Q3 2025':

                startDate =
                    new Date(
                        2025,
                        6,
                        1
                    );

                endDate =
                    new Date(
                        2025,
                        8,
                        30,
                        23,
                        59,
                        59
                    );

                periodLabel =
                    'Q3 2025 (Jul - Sep)';

                break;

            case 'Q4 2025':

                startDate =
                    new Date(
                        2025,
                        9,
                        1
                    );

                endDate =
                    new Date(
                        2025,
                        11,
                        31,
                        23,
                        59,
                        59
                    );

                periodLabel =
                    'Q4 2025 (Oct - Dec)';

                break;

            case 'Year 2025':

                startDate =
                    new Date(
                        2025,
                        0,
                        1
                    );

                endDate =
                    new Date(
                        2025,
                        11,
                        31,
                        23,
                        59,
                        59
                    );

                periodLabel =
                    'Full Year 2025';

                break;

            case 'Custom Range':

                startDate =
                    customStart
                        ? new Date(
                            customStart +
                            'T00:00:00'
                        )
                        : new Date(
                            currentYear,
                            0,
                            1
                        );

                endDate =
                    customEnd
                        ? new Date(
                            customEnd +
                            'T23:59:59'
                        )
                        : new Date(
                            currentYear,
                            11,
                            31,
                            23,
                            59,
                            59
                        );

                periodLabel =
                    `${startDate.toLocaleDateString(
                        'en-US',
                        {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }
                    )} - ${endDate.toLocaleDateString(
                        'en-US',
                        {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }
                    )}`;

                break;

            default:

                startDate =
                    new Date(
                        currentYear,
                        0,
                        1
                    );

                endDate =
                    new Date(
                        currentYear,
                        11,
                        31,
                        23,
                        59,
                        59
                    );

                periodLabel =
                    'Year ' +
                    currentYear;
        }

        return {
            startDate,
            endDate,
            periodLabel
        };
    }

    // ============================================================
    // PERIOD BREAKDOWN
    // ============================================================

    private buildPeriodBreakdowns(
        transactions: Transaction[],
        start: Date,
        end: Date
    ): PeriodFinancialBreakdown[] {

        const monthMap =
            new Map<
                string,
                {
                    income: number;
                    expenses: number;
                }
            >();

        transactions.forEach(transaction => {

            if (!transaction.date) {
                return;
            }

            const date =
                new Date(
                    transaction.date
                );

            if (
                date < start ||
                date > end
            ) {
                return;
            }

            const key =
                date.toLocaleString(
                    'en-US',
                    {
                        month: 'short',
                        year: 'numeric'
                    }
                );

            const current =
                monthMap.get(key) || {
                    income: 0,
                    expenses: 0
                };

            const amount =
                Number(
                    transaction.amount
                ) || 0;

            if (
                transaction.type ===
                'income'
            ) {

                current.income +=
                    amount;

            }
            else {

                current.expenses +=
                    amount;
            }

            monthMap.set(
                key,
                current
            );
        });

        const result:
            PeriodFinancialBreakdown[] = [];

        monthMap.forEach(
            (value, key) => {

                const netIncome =
                    value.income -
                    value.expenses;

                const savingsRate =
                    value.income > 0
                        ? (
                            netIncome /
                            value.income
                        ) * 100
                        : 0;

                result.push({

                    label:
                        key,

                    income:
                        value.income,

                    expenses:
                        value.expenses,

                    netIncome,

                    savingsRate:
                        Math.max(
                            0,
                            savingsRate
                        )
                });
            }
        );

        return result;
    }

    // ============================================================
    // DOWNLOAD PDF
    // GET /api/reports/export/pdf
    // ============================================================

    public downloadPdf(
        params: {
            month?: string;
            year?: number;
            quarter?: string;
        }
    ): Observable<Blob> {

        let httpParams =
            new URLSearchParams();

        if (params.month) {

            httpParams.set(
                'month',
                params.month
            );
        }

        if (params.year) {

            httpParams.set(
                'year',
                String(params.year)
            );
        }

        if (params.quarter) {

            httpParams.set(
                'quarter',
                params.quarter
            );
        }

        let requestParams: any = {};

        httpParams.forEach(
            (value, key) => {
                requestParams[key] =
                    value;
            }
        );

        return this.http.get(
            `${this.API_URL}/export/pdf`,
            {
                headers:
                    this.getAuthHeaders(),

                params:
                    requestParams,

                responseType:
                    'blob'
            }
        );
    }

    // ============================================================
    // DOWNLOAD CSV
    // GET /api/reports/export/csv
    // ============================================================

    public downloadCsv(
        params: {
            month?: string;
            year?: number;
            quarter?: string;
        }
    ): Observable<Blob> {

        let httpParams =
            new URLSearchParams();

        if (params.month) {

            httpParams.set(
                'month',
                params.month
            );
        }

        if (params.year) {

            httpParams.set(
                'year',
                String(params.year)
            );
        }

        if (params.quarter) {

            httpParams.set(
                'quarter',
                params.quarter
            );
        }

        let requestParams: any = {};

        httpParams.forEach(
            (value, key) => {
                requestParams[key] =
                    value;
            }
        );

        return this.http.get(
            `${this.API_URL}/export/csv`,
            {
                headers:
                    this.getAuthHeaders(),

                params:
                    requestParams,

                responseType:
                    'blob'
            }
        );
    }

    // ============================================================
    // DOWNLOAD EXISTING REPORT
    // ============================================================

    public downloadExistingReport(
        report: GeneratedReport
    ): Observable<Blob> {

        if (!report.id) {

            throw new Error(
                'Report ID is required'
            );
        }

        /*
         * Your backend currently has:
         *
         * GET /api/reports/:id
         *
         * but it does NOT have:
         *
         * GET /api/reports/:id/download
         *
         * Therefore existing reports should be downloaded
         * through the export endpoint.
         */

        const params =
            this.getBackendPeriodParams(
                report.period
            );

        if (
            report.format === 'CSV'
        ) {

            return this.downloadCsv(
                params
            );
        }

        return this.downloadPdf(
            params
        );
    }

    // ============================================================
    // DELETE REPORT
    // ============================================================

    public deleteReport(
        id: string
    ): void {

        const headers =
            this.getAuthHeaders();

        this.http.delete(
            `${this.API_URL}/${id}`,
            {
                headers
            }
        ).subscribe({

            next: () => {

                const updated =
                    this.reportsSubject.value
                        .filter(
                            report =>
                                report.id !== id
                        );

                this.reportsSubject.next(
                    updated
                );
            },

            error: (error) => {

                console.warn(
                    'Could not delete report:',
                    error
                );

            }
        });
    }

    // ============================================================
    // CREATE EMPTY REPORT DATA
    // ============================================================

    private createEmptyReportData(
        reportType: ReportType,
        period: string
    ): ReportData {

        return {

            reportType:
                reportType ||
                'Income Statement',

            period:
                period ||
                'Current Month',

            startDate:
                '',

            endDate:
                '',

            generatedDate:
                new Date().toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }
                ),

            userName:
                'User',

            userEmail:
                '',

            currencySymbol:
                this.currencyService
                    .currentSymbol || '₹',

            totalIncome:
                0,

            totalExpenses:
                0,

            netIncome:
                0,

            savingsRate:
                0,

            estimatedTax:
                0,

            effectiveTaxRate:
                0,

            taxDeductions:
                0,

            incomeCategories:
                [],

            expenseCategories:
                [],

            periodBreakdowns:
                [],

            transactions:
                []
        };
    }

    // ============================================================
    // NORMALIZE REPORT TYPE
    // ============================================================

    private normalizeReportType(
        value: any
    ): ReportType {

        const allowed:
            ReportType[] = [

                'Income Statement',
                'Expense Breakdown',
                'Tax Summary',
                'Cash Flow Summary'
            ];

        if (
            allowed.includes(value)
        ) {
            return value;
        }

        return 'Income Statement';
    }

    // ============================================================
    // NORMALIZE FORMAT
    // ============================================================

    private normalizeFormat(
        value: any
    ): ReportFormat {

        return String(value)
            .toUpperCase() === 'CSV'
            ? 'CSV'
            : 'PDF';
    }

    // ============================================================
    // BACKEND REPORT TYPE
    // ============================================================

    private convertReportTypeForBackend(
        reportType: ReportType
    ): string {

        return reportType;
    }

    // ============================================================
    // BACKEND PERIOD
    // ============================================================

    private convertPeriodForBackend(
        period: ReportPeriod,
        periodLabel: string
    ): string {

        /*
         * Backend accepts:
         *
         * Monthly:
         * YYYY-MM
         *
         * Quarterly:
         * Q1 / Q2 / Q3 / Q4 + year
         */

        const now =
            new Date();

        if (
            period ===
            'Current Month'
        ) {

            return (
                `${now.getFullYear()}-` +
                `${String(
                    now.getMonth() + 1
                ).padStart(2, '0')}`
            );
        }

        if (
            period ===
            'Last Month'
        ) {

            const date =
                new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1
                );

            return (
                `${date.getFullYear()}-` +
                `${String(
                    date.getMonth() + 1
                ).padStart(2, '0')}`
            );
        }

        if (
            period.startsWith('Q1')
        ) {

            return `${this.extractYear(period)}-Q1`;
        }

        if (
            period.startsWith('Q2')
        ) {

            return `${this.extractYear(period)}-Q2`;
        }

        if (
            period.startsWith('Q3')
        ) {

            return `${this.extractYear(period)}-Q3`;
        }

        if (
            period.startsWith('Q4')
        ) {

            return `${this.extractYear(period)}-Q4`;
        }

        if (
            period ===
            'Year 2025'
        ) {

            return '2025';
        }

        return periodLabel;
    }

    // ============================================================
    // EXTRACT YEAR
    // ============================================================

    private extractYear(
        period: string
    ): number {

        const match =
            period.match(
                /\d{4}/
            );

        if (match) {

            return Number(
                match[0]
            );
        }

        return new Date()
            .getFullYear();
    }

    // ============================================================
    // CONVERT EXISTING PERIOD TO BACKEND PARAMS
    // ============================================================

    private getBackendPeriodParams(
        period: string
    ): {
        month?: string;
        year?: number;
        quarter?: string;
    } {

        // YYYY-MM
        if (
            /^\d{4}-\d{2}$/.test(
                period
            )
        ) {

            return {
                month:
                    period
            };
        }

        // YYYY-Q1
        const quarterMatch =
            period.match(
                /^(\d{4})-(Q[1-4])$/
            );

        if (quarterMatch) {

            return {

                year:
                    Number(
                        quarterMatch[1]
                    ),

                quarter:
                    quarterMatch[2]
            };
        }

        // Current Month
        if (
            period ===
            'Current Month'
        ) {

            const now =
                new Date();

            return {

                month:
                    `${now.getFullYear()}-` +
                    `${String(
                        now.getMonth() + 1
                    ).padStart(2, '0')}`
            };
        }

        // Last Month
        if (
            period ===
            'Last Month'
        ) {

            const date =
                new Date();

            date.setMonth(
                date.getMonth() - 1
            );

            return {

                month:
                    `${date.getFullYear()}-` +
                    `${String(
                        date.getMonth() + 1
                    ).padStart(2, '0')}`
            };
        }

        // Q1 2025 etc.
        const match =
            period.match(
                /^Q([1-4])\s+(\d{4})/
            );

        if (match) {

            return {

                year:
                    Number(
                        match[2]
                    ),

                quarter:
                    `Q${match[1]}`
            };
        }

        // Default current month
        const now =
            new Date();

        return {

            month:
                `${now.getFullYear()}-` +
                `${String(
                    now.getMonth() + 1
                ).padStart(2, '0')}`
        };
    }

    // ============================================================
    // DOWNLOAD CSV FROM FRONTEND REPORT DATA
    // ============================================================

    public downloadCSV(
        report: GeneratedReport
    ): void {

        const data =
            report.data;

        const lines:
            string[] = [];

        lines.push(
            '"TAXPAL FINANCIAL REPORT"'
        );

        lines.push(
            `"Report Type:","${data.reportType}"`
        );

        lines.push(
            `"Period:","${data.period}"`
        );

        lines.push(
            `"Generated For:","${data.userName} (${data.userEmail})"`
        );

        lines.push(
            `"Generated Date:","${data.generatedDate}"`
        );

        lines.push('');

        lines.push(
            '"--- FINANCIAL SUMMARY ---"'
        );

        lines.push(
            `"Total Gross Income","${data.currencySymbol}${data.totalIncome.toFixed(2)}"`
        );

        lines.push(
            `"Total Expenses","${data.currencySymbol}${data.totalExpenses.toFixed(2)}"`
        );

        lines.push(
            `"Net Operating Income","${data.currencySymbol}${data.netIncome.toFixed(2)}"`
        );

        lines.push(
            `"Savings / Margin Rate","${data.savingsRate.toFixed(1)}%"`
        );

        lines.push(
            `"Estimated Tax Liability","${data.currencySymbol}${data.estimatedTax.toFixed(2)}"`
        );

        lines.push(
            `"Effective Tax Rate","${data.effectiveTaxRate.toFixed(1)}%"`
        );

        lines.push(
            `"Eligible Tax Deductions","${data.currencySymbol}${data.taxDeductions.toFixed(2)}"`
        );

        lines.push('');

        lines.push(
            '"--- EXPENSE BREAKDOWN BY CATEGORY ---"'
        );

        lines.push(
            '"Category","Amount","Percentage of Total","Transaction Count"'
        );

        data.expenseCategories.forEach(
            category => {

                lines.push(
                    `"${category.category}",` +
                    `"${data.currencySymbol}${category.amount.toFixed(2)}",` +
                    `"${category.percentage.toFixed(1)}%",` +
                    `"${category.transactionCount}"`
                );

            }
        );

        lines.push('');

        lines.push(
            '"--- REVENUE BREAKDOWN BY CATEGORY ---"'
        );

        lines.push(
            '"Category","Amount","Percentage of Total","Transaction Count"'
        );

        data.incomeCategories.forEach(
            category => {

                lines.push(
                    `"${category.category}",` +
                    `"${data.currencySymbol}${category.amount.toFixed(2)}",` +
                    `"${category.percentage.toFixed(1)}%",` +
                    `"${category.transactionCount}"`
                );

            }
        );

        lines.push('');

        lines.push(
            '"--- TRANSACTION ITEMIZATION ---"'
        );

        lines.push(
            '"Date","Type","Category","Description","Amount"'
        );

        data.transactions.forEach(
            transaction => {

                const description =
                    (
                        transaction.description ||
                        ''
                    ).replace(
                        /"/g,
                        '""'
                    );

                lines.push(
                    `"${transaction.date}",` +
                    `"${transaction.type.toUpperCase()}",` +
                    `"${transaction.category}",` +
                    `"${description}",` +
                    `"${data.currencySymbol}${transaction.amount.toFixed(2)}"`
                );
            }
        );

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            encodeURIComponent(
                lines.join('\n')
            );

        const link =
            document.createElement('a');

        link.href =
            csvContent;

        link.download =
            `TaxPal_${report.reportType
                .replace(/\s+/g, '_')}_${report.period
                    .replace(/[\s(),\-]+/g, '_')}.csv`;

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );
    }

    // ============================================================
    // PRINT / SAVE PDF
    // ============================================================

    public printOrSavePDF(): void {

        window.print();
    }
}