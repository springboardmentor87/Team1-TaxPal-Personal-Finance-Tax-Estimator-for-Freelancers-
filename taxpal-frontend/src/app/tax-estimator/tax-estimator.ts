import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaxEstimatorService, TaxCalculationParams, TaxEstimateResult, TaxReminder } from './tax-estimator.service';
import { SidebarComponent } from '../shared/sidebar';
import { HeaderComponent } from '../shared/header';
import { AuthService } from '../auth/auth.service';
import { User } from '../transactions/transaction.model';

@Component({
  selector: 'app-tax-estimator',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar [isOpen]="isSidebarOpen" [user]="currentUser" (toggle)="toggleSidebar()" (logout)="logout()"></app-sidebar>

      <main class="main-content">
        <app-header [title]="'Tax Estimator'" (toggleSidebar)="toggleSidebar()"></app-header>

        <div class="tax-container">
          <!-- Navigation Tabs -->
          <div class="tab-header">
            <button class="tab-btn" [class.active]="activeTab === 'calculator'" (click)="activeTab = 'calculator'">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Tax Calculator
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'calendar'" (click)="switchTab('calendar')">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tax Calendar & Reminders
            </button>
          </div>

          <!-- TAB 1: TAX CALCULATOR -->
          <div *ngIf="activeTab === 'calculator'" class="tax-grid">
            <!-- Form Card -->
            <div class="card form-card">
              <div class="card-header">
                <h3>Quarterly Tax Calculator</h3>
                <p class="subtitle">Calculate your estimated quarterly tax liability based on slab rates.</p>
              </div>

              <form (ngSubmit)="onCalculate()" #taxForm="ngForm" class="tax-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Country / Region</label>
                    <select [(ngModel)]="params.country" name="country" class="form-input" (change)="onCountryChange()">
                      <option value="United States">United States</option>
                      <option value="India">India</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>

                  <div class="form-group" *ngIf="params.country === 'United States'">
                    <label>State / Province</label>
                    <select [(ngModel)]="params.state" name="state" class="form-input">
                      <option value="California">California</option>
                      <option value="New York">New York</option>
                      <option value="Texas">Texas (0% Income Tax)</option>
                      <option value="Florida">Florida (0% Income Tax)</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Filing Status</label>
                    <select [(ngModel)]="params.filingStatus" name="filingStatus" class="form-input">
                      <option value="single">Single</option>
                      <option value="married_joint">Married Filing Jointly</option>
                      <option value="head_of_household">Head of Household</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Fiscal Quarter</label>
                    <select [(ngModel)]="params.quarter" name="quarter" class="form-input">
                      <option value="Q1">Q1 (Jan - Mar 2026)</option>
                      <option value="Q2">Q2 (Apr - Jun 2026)</option>
                      <option value="Q3">Q3 (Jul - Sep 2026)</option>
                      <option value="Q4">Q4 (Oct - Dec 2026)</option>
                    </select>
                  </div>
                </div>

                <div class="section-divider">
                  <span>Gross Income</span>
                </div>

                <div class="form-group">
                  <label>Gross Quarterly Income (₹ / $)</label>
                  <div class="input-prefix-wrapper">
                    <span class="currency-symbol">{{ getCurrencySymbol() }}</span>
                    <input type="number" [(ngModel)]="params.grossIncome" name="grossIncome" class="form-input prefixed" placeholder="0.00" min="0" required>
                  </div>
                </div>

                <div class="section-divider">
                  <span>Deductions & Expenses</span>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Business Expenses</label>
                    <div class="input-prefix-wrapper">
                      <span class="currency-symbol">{{ getCurrencySymbol() }}</span>
                      <input type="number" [(ngModel)]="params.businessExpenses" name="businessExpenses" class="form-input prefixed" placeholder="0.00" min="0">
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Retirement Contributions</label>
                    <div class="input-prefix-wrapper">
                      <span class="currency-symbol">{{ getCurrencySymbol() }}</span>
                      <input type="number" [(ngModel)]="params.retirementContributions" name="retirementContributions" class="form-input prefixed" placeholder="0.00" min="0">
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Health Insurance Premiums</label>
                    <div class="input-prefix-wrapper">
                      <span class="currency-symbol">{{ getCurrencySymbol() }}</span>
                      <input type="number" [(ngModel)]="params.healthInsurancePremiums" name="healthInsurancePremiums" class="form-input prefixed" placeholder="0.00" min="0">
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Home Office Deduction</label>
                    <div class="input-prefix-wrapper">
                      <span class="currency-symbol">{{ getCurrencySymbol() }}</span>
                      <input type="number" [(ngModel)]="params.homeOfficeDeduction" name="homeOfficeDeduction" class="form-input prefixed" placeholder="0.00" min="0">
                    </div>
                  </div>
                </div>

                <button type="submit" class="btn-submit">Calculate Estimated Tax</button>
              </form>
            </div>

            <!-- Results Card -->
            <div class="card result-card">
              <div class="card-header">
                <h3>Tax Summary</h3>
                <span class="badge" *ngIf="result">{{ params.quarter }} Overview</span>
              </div>

              <div *ngIf="!result" class="empty-state">
                <div class="icon-circle">
                  <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p>Enter your quarterly income and deduction details to calculate your estimated tax liability.</p>
              </div>

              <div *ngIf="result" class="result-details">
                <div class="total-box">
                  <span class="total-label">Estimated Tax Due ({{ result.quarter }})</span>
                  <span class="total-amount">{{ getCurrencySymbol() }}{{ result.totalEstimatedTax | number:'1.2-2' }}</span>
                  <span class="effective-rate">Effective Tax Rate: {{ result.effectiveTaxRate }}%</span>
                </div>

                <div class="metric-group">
                  <div class="metric-row">
                    <span>Gross Quarterly Income</span>
                    <span class="val">{{ getCurrencySymbol() }}{{ result.grossIncome | number:'1.2-2' }}</span>
                  </div>
                  <div class="metric-row">
                    <span>Total Deductions</span>
                    <span class="val text-success">- {{ getCurrencySymbol() }}{{ result.totalDeductions | number:'1.2-2' }}</span>
                  </div>
                  <div class="metric-row highlight">
                    <span>Taxable Net Income</span>
                    <span class="val font-bold">{{ getCurrencySymbol() }}{{ result.taxableIncome | number:'1.2-2' }}</span>
                  </div>
                </div>

                <div class="breakdown-section">
                  <h4>Tax Component Breakdown</h4>
                  <div class="metric-row">
                    <span>Federal Income Tax / Slab Tax</span>
                    <span class="val">{{ getCurrencySymbol() }}{{ result.federalTax | number:'1.2-2' }}</span>
                  </div>
                  <div class="metric-row" *ngIf="result.stateTax > 0">
                    <span>State / Local Tax</span>
                    <span class="val">{{ getCurrencySymbol() }}{{ result.stateTax | number:'1.2-2' }}</span>
                  </div>
                  <div class="metric-row">
                    <span>Self-Employment / Cess Surcharge</span>
                    <span class="val">{{ getCurrencySymbol() }}{{ result.selfEmploymentTax | number:'1.2-2' }}</span>
                  </div>
                </div>

                <div class="tip-card">
                  <svg width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <strong>Tax Savings Tip</strong>
                    <p>Maximizing retirement contributions (e.g. SEP IRA, Solo 401(k), or PPF) can lower your taxable net income further!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: TAX CALENDAR & REMINDERS -->
          <div *ngIf="activeTab === 'calendar'" class="calendar-container">
            <div class="card calendar-card">
              <div class="card-header">
                <div>
                  <h3>Tax Calendar & Important Due Dates</h3>
                  <p class="subtitle">Stay compliant with quarterly estimated tax payment deadlines.</p>
                </div>
              </div>

              <div class="reminders-list">
                <div *ngFor="let item of reminders" class="reminder-item" [class.payment-type]="item.type === 'payment'">
                  <div class="date-badge" [class.due-soon]="item.status === 'due_soon'" [class.completed]="item.status === 'completed'">
                    <span class="quarter">{{ item.quarter }}</span>
                    <span class="status-tag">{{ item.status | uppercase }}</span>
                  </div>

                  <div class="reminder-content">
                    <div class="reminder-header">
                      <span class="reminder-title">{{ item.title }}</span>
                      <span class="reminder-date">Due: {{ item.dueDate }}</span>
                    </div>
                    <p class="reminder-desc">{{ item.description }}</p>
                  </div>

                  <div class="action-box">
                    <button class="btn-action" *ngIf="item.status !== 'completed'" (click)="markAsCompleted(item)">
                      Mark Paid
                    </button>
                    <span class="paid-badge" *ngIf="item.status === 'completed'">
                      ✓ Done
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 32px;
      transition: margin-left 0.3s ease;
    }

    .tax-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .tab-header {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 12px;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      background: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      background-color: #e2e8f0;
      color: #0f172a;
    }

    .tab-btn.active {
      background-color: #0ea5e9;
      color: white;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
    }

    .tax-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .card-header h3 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }

    .tax-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .form-input:focus {
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
    }

    .input-prefix-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol {
      position: absolute;
      left: 12px;
      color: #64748b;
      font-weight: 600;
    }

    .form-input.prefixed {
      padding-left: 30px;
    }

    .section-divider {
      display: flex;
      align-items: center;
      margin: 8px 0;
    }

    .section-divider span {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0ea5e9;
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .btn-submit {
      margin-top: 12px;
      padding: 12px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .btn-submit:hover {
      opacity: 0.92;
    }

    /* Results Card */
    .badge {
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: #94a3b8;
    }

    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      color: #64748b;
    }

    .total-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 20px;
    }

    .total-label {
      font-size: 13px;
      color: #94a3b8;
    }

    .total-amount {
      font-size: 28px;
      font-weight: 800;
      color: #38bdf8;
    }

    .effective-rate {
      font-size: 12px;
      color: #cbd5e1;
    }

    .metric-group, .breakdown-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .breakdown-section h4 {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #475569;
      padding-bottom: 6px;
      border-bottom: 1px dashed #f1f5f9;
    }

    .metric-row.highlight {
      border-bottom: none;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      color: #0f172a;
    }

    .val {
      font-weight: 600;
      color: #0f172a;
    }

    .text-success {
      color: #10b981;
    }

    .font-bold {
      font-weight: 700;
    }

    .tip-card {
      background: #fffbe6;
      border: 1px solid #fef08a;
      padding: 12px 16px;
      border-radius: 10px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      font-size: 12px;
      color: #78350f;
    }

    /* Calendar Styling */
    .reminders-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .reminder-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    .reminder-item.payment-type {
      border-left: 4px solid #0ea5e9;
    }

    .date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 70px;
      padding: 8px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .quarter {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    .status-tag {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
    }

    .date-badge.due-soon {
      background: #fef3c7;
      border-color: #fde047;
    }
    .date-badge.due-soon .status-tag {
      color: #b45309;
    }

    .date-badge.completed {
      background: #dcfce7;
      border-color: #86efac;
    }
    .date-badge.completed .status-tag {
      color: #15803d;
    }

    .reminder-content {
      flex: 1;
    }

    .reminder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .reminder-title {
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
    }

    .reminder-date {
      font-size: 12px;
      color: #0ea5e9;
      font-weight: 600;
    }

    .reminder-desc {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .btn-action {
      padding: 6px 14px;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: #0ea5e9;
      color: white;
      border-color: #0ea5e9;
    }

    .paid-badge {
      font-size: 12px;
      font-weight: 700;
      color: #16a34a;
    }

    @media (max-width: 900px) {
      .tax-grid {
        grid-template-columns: 1fr;
      }
      .main-content {
        margin-left: 0;
        padding: 16px;
      }
    }
  `]
})
export class TaxEstimatorComponent implements OnInit {
  isSidebarOpen = false;
  currentUser: User | null = null;
  activeTab: 'calculator' | 'calendar' = 'calculator';

  params: TaxCalculationParams = {
    country: 'United States',
    state: 'California',
    filingStatus: 'single',
    quarter: 'Q2',
    grossIncome: 12000,
    businessExpenses: 1500,
    retirementContributions: 1000,
    healthInsurancePremiums: 500,
    homeOfficeDeduction: 300
  };

  result: TaxEstimateResult | null = null;
  reminders: TaxReminder[] = [];

  constructor(
    private authService: AuthService,
    private taxService: TaxEstimatorService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.taxService.getTaxReminders().subscribe(reminders => {
      this.reminders = reminders;
    });

    this.onCalculate();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  onCountryChange(): void {
    this.onCalculate();
  }

  getCurrencySymbol(): string {
    return this.params.country === 'India' ? '₹' : '$';
  }

  onCalculate(): void {
    this.taxService.calculateTax(this.params).subscribe(res => {
      this.result = res;
      this.loadReminders();
    });
  }

  switchTab(tab: 'calculator' | 'calendar'): void {
    this.activeTab = tab;
    if (tab === 'calendar') {
      this.loadReminders();
    }
  }

  loadReminders(): void {
    this.taxService.getTaxReminders().subscribe(reminders => {
      this.reminders = reminders;
    });
  }

  markAsCompleted(item: TaxReminder): void {
    item.status = 'completed';
    this.taxService.updateReminderStatus(item.id, 'completed').subscribe();
  }
}
