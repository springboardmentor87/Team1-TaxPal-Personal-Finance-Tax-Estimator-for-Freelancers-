import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {

  transactions: any[] = [];
  recentTransactions: any[] = [];
  isLoading = false;
  errorMessage = '';
  userName = 'Test User';
  userEmail = 'demo@gmail.com';
  userInitials = 'TU';
  isLightTheme = true;

  currencySymbol = '₹';

  totalIncome = 0;
  totalExpense = 0;
  estimatedTaxDue = 0;
  savingsRate = '0.0%';

  incomeTrendText = 'from last month';
  incomeTrendPct = '12%';
  incomeTrendUp = true;

  expenseTrendText = 'from last month';
  expenseTrendPct = '8%';
  expenseTrendDown = true;

  taxSubtext = 'No taxes due';
  savingsSubtext = 'from your goal';
  savingsTrendPct = '3.2%';

  expenseCategories: any[] = [];
  categoryColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  spendingChart: any;
  incomeExpenseChart: any;
  chartTimePeriod: 'year' | 'quarter' | 'month' = 'month';

  getCategoryColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length];
  }

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isLightTheme = false;
      document.body.classList.remove('light-theme');
    } else {
      this.isLightTheme = true;
      document.body.classList.add('light-theme');
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.fullName || user.username || 'Test User';
        this.userEmail = user.email || 'demo@gmail.com';
        const parts = this.userName.trim().split(' ');
        if (parts.length >= 2) {
          this.userInitials = (parts[0][0] + parts[1][0]).toUpperCase();
        } else if (parts.length === 1 && parts[0].length > 0) {
          this.userInitials = parts[0].slice(0, 2).toUpperCase();
        }

        if (user.currencyPreference === 'USD') {
          this.currencySymbol = '$';
        } else if (user.currencyPreference === 'EUR') {
          this.currencySymbol = '€';
        } else if (user.currencyPreference === 'GBP') {
          this.currencySymbol = '£';
        } else {
          this.currencySymbol = '₹';
        }
      } catch (e) {
        console.error('Error parsing user storage:', e);
      }
    }
    this.loadTransactions();
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
    setTimeout(() => {
      this.renderSpendingChart();
      this.renderIncomeExpenseChart();
    }, 50);
  }

  ngAfterViewInit() {
    this.renderSpendingChart();
    this.renderIncomeExpenseChart();
  }

  ngOnDestroy() {
    if (this.spendingChart) {
      this.spendingChart.destroy();
    }
    if (this.incomeExpenseChart) {
      this.incomeExpenseChart.destroy();
    }
  }

  loadTransactions() {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getTransactions().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.data && Array.isArray(res.data)) {
          this.transactions = res.data;
          this.recentTransactions = this.transactions.slice(0, 5);
        } else {
          this.transactions = [];
          this.recentTransactions = [];
        }
        this.calculateMetrics();
        this.calculateExpenseCategories();
        this.loadTaxEstimates();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading dashboard transactions:', err);
        if (err.status === 401) {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          this.router.navigate(['/']);
        } else {
          this.transactions = [];
          this.recentTransactions = [];
          this.calculateMetrics();
          this.calculateExpenseCategories();
        }
      }
    });
  }

  loadTaxEstimates() {
    this.api.getTaxEstimates().subscribe({
      next: (res: any) => {
        const estimates = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(estimates) && estimates.length > 0) {
          const latest = estimates[0];
          const due = Number(latest.estimatedTax || latest.totalEstimatedTax || latest.estimatedAnnualTax || 0);
          this.estimatedTaxDue = due;
          this.taxSubtext = due > 0 ? `Quarterly estimate: ${this.formatCurrency(due)}` : 'No taxes due';
        } else {
          this.estimatedTaxDue = 0;
          this.taxSubtext = 'No taxes due';
        }
      },
      error: () => {
        this.estimatedTaxDue = 0;
        this.taxSubtext = 'No taxes due';
      }
    });
  }

  calculateMetrics() {
    let income = 0;
    let expense = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    let prevMonthIncome = 0;
    let prevMonthExpense = 0;

    this.transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const tDate = new Date(t.transactionDate || t.createdAt);
      const isCurrentMonth = !isNaN(tDate.getTime()) && tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
      const isPrevMonth = !isNaN(tDate.getTime()) && tDate.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear) && tDate.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1);

      if (t.type === 'Income') {
        income += amt;
        if (isCurrentMonth) thisMonthIncome += amt;
        if (isPrevMonth) prevMonthIncome += amt;
      } else if (t.type === 'Expense') {
        expense += amt;
        if (isCurrentMonth) thisMonthExpense += amt;
        if (isPrevMonth) prevMonthExpense += amt;
      }
    });

    this.totalIncome = income;
    this.totalExpense = expense;

    // Income trend text
    if (this.transactions.length === 0) {
      this.incomeTrendPct = '12%';
      this.incomeTrendText = 'from last month';
      this.incomeTrendUp = true;
    } else if (prevMonthIncome > 0) {
      const change = ((thisMonthIncome - prevMonthIncome) / prevMonthIncome) * 100;
      this.incomeTrendUp = change >= 0;
      this.incomeTrendPct = `${Math.abs(Math.round(change))}%`;
      this.incomeTrendText = 'from last month';
    } else {
      this.incomeTrendPct = thisMonthIncome > 0 ? this.formatCurrency(thisMonthIncome) : '0%';
      this.incomeTrendText = thisMonthIncome > 0 ? 'this month' : 'from last month';
      this.incomeTrendUp = true;
    }

    // Expense trend text
    if (this.transactions.length === 0) {
      this.expenseTrendPct = '8%';
      this.expenseTrendText = 'from last month';
      this.expenseTrendDown = true;
    } else if (prevMonthExpense > 0) {
      const change = ((thisMonthExpense - prevMonthExpense) / prevMonthExpense) * 100;
      this.expenseTrendDown = change <= 0;
      this.expenseTrendPct = `${Math.abs(Math.round(change))}%`;
      this.expenseTrendText = 'from last month';
    } else {
      this.expenseTrendPct = thisMonthExpense > 0 ? this.formatCurrency(thisMonthExpense) : '0%';
      this.expenseTrendText = thisMonthExpense > 0 ? 'this month' : 'from last month';
      this.expenseTrendDown = true;
    }

    // Savings rate
    if (this.totalIncome > 0) {
      const rate = ((this.totalIncome - this.totalExpense) / this.totalIncome) * 100;
      this.savingsRate = Math.max(0, rate).toFixed(1) + '%';
      this.savingsTrendPct = '3.2%';
      this.savingsSubtext = 'from your goal';
    } else {
      this.savingsRate = '0.0%';
      this.savingsTrendPct = '3.2%';
      this.savingsSubtext = 'from your goal';
    }

    setTimeout(() => {
      this.renderIncomeExpenseChart();
    }, 50);
  }

  calculateExpenseCategories() {
    const expenses = this.transactions.filter((t: any) => t.type === 'Expense');
    const categoryMap = new Map<string, number>();
    let totalExpenseAmount = 0;

    expenses.forEach((t: any) => {
      const amount = Number(t.amount) || 0;
      const catName = t.category || 'Other';
      const current = categoryMap.get(catName) || 0;
      categoryMap.set(catName, current + amount);
      totalExpenseAmount += amount;
    });

    if (totalExpenseAmount > 0) {
      this.expenseCategories = Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: Math.round((amount / totalExpenseAmount) * 100)
      })).sort((a, b) => b.amount - a.amount);
    } else {
      this.expenseCategories = [];
    }

    setTimeout(() => {
      this.renderSpendingChart();
    }, 50);
  }

  renderSpendingChart() {
    const canvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.spendingChart) {
      this.spendingChart.destroy();
      this.spendingChart = null;
    }

    if (this.expenseCategories.length === 0) {
      return;
    }

    const categories = this.expenseCategories.map(e => e.category);
    const amounts = this.expenseCategories.map(e => e.amount);
    const total = amounts.reduce((a, b) => a + b, 0) || 1;

    this.spendingChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: this.categoryColors.slice(0, categories.length),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw as number;
                const pct = ((val / total) * 100).toFixed(0);
                return ` ${this.formatCurrency(val)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  setChartTimePeriod(period: 'year' | 'quarter' | 'month') {
    this.chartTimePeriod = period;
    this.renderIncomeExpenseChart();
  }

  renderIncomeExpenseChart() {
    const canvas = document.getElementById('incomeExpenseChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.incomeExpenseChart) {
      this.incomeExpenseChart.destroy();
      this.incomeExpenseChart = null;
    }

    const labels: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];

    const now = new Date();

    if (this.chartTimePeriod === 'month') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        labels.push(`${monthNames[m]} ${y}`);

        let mIncome = 0;
        let mExpense = 0;
        this.transactions.forEach(t => {
          const tDate = new Date(t.transactionDate || t.createdAt);
          if (!isNaN(tDate.getTime()) && tDate.getFullYear() === y && tDate.getMonth() === m) {
            if (t.type === 'Income') mIncome += Number(t.amount) || 0;
            if (t.type === 'Expense') mExpense += Number(t.amount) || 0;
          }
        });
        incomeData.push(mIncome);
        expenseData.push(mExpense);
      }
    } else if (this.chartTimePeriod === 'quarter') {
      const y = now.getFullYear();
      labels.push(`Q1 ${y}`, `Q2 ${y}`, `Q3 ${y}`, `Q4 ${y}`);
      const qIncome = [0, 0, 0, 0];
      const qExpense = [0, 0, 0, 0];

      this.transactions.forEach(t => {
        const tDate = new Date(t.transactionDate || t.createdAt);
        if (!isNaN(tDate.getTime()) && tDate.getFullYear() === y) {
          const m = tDate.getMonth();
          const q = Math.floor(m / 3);
          if (q >= 0 && q <= 3) {
            if (t.type === 'Income') qIncome[q] += Number(t.amount) || 0;
            if (t.type === 'Expense') qExpense[q] += Number(t.amount) || 0;
          }
        }
      });
      incomeData.push(...qIncome);
      expenseData.push(...qExpense);
    } else {
      const currentY = now.getFullYear();
      for (let y = currentY - 2; y <= currentY; y++) {
        labels.push(String(y));
        let yIncome = 0;
        let yExpense = 0;
        this.transactions.forEach(t => {
          const tDate = new Date(t.transactionDate || t.createdAt);
          if (!isNaN(tDate.getTime()) && tDate.getFullYear() === y) {
            if (t.type === 'Income') yIncome += Number(t.amount) || 0;
            if (t.type === 'Expense') yExpense += Number(t.amount) || 0;
          }
        });
        incomeData.push(yIncome);
        expenseData.push(yExpense);
      }
    }

    const maxVal = Math.max(...incomeData, ...expenseData, 1);

    this.incomeExpenseChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: '#10b981',
            borderRadius: 4,
            barPercentage: 0.5,
            categoryPercentage: 0.6
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: '#f43f5e',
            borderRadius: 4,
            barPercentage: 0.5,
            categoryPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: maxVal > 1 ? maxVal * 1.15 : 1,
            grid: {
              color: this.isLightTheme ? '#f1f5f9' : 'rgba(255, 255, 255, 0.07)'
            },
            ticks: {
              color: this.isLightTheme ? '#64748b' : '#94a3b8',
              callback: (value) => {
                const num = Number(value);
                if (num === 0) return `${this.currencySymbol}0`;
                if (num >= 1000) return `${this.currencySymbol}${(num / 1000).toFixed(1)}k`;
                return `${this.currencySymbol}${num}`;
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: this.isLightTheme ? '#64748b' : '#94a3b8',
              font: {
                size: 11
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
              color: this.isLightTheme ? '#64748b' : '#cbd5e1',
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        }
      }
    });
  }

  formatCurrency(amount: number): string {
    return this.currencySymbol + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    this.api.logout().subscribe({ error: () => {} });
    this.router.navigate(['/']);
  }
}