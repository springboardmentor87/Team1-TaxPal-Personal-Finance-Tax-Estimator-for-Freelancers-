import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  TaxEstimatorService,
  TaxCalculationParams,
  TaxEstimateResult,
  TaxReminder
} from './tax-estimator.service';

import { SidebarComponent } from '../shared/sidebar';
import { HeaderComponent } from '../shared/header';
import { AuthService } from '../auth/auth.service';
import { User } from '../transactions/transaction.model';

@Component({
  selector: 'app-tax-estimator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent
  ],

  template: `
    <div class="app-layout">

      <app-sidebar
        [isOpen]="isSidebarOpen"
        [user]="currentUser"
        (toggle)="toggleSidebar()"
        (logout)="logout()">
      </app-sidebar>

      <main class="main-content">

        <app-header
          [title]="'Tax Estimator'"
          (toggleSidebar)="toggleSidebar()">
        </app-header>

        <div class="tax-container">

          <div class="tab-header">

            <button
              class="tab-btn"
              [class.active]="activeTab === 'calculator'"
              (click)="switchTab('calculator')">

              Tax Calculator

            </button>

            <button
              class="tab-btn"
              [class.active]="activeTab === 'calendar'"
              (click)="switchTab('calendar')">

              Tax Calendar & Reminders

            </button>

          </div>

          <div
            *ngIf="activeTab === 'calculator'"
            class="tax-grid">

            <div class="card form-card">

              <div class="card-header">
                <div>
                  <h3>Quarterly Tax Calculator</h3>
                  <p class="subtitle">
                    Calculate your estimated quarterly tax liability.
                  </p>
                </div>
              </div>

              <form
                (ngSubmit)="onCalculate()"
                class="tax-form">

                <div class="form-row">

                  <div class="form-group">

                    <label>Country / Region</label>

                    <select
                      [(ngModel)]="params.country"
                      name="country"
                      class="form-input"
                      (change)="onCountryChange()">

                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>

                    </select>

                  </div>

                  <div
                    class="form-group"
                    *ngIf="params.country === 'United States'">

                    <label>State</label>

                    <select
                      [(ngModel)]="params.state"
                      name="state"
                      class="form-input">

                      <option value="California">California</option>
                      <option value="New York">New York</option>
                      <option value="Texas">Texas</option>
                      <option value="Florida">Florida</option>

                    </select>

                  </div>

                </div>

                <div class="form-row">

                  <div class="form-group">

                    <label>Filing Status</label>

                    <select
                      [(ngModel)]="params.filingStatus"
                      name="filingStatus"
                      class="form-input">

                      <option value="single">Single</option>

                      <option value="married_joint">
                        Married Filing Jointly
                      </option>

                      <option value="head_of_household">
                        Head of Household
                      </option>

                    </select>

                  </div>

                  <div class="form-group">

                    <label>Fiscal Quarter</label>

                    <select
                      [(ngModel)]="params.quarter"
                      name="quarter"
                      class="form-input">

                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>

                    </select>

                  </div>

                </div>

                <div class="section-divider">
                  <span>Gross Income</span>
                </div>

                <div class="form-group">

                  <label>Gross Quarterly Income</label>

                  <div class="input-prefix-wrapper">

                    <span class="currency-symbol">
                      {{ getCurrencySymbol() }}
                    </span>

                    <input
                      type="number"
                      [(ngModel)]="params.grossIncome"
                      name="grossIncome"
                      class="form-input prefixed"
                      min="0">

                  </div>

                </div>

                <div class="section-divider">
                  <span>Deductions & Expenses</span>
                </div>

                <div class="form-row">

                  <div class="form-group">

                    <label>Business Expenses</label>

                    <input
                      type="number"
                      [(ngModel)]="params.businessExpenses"
                      name="businessExpenses"
                      class="form-input"
                      min="0">

                  </div>

                  <div class="form-group">

                    <label>Retirement Contributions</label>

                    <input
                      type="number"
                      [(ngModel)]="params.retirementContributions"
                      name="retirementContributions"
                      class="form-input"
                      min="0">

                  </div>

                </div>

                <div class="form-row">

                  <div class="form-group">

                    <label>Health Insurance Premiums</label>

                    <input
                      type="number"
                      [(ngModel)]="params.healthInsurancePremiums"
                      name="healthInsurancePremiums"
                      class="form-input"
                      min="0">

                  </div>

                  <div class="form-group">

                    <label>Home Office Deduction</label>

                    <input
                      type="number"
                      [(ngModel)]="params.homeOfficeDeduction"
                      name="homeOfficeDeduction"
                      class="form-input"
                      min="0">

                  </div>

                </div>

                <button
                  type="submit"
                  class="btn-submit">

                  Calculate Estimated Tax

                </button>

              </form>

            </div>

            <div class="card result-card">

              <div class="card-header">

                <h3>Tax Summary</h3>

                <span
                  class="badge"
                  *ngIf="result">

                  {{ params.quarter }} Overview

                </span>

              </div>

              <div
                *ngIf="!result"
                class="empty-state">

                Enter income details to calculate your tax.

              </div>

              <div
                *ngIf="result"
                class="result-details">

                <div class="total-box">

                  <span class="total-label">
                    Estimated Tax Due
                  </span>

                  <span class="total-amount">
                    {{ getCurrencySymbol() }}{{ getTotalTax() | number:'1.2-2' }}
                  </span>

                  <span class="effective-rate">
                    Effective Tax Rate:
                    {{ result.effectiveTaxRate ?? 0 }}%
                  </span>

                </div>

                <div class="metric-group">

                  <div class="metric-row">

                    <span>Gross Income</span>

                    <span class="val">
                      {{ getCurrencySymbol() }}{{ getGrossIncome() | number:'1.2-2' }}
                    </span>

                  </div>

                  <div class="metric-row">

                    <span>Total Deductions</span>

                    <span class="val text-success">
                      - {{ getCurrencySymbol() }}{{ getTotalDeductions() | number:'1.2-2' }}
                    </span>

                  </div>

                  <div class="metric-row highlight">

                    <span>Taxable Income</span>

                    <span class="val font-bold">
                      {{ getCurrencySymbol() }}{{ getTaxableIncome() | number:'1.2-2' }}
                    </span>

                  </div>

                </div>

                <div class="breakdown-section">

                  <h4>Tax Component Breakdown</h4>

                  <div class="metric-row">

                    <span>Federal / Income Tax</span>

                    <span class="val">
                      {{ getCurrencySymbol() }}{{ result.federalTax ?? 0 | number:'1.2-2' }}
                    </span>

                  </div>

                  <div
                    class="metric-row"
                    *ngIf="(result.stateTax ?? 0) > 0">

                    <span>State Tax</span>

                    <span class="val">
                      {{ getCurrencySymbol() }}{{ result.stateTax ?? 0 | number:'1.2-2' }}
                    </span>

                  </div>

                  <div class="metric-row">

                    <span>Additional Tax</span>

                    <span class="val">
                      {{ getCurrencySymbol() }}{{ result.selfEmploymentTax ?? 0 | number:'1.2-2' }}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div
            *ngIf="activeTab === 'calendar'"
            class="calendar-container">

            <div class="card">

              <div class="card-header">

                <div>

                  <h3>Tax Calendar & Reminders</h3>

                  <p class="subtitle">
                    Stay updated with tax payment deadlines.
                  </p>

                </div>

              </div>

              <div class="reminders-list">

                <div
                  *ngFor="let item of reminders"
                  class="reminder-item">

                  <div
                    class="date-badge"
                    [class.completed]="item.status === 'completed'"
                    [class.due-soon]="item.status === 'due_soon'">

                    <span class="quarter">
                      {{ item.quarter }}
                    </span>

                    <span class="status-tag">
                      {{ item.status || 'upcoming' }}
                    </span>

                  </div>

                  <div class="reminder-content">

                    <div class="reminder-header">

                      <span class="reminder-title">
                        {{ item.title }}
                      </span>

                      <span class="reminder-date">
                        Due: {{ item.dueDate }}
                      </span>

                    </div>

                    <p class="reminder-desc">
                      {{ item.description }}
                    </p>

                  </div>

                  <div class="action-box">

                    <button
                      *ngIf="item.status !== 'completed'"
                      class="btn-action"
                      (click)="markAsCompleted(item)">

                      Mark Paid

                    </button>

                    <span
                      *ngIf="item.status === 'completed'"
                      class="paid-badge">

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
      background: #f8fafc;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 32px;
    }

    .tax-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .tab-header {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .tab-btn {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-weight: 600;
    }

    .tab-btn.active {
      background: #0ea5e9;
      color: white;
    }

    .tax-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .subtitle {
      color: #64748b;
      font-size: 13px;
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

    .form-input {
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
    }

    .section-divider span {
      font-size: 12px;
      font-weight: 700;
      color: #0ea5e9;
    }

    .input-prefix-wrapper {
      position: relative;
    }

    .currency-symbol {
      position: absolute;
      left: 12px;
      top: 10px;
    }

    .prefixed {
      padding-left: 30px;
      width: 100%;
      box-sizing: border-box;
    }

    .btn-submit {
      padding: 12px;
      border: none;
      border-radius: 8px;
      background: #0ea5e9;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .badge {
      background: #e0f2fe;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
    }

    .empty-state {
      padding: 50px 20px;
      text-align: center;
      color: #64748b;
    }

    .total-box {
      background: #0f172a;
      color: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }

    .total-amount {
      font-size: 28px;
      font-weight: 800;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .text-success {
      color: #16a34a;
    }

    .font-bold {
      font-weight: 700;
    }

    .reminders-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .reminder-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    .date-badge {
      min-width: 70px;
      padding: 8px;
      text-align: center;
      background: white;
      border-radius: 8px;
    }

    .date-badge.completed {
      background: #dcfce7;
    }

    .date-badge.due-soon {
      background: #fef3c7;
    }

    .quarter {
      display: block;
      font-weight: 800;
    }

    .status-tag {
      font-size: 10px;
    }

    .reminder-content {
      flex: 1;
    }

    .reminder-header {
      display: flex;
      justify-content: space-between;
    }

    .reminder-title {
      font-weight: 700;
    }

    .reminder-date {
      color: #0ea5e9;
    }

    .reminder-desc {
      color: #64748b;
      font-size: 13px;
    }

    .btn-action {
      padding: 7px 12px;
      border: 1px solid #0ea5e9;
      background: white;
      border-radius: 6px;
      cursor: pointer;
    }

    .paid-badge {
      color: #16a34a;
      font-weight: 700;
    }

    @media (max-width: 900px) {

      .tax-grid {
        grid-template-columns: 1fr;
      }

      .main-content {
        margin-left: 0;
        padding: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

    }

  `]
})
export class TaxEstimatorComponent implements OnInit {

  isSidebarOpen = false;

  currentUser: User | null = null;

  activeTab: 'calculator' | 'calendar' = 'calculator';

  params: TaxCalculationParams = {
    country: 'India',
    state: '',
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
  ) { }

  ngOnInit(): void {

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadReminders();

    this.onCalculate();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  onCountryChange(): void {

    if (this.params.country !== 'United States') {
      this.params.state = '';
    }

    this.onCalculate();
  }

  getCurrencySymbol(): string {
    return this.params.country === 'India'
      ? '₹'
      : '$';
  }

  onCalculate(): void {

    this.taxService
      .calculateTax(this.params)
      .subscribe({
        next: (res) => {
          this.result = res;
        },
        error: (error) => {
          console.error('Tax calculation error:', error);
        }
      });
  }

  switchTab(
    tab: 'calculator' | 'calendar'
  ): void {

    this.activeTab = tab;

    if (tab === 'calendar') {
      this.loadReminders();
    }
  }

  loadReminders(): void {

    this.taxService
      .getTaxReminders()
      .subscribe({
        next: (reminders) => {
          this.reminders = reminders;
        },
        error: (error) => {
          console.error('Reminder loading error:', error);
        }
      });
  }

  markAsCompleted(
    item: TaxReminder
  ): void {

    const previousStatus = item.status;

    item.status = 'completed';

    this.taxService
      .updateReminderStatus(
        item.id,
        'completed'
      )
      .subscribe({
        error: () => {
          item.status = previousStatus;
        }
      });
  }

  getGrossIncome(): number {

    if (!this.result) {
      return 0;
    }

    return Number(
      this.result.grossIncome ??
      this.result.total_income ??
      0
    );
  }

  getTotalDeductions(): number {

    if (!this.result) {
      return 0;
    }

    return Number(
      this.result.totalDeductions ??
      this.result.total_expenses ??
      0
    );
  }

  getTaxableIncome(): number {

    if (!this.result) {
      return 0;
    }

    return Number(
      this.result.taxableIncome ??
      this.result.taxable_income ??
      0
    );
  }

  getTotalTax(): number {

    if (!this.result) {
      return 0;
    }

    return Number(
      this.result.totalEstimatedTax ??
      this.result.estimated_tax ??
      0
    );
  }
}