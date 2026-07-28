import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TransactionService } from '../transactions/transaction.service';
import { Transaction, User } from '../transactions/transaction.model';
import { SidebarComponent } from '../shared/sidebar';
import { HeaderComponent } from '../shared/header';
import { BadgeComponent } from '../shared/badge';
import { TransactionModalComponent } from '../transactions/transaction-modal';

Chart.register(...registerables);

interface DonutItem {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    SidebarComponent, 
    HeaderComponent, 
    BadgeComponent, 
    TransactionModalComponent
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Reusable Sidebar -->
      <app-sidebar 
        [isOpen]="sidebarOpen()" 
        [user]="user"
        (toggle)="toggleSidebar()"
        (logout)="logout()">
      </app-sidebar>
      
      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Reusable Header with projected action buttons -->
        <app-header 
          [title]="'Financial Dashboard'" 
          [subtitle]="'Welcome back, ' + (user?.name || 'User') + '! Here\\'s your financial summary.'"
          (toggleSidebar)="toggleSidebar()">
          
          <button class="btn btn-income-outline" (click)="openModal('income')">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Record Income
          </button>
          <button class="btn btn-expense-outline" (click)="openModal('expense')">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Record Expense
          </button>
        </app-header>

        <!-- Toast Notifications -->
        <div class="toast" *ngIf="toastMessage()" [class.show]="toastMessage()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span>{{ toastMessage() }}</span>
        </div>
        
        <!-- KPI Dashboard Grid -->
        <section class="kpi-grid">
          <!-- Monthly Income -->
          <div class="card kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">Monthly Income</span>
              <div class="kpi-icon icon-income">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
            </div>
            <div class="kpi-value">{{ totalIncome | currency:'INR':'symbol-narrow' }}</div>
            <div class="kpi-footer">
              <span class="trend trend-up">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7 7 7M12 3v18"/>
                </svg>
                12%
              </span>
              <span class="kpi-subtext">from last month</span>
            </div>
          </div>
          
          <!-- Monthly Expenses -->
          <div class="card kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">Monthly Expenses</span>
              <div class="kpi-icon icon-expense">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
                </svg>
              </div>
            </div>
            <div class="kpi-value">{{ totalExpenses | currency:'INR':'symbol-narrow' }}</div>
            <div class="kpi-footer">
              <span class="trend trend-down">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7-7-7M12 21V3"/>
                </svg>
                8%
              </span>
              <span class="kpi-subtext">from last month</span>
            </div>
          </div>
          
          <!-- Estimated Tax Due -->
          <div class="card kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">Estimated Tax Due</span>
              <div class="kpi-icon icon-tax">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
            </div>
            <div class="kpi-value">{{ estimatedTax | currency:'INR':'symbol-narrow' }}</div>
            <div class="kpi-footer">
              <span class="kpi-subtext">{{ estimatedTax > 0 ? 'Estimated at 15% rate' : 'No taxes due' }}</span>
            </div>
          </div>
          
          <!-- Savings Rate -->
          <div class="card kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">Savings Rate</span>
              <div class="kpi-icon icon-savings">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
            </div>
            <div class="kpi-value">{{ savingsRate | number:'1.1-1' }}%</div>
            <div class="kpi-footer">
              <span class="trend trend-up">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7 7 7M12 3v18"/>
                </svg>
                3.2%
              </span>
              <span class="kpi-subtext">from your goal</span>
            </div>
          </div>
        </section>

        <!-- Charts Grid -->
        <section class="charts-grid">
          <!-- Income vs Expenses Chart Card -->
          <div class="card chart-card flex-1">
            <div class="chart-header">
              <h3 class="chart-title">Income vs Expenses</h3>
              <div class="chart-toggles">
                <button class="toggle-btn" [class.active]="timeframe() === 'month'" (click)="setTimeframe('month')">Month</button>
                <button class="toggle-btn" [class.active]="timeframe() === 'quarter'" (click)="setTimeframe('quarter')">Quarter</button>
                <button class="toggle-btn" [class.active]="timeframe() === 'year'" (click)="setTimeframe('year')">Year</button>
              </div>
            </div>
            
            <div class="chart-container">
              <canvas #barChartCanvas></canvas>
            </div>
          </div>
          
          <!-- Expense Breakdown Chart Card -->
          <div class="card chart-card expense-breakdown-card">
            <h3 class="chart-title">Expense Breakdown</h3>
            
            <div class="donut-chart-wrapper">
              <div class="donut-chart-container">
                <canvas #donutChartCanvas></canvas>
              </div>
              
              <!-- Category Breakdown list -->
              <div class="breakdown-list">
                <div class="breakdown-item" *ngFor="let item of donutItems">
                  <div class="breakdown-info">
                    <span class="breakdown-color-indicator" [style.background-color]="item.color"></span>
                    <span class="breakdown-category-name">{{ item.category }}</span>
                  </div>
                  <div class="breakdown-values">
                    <span class="breakdown-val font-semibold mr-2">{{ item.value | currency:'INR':'symbol-narrow' }}</span>
                    <span class="breakdown-pct text-light">({{ item.percentage | number:'1.0-0' }}%)</span>
                  </div>
                </div>
                <div class="breakdown-empty" *ngIf="donutItems.length === 0">
                  No expense records logged for this month.
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Transactions Table -->
        <section class="card recent-transactions-card">
          <div class="recent-transactions-header">
            <h3 class="chart-title">Recent Transactions</h3>
            <a routerLink="/transactions" class="view-all-link">
              <span>View All</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7M3 12h13"/>
              </svg>
            </a>
          </div>

          <div class="table-container">
            <table class="responsive-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th class="text-right">Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tx of recentTransactions">
                  <td class="tx-date-cell">{{ formatDate(tx.date) }}</td>
                  <td class="tx-desc-cell font-semibold">{{ tx.description }}</td>
                  <td class="tx-category-cell">
                    <span class="category-chip">{{ tx.category }}</span>
                  </td>
                  <td class="text-right font-semibold" [ngClass]="tx.type === 'income' ? 'text-income' : 'text-expense'">
                    {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency:'INR':'symbol-narrow' }}
                  </td>
                  <td>
                    <app-badge [type]="tx.type"></app-badge>
                  </td>
                </tr>
                <tr *ngIf="recentTransactions.length === 0">
                  <td colspan="5" class="no-tx-row text-center">
                    <div class="no-tx-wrapper">
                      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                      </svg>
                      <p>No transactions recorded yet.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <!-- Reusable Modals -->
      <app-transaction-modal 
        [isOpen]="modalOpen" 
        [type]="modalType"
        (close)="closeModal()"
        (save)="onSaveTransaction($event)">
      </app-transaction-modal>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-primary);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 40px;
      max-width: 1200px;
      width: calc(100% - 260px);
    }

    .btn-income-outline {
      border: 1.5px solid var(--income);
      color: var(--income);
      background-color: transparent;
    }

    .btn-income-outline:hover {
      background-color: var(--income);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .btn-expense-outline {
      border: 1.5px solid var(--expense);
      color: var(--expense);
      background-color: transparent;
    }

    .btn-expense-outline:hover {
      background-color: var(--expense);
      color: white;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.15);
    }

    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: var(--bg-dark);
      color: white;
      padding: 14px 20px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 1000;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid rgba(255,255,255,0.05);
      animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .kpi-card {
      position: relative;
      overflow: hidden;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }

    .kpi-card:nth-child(1)::before { background-color: var(--income); }
    .kpi-card:nth-child(2)::before { background-color: var(--expense); }
    .kpi-card:nth-child(3)::before { background-color: var(--accent-orange); }
    .kpi-card:nth-child(4)::before { background-color: var(--primary); }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .kpi-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-income { background-color: var(--income-light); color: var(--income); }
    .icon-expense { background-color: var(--expense-light); color: var(--expense); }
    .icon-tax { background-color: var(--accent-orange-light); color: var(--accent-orange); }
    .icon-savings { background-color: var(--primary-light); color: var(--primary); }

    .kpi-value {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .kpi-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }

    .trend {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--radius-full);
    }

    .trend-up { background-color: var(--income-light); color: var(--income-hover); }
    .trend-down { background-color: var(--expense-light); color: var(--expense-hover); }

    .kpi-subtext {
      font-size: 12px;
      color: var(--text-light);
      font-weight: 500;
    }

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    @media (max-width: 1024px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .chart-toggles {
      display: flex;
      background-color: var(--bg-primary);
      border: 1px solid var(--border);
      padding: 3px;
      border-radius: var(--radius-sm);
    }

    .toggle-btn {
      background: none;
      border: none;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toggle-btn.active {
      background-color: var(--bg-secondary);
      color: var(--primary-hover);
      box-shadow: var(--shadow-sm);
    }

    .chart-container {
      position: relative;
      flex: 1;
      height: 250px;
      width: 100%;
    }

    /* Donut chart layout */
    .expense-breakdown-card {
      justify-content: flex-start;
      gap: 16px;
    }

    .donut-chart-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      flex: 1;
      width: 100%;
    }

    .donut-chart-container {
      position: relative;
      height: 160px;
      width: 160px;
    }

    .breakdown-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      border-radius: var(--radius-sm);
      transition: background-color 0.2s ease;
    }

    .breakdown-item:hover {
      background-color: var(--bg-primary);
    }

    .breakdown-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .breakdown-color-indicator {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }

    .breakdown-category-name {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .breakdown-values {
      display: flex;
      align-items: center;
      font-size: 12px;
    }

    .breakdown-val {
      color: var(--text-primary);
    }

    .breakdown-pct {
      font-size: 11px;
    }

    .breakdown-empty {
      font-size: 12px;
      color: var(--text-light);
      text-align: center;
      padding: 12px 0;
    }

    /* Recent Transactions Card */
    .recent-transactions-card {
      margin-bottom: 24px;
    }

    .recent-transactions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .view-all-link:hover {
      color: var(--primary-hover);
    }

    .tx-date-cell {
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .category-chip {
      background-color: var(--bg-primary);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .text-income {
      color: var(--income-hover);
    }

    .text-expense {
      color: var(--expense-hover);
    }

    .no-tx-row {
      padding: 40px 0 !important;
    }

    .no-tx-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-light);
      gap: 8px;
    }

    .no-tx-wrapper p {
      font-size: 14px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
        width: 100%;
        padding: 24px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChartCanvas') donutChartCanvas!: ElementRef<HTMLCanvasElement>;

  user: User | null = null;
  transactions: Transaction[] = [];
  recentTransactions: Transaction[] = [];
  
  // KPI Stats
  totalIncome = 0;
  totalExpenses = 0;
  estimatedTax = 0;
  savingsRate = 0;

  // Chart state & instances
  timeframe = signal<'month' | 'quarter' | 'year'>('year');
  barChart: Chart | null = null;
  donutChart: Chart | null = null;
  donutItems: DonutItem[] = [];

  // General state
  sidebarOpen = signal(false);
  toastMessage = signal<string | null>(null);
  modalOpen = false;
  modalType: 'income' | 'expense' = 'income';

  private authSub: Subscription | null = null;
  private txSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (!u) {
        this.router.navigate(['/login']);
      }
    });

    this.txSub = this.transactionService.transactions$.subscribe(txs => {
      this.transactions = txs;
      this.recentTransactions = txs.slice(0, 5); // recent 5
      this.calculateCurrentMonthStats();
      this.generateDonutData();
      if (this.barChartCanvas) {
        this.updateBarChart();
      }
      if (this.donutChartCanvas) {
        this.updateDonutChart();
      }
    });
  }

  ngAfterViewInit(): void {
    // Wait for view initialization before rendering charts
    this.updateBarChart();
    this.updateDonutChart();
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.txSub) this.txSub.unsubscribe();
    if (this.barChart) this.barChart.destroy();
    if (this.donutChart) this.donutChart.destroy();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(val => !val);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Modals management
  openModal(type: 'income' | 'expense'): void {
    this.modalType = type;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  onSaveTransaction(newTx: Omit<Transaction, 'id' | 'user_id'>): void {
    this.transactionService.addTransaction(newTx);
    this.closeModal();
  }

  formatDate(dateStr: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
  }

  setTimeframe(val: 'month' | 'quarter' | 'year'): void {
    this.timeframe.set(val);
    this.updateBarChart();
  }

  calculateCurrentMonthStats(): void {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonthIdx = today.getMonth();

    const currentMonthTxs = this.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === curYear && d.getMonth() === curMonthIdx;
    });

    this.totalIncome = currentMonthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpenses = currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = this.totalIncome - this.totalExpenses;
    this.estimatedTax = netIncome > 0 ? netIncome * 0.15 : 0;

    this.savingsRate = this.totalIncome > 0 ? (netIncome / this.totalIncome) * 100 : 0;
    if (this.savingsRate < 0) this.savingsRate = 0;
  }

  // Group historical data and render Chart.js
  updateBarChart(): void {
    if (!this.barChartCanvas) return;

    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.barChart) {
      this.barChart.destroy();
    }

    const today = new Date();
    const curYear = today.getFullYear();
    const curMonthIdx = today.getMonth();

    let labels: string[] = [];
    let incomeData: number[] = [];
    let expenseData: number[] = [];

    const mode = this.timeframe();

    if (mode === 'year') {
      // Show previous 6 months including current
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 5; i >= 0; i--) {
        let m = curMonthIdx - i;
        let y = curYear;
        if (m < 0) {
          m += 12;
          y -= 1;
        }

        labels.push(`${months[m]} ${y}`);
        
        const mTxs = this.transactions.filter(t => {
          const d = new Date(t.date);
          return d.getFullYear() === y && d.getMonth() === m;
        });

        const inc = mTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const exp = mTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(inc);
        expenseData.push(exp);
      }
    } else if (mode === 'quarter') {
      // Show previous 3 months including current
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 2; i >= 0; i--) {
        let m = curMonthIdx - i;
        let y = curYear;
        if (m < 0) {
          m += 12;
          y -= 1;
        }

        labels.push(`${months[m]} ${y}`);
        
        const mTxs = this.transactions.filter(t => {
          const d = new Date(t.date);
          return d.getFullYear() === y && d.getMonth() === m;
        });

        const inc = mTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const exp = mTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(inc);
        expenseData.push(exp);
      }
    } else {
      // Month timeframe: Show 4 weeks of the current month
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4+'];
      
      const weeksData = [
        { inc: 0, exp: 0 }, // d <= 7
        { inc: 0, exp: 0 }, // 8-14
        { inc: 0, exp: 0 }, // 15-21
        { inc: 0, exp: 0 }  // 22+
      ];

      this.transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === curYear && d.getMonth() === curMonthIdx) {
          const day = d.getDate();
          let wIdx = 3;
          if (day <= 7) wIdx = 0;
          else if (day <= 14) wIdx = 1;
          else if (day <= 21) wIdx = 2;

          if (t.type === 'income') {
            weeksData[wIdx].inc += t.amount;
          } else {
            weeksData[wIdx].exp += t.amount;
          }
        }
      });

      weeksData.forEach(w => {
        incomeData.push(w.inc);
        expenseData.push(w.exp);
      });
    }

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: '#10b981', // green
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: '#f43f5e', // red
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                family: 'Inter',
                size: 11,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            padding: 12,
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter', weight: 'bold' },
            bodyFont: { family: 'Inter' }
          }
        },
        scales: {
          y: {
            grid: {
              color: '#f1f5f9'
            },
            ticks: {
              callback: (value) => '₹' + Number(value).toLocaleString(),
              font: { family: 'Inter', size: 10 }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { family: 'Inter', size: 11, weight: 'normal' }
            }
          }
        }
      }
    });
  }

  // Group by category and generate donut data
  generateDonutData(): void {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonthIdx = today.getMonth();

    // Filter current month's expenses
    const currentMonthExpenses = this.transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getFullYear() === curYear && d.getMonth() === curMonthIdx;
    });

    const categoryTotals: { [key: string]: number } = {};
    currentMonthExpenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const colorPalette: { [key: string]: string } = {
      'Rent/Mortgage': '#0284c7', // Sky Blue
      'Business Expenses': '#0ea5e9', // Primary Blue
      'Office Rent': '#3b82f6', // Indigo
      'Software Subscriptions': '#8b5cf6', // Violet
      'Professional Development': '#10b981', // Emerald
      'Marketing': '#ec4899', // Pink
      'Travel': '#a855f7', // Purple
      'Meals & Entertainment': '#f43f5e', // Coral
      'Utilities': '#f59e0b', // Amber
      'Food': '#f97316', // Orange
      'Other': '#64748b' // Slate
    };

    const items: DonutItem[] = [];
    const totalSpent = this.totalExpenses;

    Object.keys(categoryTotals).forEach(cat => {
      const val = categoryTotals[cat];
      const pct = totalSpent > 0 ? (val / totalSpent) * 100 : 0;
      items.push({
        category: cat,
        value: val,
        percentage: pct,
        color: colorPalette[cat] || colorPalette['Other']
      });
    });

    items.sort((a, b) => b.value - a.value);
    this.donutItems = items;
  }

  updateDonutChart(): void {
    if (!this.donutChartCanvas) return;

    const ctx = this.donutChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.donutChart) {
      this.donutChart.destroy();
    }

    if (this.donutItems.length === 0) return;

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.donutItems.map(i => i.category),
        datasets: [
          {
            data: this.donutItems.map(i => i.value),
            backgroundColor: this.donutItems.map(i => i.color),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                const val = item.raw as number;
                const total = item.dataset.data.reduce((a: any, b: any) => a + b, 0) as number;
                const pct = ((val / total) * 100).toFixed(0);
                return ` ₹${val.toFixed(2)} (${pct}%)`;
              }
            },
            padding: 12,
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter', weight: 'bold' },
            bodyFont: { family: 'Inter' }
          }
        }
      }
    });
  }

  showLockedToast(moduleName: string): void {
    this.toastMessage.set(`"${moduleName}" module is locked for Milestone 1. Coming soon!`);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
