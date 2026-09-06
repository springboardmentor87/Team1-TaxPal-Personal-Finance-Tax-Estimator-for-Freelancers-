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
  private readonly API_URL = 'http://localhost:8080/api/reports';
  private reportsSubject = new BehaviorSubject<GeneratedReport[]>([]);
  public reports$: Observable<GeneratedReport[]> = this.reportsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private currencyService: CurrencyService
  ) {
    // Clear any legacy client-side localStorage entries
    try {
      localStorage.removeItem('taxpal_reports_history');
    } catch (_) {}

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadReports();
      } else {
        this.reportsSubject.next([]);
      }
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  public loadReports(): void {
    const headers = this.getAuthHeaders();
    this.http.get<any>(this.API_URL, { headers }).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res && res.data && Array.isArray(res.data) ? res.data : []);
        const mapped: GeneratedReport[] = list.map((item: any) => ({
          id: item.id ? item.id.toString() : 'rep_' + Date.now(),
          name: item.name || `${item.report_type || 'Financial Report'} - ${item.period || 'Period'}`,
          reportType: item.report_type || 'Income Statement',
          period: item.period || 'Current Month',
          format: (item.format || 'PDF').toUpperCase() as ReportFormat,
          createdAt: item.created_at || new Date().toISOString(),
          filePath: item.file_path,
          data: item.data || this.createEmptyReportData(item.report_type, item.period)
        }));
        this.reportsSubject.next(mapped);
      },
      error: (err) => {
        console.warn('Backend reports API unavailable or not connected, maintaining in-memory session:', err.message);
      }
    });
  }

  public deleteReport(id: string): void {
    const headers = this.getAuthHeaders();
    
    // Call backend endpoint to delete
    this.http.delete(`${this.API_URL}/${id}`, { headers }).subscribe({
      next: () => {},
      error: (err) => console.warn('Could not delete report from backend:', err.message)
    });

    // Update frontend state
    const updated = this.reportsSubject.value.filter(r => r.id !== id);
    this.reportsSubject.next(updated);
  }

  public generateReport(
    reportType: ReportType,
    period: ReportPeriod,
    format: ReportFormat,
    customStart?: string,
    customEnd?: string,
    allTransactions: Transaction[] = []
  ): GeneratedReport {
    const currentUser = this.authService.getCurrentUserValue();
    const currency = this.currencyService.currentSymbol || '$';

    const { startDate, endDate, periodLabel } = this.calculateDateRange(period, customStart, customEnd);
    
    // Filter transactions within the interval
    const filteredTx = allTransactions.filter(t => {
      if (!t.date) return false;
      const txDate = new Date(t.date).getTime();
      return txDate >= startDate.getTime() && txDate <= endDate.getTime();
    });

    // Calculate aggregations
    let totalIncome = 0;
    let totalExpenses = 0;
    const incomeCatMap = new Map<string, { amount: number; count: number }>();
    const expenseCatMap = new Map<string, { amount: number; count: number }>();

    filteredTx.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
        const current = incomeCatMap.get(tx.category) || { amount: 0, count: 0 };
        incomeCatMap.set(tx.category, { amount: current.amount + amt, count: current.count + 1 });
      } else {
        totalExpenses += amt;
        const current = expenseCatMap.get(tx.category) || { amount: 0, count: 0 };
        expenseCatMap.set(tx.category, { amount: current.amount + amt, count: current.count + 1 });
      }
    });

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

    // Category breakdowns
    const incomeCategories: CategoryBreakdownItem[] = Array.from(incomeCatMap.entries()).map(([cat, data]) => ({
      category: cat,
      amount: data.amount,
      percentage: totalIncome > 0 ? (data.amount / totalIncome) * 100 : 0,
      transactionCount: data.count
    })).sort((a, b) => b.amount - a.amount);

    const expenseCategories: CategoryBreakdownItem[] = Array.from(expenseCatMap.entries()).map(([cat, data]) => ({
      category: cat,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      transactionCount: data.count
    })).sort((a, b) => b.amount - a.amount);

    // Monthly/Quarterly periodic breakdowns
    const periodBreakdowns = this.buildPeriodBreakdowns(filteredTx, startDate, endDate);

    // Tax Calculations (22% estimated tax)
    const deductibleExpenses = expenseCategories
      .filter(c => !['Groceries', 'Personal', 'Entertainment'].includes(c.category))
      .reduce((acc, c) => acc + c.amount, 0);
    
    const taxableProfit = Math.max(0, totalIncome - deductibleExpenses);
    const estimatedTax = Math.round(taxableProfit * 0.22);
    const effectiveTaxRate = totalIncome > 0 ? ((estimatedTax / totalIncome) * 100) : 0;

    const reportData: ReportData = {
      reportType,
      period: periodLabel,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      userName: currentUser?.name || currentUser?.username || 'User',
      userEmail: currentUser?.email || '',
      currencySymbol: currency,
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate: Math.max(0, savingsRate),
      estimatedTax,
      effectiveTaxRate,
      taxDeductions: deductibleExpenses,
      incomeCategories,
      expenseCategories,
      periodBreakdowns,
      transactions: filteredTx.map(t => ({
        id: t.id,
        date: t.date,
        description: t.description || '',
        category: t.category,
        type: t.type,
        amount: t.amount
      }))
    };

    const newReport: GeneratedReport = {
      id: 'rep_' + Date.now(),
      name: `${reportType} - ${periodLabel}`,
      reportType,
      period: periodLabel,
      format,
      createdAt: new Date().toISOString(),
      data: reportData
    };

    // Save report to Backend API (Database schema: Reports table)
    const payload = {
      user_id: currentUser?.id,
      report_type: reportType,
      period: periodLabel,
      format: format,
      file_path: null
    };

    const headers = this.getAuthHeaders();
    this.http.post<any>(`${this.API_URL}/add`, payload, { headers }).subscribe({
      next: (res) => {
        if (res && res.id) {
          newReport.id = res.id.toString();
        }
      },
      error: (err) => {
        console.warn('Backend add report endpoint not responding:', err.message);
      }
    });

    // Update runtime UI state
    const currentList = this.reportsSubject.value;
    const updated = [newReport, ...currentList.filter(r => r.name !== newReport.name)];
    this.reportsSubject.next(updated);

    return newReport;
  }

  private createEmptyReportData(reportType: ReportType, period: string): ReportData {
    return {
      reportType: reportType || 'Income Statement',
      period: period || 'Current Month',
      startDate: '',
      endDate: '',
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      userName: 'User',
      userEmail: '',
      currencySymbol: this.currencyService.currentSymbol || '$',
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      savingsRate: 0,
      estimatedTax: 0,
      effectiveTaxRate: 0,
      taxDeductions: 0,
      incomeCategories: [],
      expenseCategories: [],
      periodBreakdowns: [],
      transactions: []
    };
  }

  private calculateDateRange(
    period: ReportPeriod,
    customStart?: string,
    customEnd?: string
  ): { startDate: Date; endDate: Date; periodLabel: string } {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let startDate: Date;
    let endDate: Date;
    let periodLabel: string = period;

    switch (period) {
      case 'Current Month':
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
        periodLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        break;

      case 'Last Month':
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
        periodLabel = new Date(currentYear, currentMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        break;

      case 'Q1 2025':
        startDate = new Date(2025, 0, 1);
        endDate = new Date(2025, 2, 31, 23, 59, 59);
        periodLabel = 'Q1 2025 (Jan - Mar)';
        break;

      case 'Q2 2025':
        startDate = new Date(2025, 3, 1);
        endDate = new Date(2025, 5, 30, 23, 59, 59);
        periodLabel = 'Q2 2025 (Apr - Jun)';
        break;

      case 'Q3 2025':
        startDate = new Date(2025, 6, 1);
        endDate = new Date(2025, 8, 30, 23, 59, 59);
        periodLabel = 'Q3 2025 (Jul - Sep)';
        break;

      case 'Q4 2025':
        startDate = new Date(2025, 9, 1);
        endDate = new Date(2025, 11, 31, 23, 59, 59);
        periodLabel = 'Q4 2025 (Oct - Dec)';
        break;

      case 'Year 2025':
        startDate = new Date(2025, 0, 1);
        endDate = new Date(2025, 11, 31, 23, 59, 59);
        periodLabel = 'Full Year 2025';
        break;

      case 'Custom Range':
        startDate = customStart ? new Date(customStart + 'T00:00:00') : new Date(currentYear, 0, 1);
        endDate = customEnd ? new Date(customEnd + 'T23:59:59') : new Date(currentYear, 11, 31, 23, 59, 59);
        periodLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        break;

      default:
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59);
        periodLabel = 'Year ' + currentYear;
    }

    return { startDate, endDate, periodLabel };
  }

  private buildPeriodBreakdowns(transactions: Transaction[], start: Date, end: Date): PeriodFinancialBreakdown[] {
    const monthMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(tx => {
      if (!tx.date) return;
      const d = new Date(tx.date);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const current = monthMap.get(key) || { income: 0, expenses: 0 };
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        current.income += amt;
      } else {
        current.expenses += amt;
      }
      monthMap.set(key, current);
    });

    const list: PeriodFinancialBreakdown[] = [];
    monthMap.forEach((val, key) => {
      const net = val.income - val.expenses;
      const rate = val.income > 0 ? (net / val.income) * 100 : 0;
      list.push({
        label: key,
        income: val.income,
        expenses: val.expenses,
        netIncome: net,
        savingsRate: Math.max(0, rate)
      });
    });

    return list;
  }

  public downloadCSV(report: GeneratedReport): void {
    const d = report.data;
    const lines: string[] = [];

    // Header metadata
    lines.push(`"TAXPAL FINANCIAL REPORT"`);
    lines.push(`"Report Type:","${d.reportType}"`);
    lines.push(`"Period:","${d.period}"`);
    lines.push(`"Generated For:","${d.userName} (${d.userEmail})"`);
    lines.push(`"Generated Date:","${d.generatedDate}"`);
    lines.push(`""`);

    // Financial Summary
    lines.push(`"--- FINANCIAL SUMMARY ---"`);
    lines.push(`"Total Gross Income","${d.currencySymbol}${d.totalIncome.toFixed(2)}"`);
    lines.push(`"Total Expenses","${d.currencySymbol}${d.totalExpenses.toFixed(2)}"`);
    lines.push(`"Net Operating Income","${d.currencySymbol}${d.netIncome.toFixed(2)}"`);
    lines.push(`"Savings / Margin Rate","${d.savingsRate.toFixed(1)}%"`);
    lines.push(`"Estimated Tax Liability","${d.currencySymbol}${d.estimatedTax.toFixed(2)}"`);
    lines.push(`"Effective Tax Rate","${d.effectiveTaxRate.toFixed(1)}%"`);
    lines.push(`"Eligible Tax Deductions","${d.currencySymbol}${d.taxDeductions.toFixed(2)}"`);
    lines.push(`""`);

    // Expense Categories
    lines.push(`"--- EXPENSE BREAKDOWN BY CATEGORY ---"`);
    lines.push(`"Category","Amount","Percentage of Total","Transaction Count"`);
    d.expenseCategories.forEach(c => {
      lines.push(`"${c.category}","${d.currencySymbol}${c.amount.toFixed(2)}","${c.percentage.toFixed(1)}%","${c.transactionCount}"`);
    });
    lines.push(`""`);

    // Income Categories
    lines.push(`"--- REVENUE BREAKDOWN BY CATEGORY ---"`);
    lines.push(`"Category","Amount","Percentage of Total","Transaction Count"`);
    d.incomeCategories.forEach(c => {
      lines.push(`"${c.category}","${d.currencySymbol}${c.amount.toFixed(2)}","${c.percentage.toFixed(1)}%","${c.transactionCount}"`);
    });
    lines.push(`""`);

    // Transaction Details
    lines.push(`"--- TRANSACTION ITEMIZATION ---"`);
    lines.push(`"Date","Type","Category","Description","Amount"`);
    d.transactions.forEach(t => {
      lines.push(`"${t.date}","${t.type.toUpperCase()}","${t.category}","${(t.description || '').replace(/"/g, '""')}","${d.currencySymbol}${t.amount.toFixed(2)}"`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    const sanitizedFileName = `TaxPal_${report.reportType.replace(/\s+/g, '_')}_${report.period.replace(/[\s(),\-]+/g, '_')}.csv`;
    link.setAttribute('download', sanitizedFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public printOrSavePDF(): void {
    window.print();
  }
}
