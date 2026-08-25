import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  TaxEstimatorService,
  TaxCalculationParams,
  TaxEstimateResult,
  TaxAlert
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

          <!-- Navigation Tabs -->

          <div class="tab-header">

            <button
              class="tab-btn"
              [class.active]="activeTab === 'calculator'"
              (click)="switchTab('calculator')">

              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24">

                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />

              </svg>

              Tax Calculator

            </button>


            <button
              class="tab-btn"
              [class.active]="activeTab === 'calendar'"
              (click)="switchTab('calendar')">

              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24">

                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

              </svg>

              Tax Calendar & Alerts

            </button>

          </div>


          <!-- ================= TAX CALCULATOR ================= -->

          <div
            *ngIf="activeTab === 'calculator'"
            class="tax-grid">


            <!-- FORM CARD -->

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
                #taxForm="ngForm"
                class="tax-form">


                <!-- COUNTRY -->

                <div class="form-row">

                  <div class="form-group">

                    <label>Country / Region</label>

                    <select
                      [(ngModel)]="params.country"
                      name="country"
                      class="form-input"
                      (change)="onCountryChange()">

                      <option value="United States">
                        United States
                      </option>

                      <option value="India">
                        India
                      </option>

                      <option value="Canada">
                        Canada
                      </option>

                      <option value="United Kingdom">
                        United Kingdom
                      </option>

                    </select>

                  </div>


                  <!-- STATE -->

                  <div
                    class="form-group"
                    *ngIf="params.country === 'United States'">

                    <label>State / Province</label>

                    <select
                      [(ngModel)]="params.state"
                      name="state"
                      class="form-input">

                      <option value="California">
                        California
                      </option>

                      <option value="New York">
                        New York
                      </option>

                      <option value="Texas">
                        Texas
                      </option>

                      <option value="Florida">
                        Florida
                      </option>

                    </select>

                  </div>

                </div>


                <!-- FILING STATUS -->

                <div class="form-row">

                  <div class="form-group">

                    <label>Filing Status</label>

                    <select
                      [(ngModel)]="params.filingStatus"
                      name="filingStatus"
                      class="form-input">

                      <option value="single">
                        Single
                      </option>

                      <option value="married_joint">
                        Married Filing Jointly
                      </option>

                      <option value="head_of_household">
                        Head of Household
                      </option>

                    </select>

                  </div>


                  <!-- QUARTER -->

                  <div class="form-group">

                    <label>Fiscal Quarter</label>

                    <select
                      [(ngModel)]="params.quarter"
                      name="quarter"
                      class="form-input">

                      <option value="Q1">
                        Q1 (Jan - Mar)
                      </option>

                      <option value="Q2">
                        Q2 (Apr - Jun)
                      </option>

                      <option value="Q3">
                        Q3 (Jul - Sep)
                      </option>

                      <option value="Q4">
                        Q4 (Oct - Dec)
                      </option>

                    </select>

                  </div>

                </div>


                <!-- GROSS INCOME -->

                <div class="section-divider">
                  <span>Gross Income</span>
                </div>


                <div class="form-group">

                  <label>
                    Gross Quarterly Income
                  </label>

                  <div class="input-prefix-wrapper">

                    <span class="currency-symbol">
                      {{ getCurrencySymbol() }}
                    </span>

                    <input
                      type="number"
                      [(ngModel)]="params.grossIncome"
                      name="grossIncome"
                      class="form-input prefixed"
                      placeholder="0.00"
                      min="0"
                      required>

                  </div>

                </div>


                <!-- DEDUCTIONS -->

                <div class="section-divider">
                  <span>Deductions & Expenses</span>
                </div>


                <div class="form-row">

                  <div class="form-group">

                    <label>Business Expenses</label>

                    <div class="input-prefix-wrapper">

                      <span class="currency-symbol">
                        {{ getCurrencySymbol() }}
                      </span>

                      <input
                        type="number"
                        [(ngModel)]="params.businessExpenses"
                        name="businessExpenses"
                        class="form-input prefixed"
                        placeholder="0.00"
                        min="0">

                    </div>

                  </div>


                  <div class="form-group">

                    <label>
                      Retirement Contributions
                    </label>

                    <div class="input-prefix-wrapper">

                      <span class="currency-symbol">
                        {{ getCurrencySymbol() }}
                      </span>

                      <input
                        type="number"
                        [(ngModel)]="params.retirementContributions"
                        name="retirementContributions"
                        class="form-input prefixed"
                        placeholder="0.00"
                        min="0">

                    </div>

                  </div>

                </div>


                <div class="form-row">

                  <div class="form-group">

                    <label>
                      Health Insurance Premiums
                    </label>

                    <div class="input-prefix-wrapper">

                      <span class="currency-symbol">
                        {{ getCurrencySymbol() }}
                      </span>

                      <input
                        type="number"
                        [(ngModel)]="params.healthInsurancePremiums"
                        name="healthInsurancePremiums"
                        class="form-input prefixed"
                        placeholder="0.00"
                        min="0">

                    </div>

                  </div>


                  <div class="form-group">

                    <label>
                      Home Office Deduction
                    </label>

                    <div class="input-prefix-wrapper">

                      <span class="currency-symbol">
                        {{ getCurrencySymbol() }}
                      </span>

                      <input
                        type="number"
                        [(ngModel)]="params.homeOfficeDeduction"
                        name="homeOfficeDeduction"
                        class="form-input prefixed"
                        placeholder="0.00"
                        min="0">

                    </div>

                  </div>

                </div>


                <button
                  type="submit"
                  class="btn-submit">

                  Calculate Estimated Tax

                </button>

              </form>

            </div>


            <!-- RESULT CARD -->

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

                <div class="icon-circle">

                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24">

                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />

                  </svg>

                </div>

                <p>
                  Enter your quarterly income and deduction details
                  to calculate your estimated tax liability.
                </p>

              </div>


              <div
                *ngIf="result"
                class="result-details">


                <div class="total-box">

                  <span class="total-label">

                    Estimated Tax Due
                    ({{ result.quarter }})

                  </span>


                  <span class="total-amount">

                    {{ getCurrencySymbol() }}
                    {{ result.totalEstimatedTax | number:'1.2-2' }}

                  </span>


                  <span class="effective-rate">

                    Effective Tax Rate:
                    {{ result.effectiveTaxRate }}%

                  </span>

                </div>


                <div class="metric-group">

                  <div class="metric-row">

                    <span>
                      Gross Quarterly Income
                    </span>

                    <span class="val">

                      {{ getCurrencySymbol() }}
                      {{ result.grossIncome | number:'1.2-2' }}

                    </span>

                  </div>


                  <div class="metric-row">

                    <span>
                      Total Deductions
                    </span>

                    <span class="val text-success">

                      -
                      {{ getCurrencySymbol() }}
                      {{ result.totalDeductions | number:'1.2-2' }}

                    </span>

                  </div>


                  <div class="metric-row highlight">

                    <span>
                      Taxable Net Income
                    </span>

                    <span class="val font-bold">

                      {{ getCurrencySymbol() }}
                      {{ result.taxableIncome | number:'1.2-2' }}

                    </span>

                  </div>

                </div>


                <div class="breakdown-section">

                  <h4>
                    Tax Component Breakdown
                  </h4>


                  <div class="metric-row">

                    <span>
                      Federal Income Tax / Slab Tax
                    </span>

                    <span class="val">

                      {{ getCurrencySymbol() }}
                      {{ result.federalTax | number:'1.2-2' }}

                    </span>

                  </div>


                  <div
                    class="metric-row"
                    *ngIf="result.stateTax > 0">

                    <span>
                      State / Local Tax
                    </span>

                    <span class="val">

                      {{ getCurrencySymbol() }}
                      {{ result.stateTax | number:'1.2-2' }}

                    </span>

                  </div>


                  <div class="metric-row">

                    <span>
                      Self-Employment / Cess Surcharge
                    </span>

                    <span class="val">

                      {{ getCurrencySymbol() }}
                      {{ result.selfEmploymentTax | number:'1.2-2' }}

                    </span>

                  </div>

                </div>


                <div class="tip-card">

                  <div>

                    <strong>
                      Tax Savings Tip
                    </strong>

                    <p>
                      Maximizing retirement contributions can lower
                      your taxable income further.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          <!-- ================= TAX ALERTS ================= -->

          <div
            *ngIf="activeTab === 'calendar'"
            class="calendar-container">


            <div class="card calendar-card">


              <div class="card-header">

                <div>

                  <h3>
                    Tax Calendar & Important Due Dates
                  </h3>

                  <p class="subtitle">

                    Stay compliant with quarterly estimated
                    tax payment deadlines.

                  </p>

                </div>


                <button
                  class="btn-create-alerts"
                  (click)="createQuarterlyAlerts()">

                  Create Alerts

                </button>

              </div>


              <!-- EMPTY STATE -->

              <div
                *ngIf="alerts.length === 0"
                class="empty-alert">

                No tax alerts found.

                <br>

                Click
                <strong>Create Alerts</strong>
                to generate quarterly tax reminders.

              </div>


              <!-- ALERT LIST -->

              <div
                *ngIf="alerts.length > 0"
                class="reminders-list">


                <div
                  *ngFor="let item of alerts"
                  class="reminder-item"
                  [class.completed]="item.is_resolved === 1">


                  <!-- ALERT BADGE -->

                  <div
                    class="date-badge"
                    [class.completed]="item.is_resolved === 1">


                    <span class="quarter">

                      {{ getQuarterFromDate(item.due_date) }}

                    </span>


                    <span class="status-tag">

                      {{
                        item.is_resolved === 1
                          ? 'COMPLETED'
                          : 'UPCOMING'
                      }}

                    </span>

                  </div>


                  <!-- ALERT CONTENT -->

                  <div class="reminder-content">


                    <div class="reminder-header">

                      <span class="reminder-title">

                        {{ item.title }}

                      </span>


                      <span class="reminder-date">

                        Due:
                        {{ item.due_date | date:'mediumDate' }}

                      </span>

                    </div>


                    <p class="reminder-desc">

                      {{ item.message }}

                    </p>


                    <span
                      class="alert-severity"
                      [class.warning]="item.severity === 'warning'">

                      {{ item.severity | uppercase }}

                    </span>


                  </div>


                  <!-- ACTION -->

                  <div class="action-box">


                    <button
                      class="btn-action"
                      *ngIf="item.is_resolved !== 1"
                      (click)="markAsResolved(item)">

                      Mark Paid

                    </button>


                    <span
                      class="paid-badge"
                      *ngIf="item.is_resolved === 1">

                      ✓ Done

                    </span>


                    <button
                      class="btn-delete"
                      (click)="deleteAlert(item)">

                      Delete

                    </button>


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
      gap: 16px;
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
      margin: 8px 0;
    }

    .section-divider span {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #0ea5e9;
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .btn-submit {
      margin-top: 12px;
      padding: 12px;
      background: #0ea5e9;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }

    .badge {
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }

    .empty-state {
      padding: 48px 24px;
      text-align: center;
      color: #94a3b8;
    }

    .total-box {
      background: #0f172a;
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
    }

    .total-amount {
      font-size: 28px;
      font-weight: 800;
    }

    .effective-rate {
      font-size: 12px;
    }

    .metric-group,
    .breakdown-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      padding-bottom: 6px;
      border-bottom: 1px dashed #e2e8f0;
    }

    .highlight {
      font-weight: 700;
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
      font-size: 12px;
    }

    /* ALERTS */

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

    .date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 75px;
      padding: 8px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .date-badge.completed {
      background: #dcfce7;
      border-color: #86efac;
    }

    .quarter {
      font-size: 16px;
      font-weight: 800;
    }

    .status-tag {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
    }

    .reminder-content {
      flex: 1;
    }

    .reminder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }

    .reminder-title {
      font-weight: 700;
      font-size: 14px;
    }

    .reminder-date {
      font-size: 12px;
      color: #0ea5e9;
      font-weight: 600;
    }

    .reminder-desc {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0;
    }

    .alert-severity {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
    }

    .alert-severity.warning {
      color: #d97706;
    }

    .action-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-action {
      padding: 6px 14px;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-delete {
      padding: 6px 10px;
      border: 1px solid #fecaca;
      background: white;
      color: #dc2626;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }

    .paid-badge {
      font-size: 12px;
      font-weight: 700;
      color: #16a34a;
    }

    .btn-create-alerts {
      padding: 9px 14px;
      background: #0ea5e9;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .empty-alert {
      text-align: center;
      padding: 40px;
      color: #64748b;
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

      .reminder-item {
        flex-direction: column;
        align-items: flex-start;
      }

      .action-box {
        width: 100%;
      }

    }

  `]
})


export class TaxEstimatorComponent implements OnInit {

  isSidebarOpen = false;

  currentUser: User | null = null;

  activeTab: 'calculator' | 'calendar' =
    'calculator';


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


  alerts: TaxAlert[] = [];


  constructor(

    private authService: AuthService,

    private taxService: TaxEstimatorService

  ) { }


  ngOnInit(): void {

    this.authService.currentUser$
      .subscribe(user => {

        this.currentUser = user;

      });


    this.loadAlerts();


    this.onCalculate();

  }


  toggleSidebar(): void {

    this.isSidebarOpen =
      !this.isSidebarOpen;

  }


  logout(): void {

    this.authService.logout();

  }


  onCountryChange(): void {

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

          console.error(
            'Tax calculation error:',
            error
          );

        }

      });

  }


  switchTab(
    tab: 'calculator' | 'calendar'
  ): void {

    this.activeTab = tab;


    if (tab === 'calendar') {

      this.loadAlerts();

    }

  }


  loadAlerts(): void {

    this.taxService
      .getAlerts()
      .subscribe({

        next: (alerts) => {

          this.alerts = alerts;

        },

        error: (error) => {

          console.error(
            'Error loading alerts:',
            error
          );

          this.alerts = [];

        }

      });

  }


  createQuarterlyAlerts(): void {

    const year =
      new Date().getFullYear();


    this.taxService
      .createQuarterlyAlerts(year)
      .subscribe({

        next: () => {

          this.loadAlerts();

        },

        error: (error) => {

          console.error(
            'Error creating alerts:',
            error
          );

        }

      });

  }


  markAsResolved(
    alert: TaxAlert
  ): void {

    this.taxService
      .markAlertAsResolved(alert.id)
      .subscribe({

        next: () => {

          alert.is_resolved = 1;

        },

        error: (error) => {

          console.error(
            'Error resolving alert:',
            error
          );

        }

      });

  }


  deleteAlert(
    alert: TaxAlert
  ): void {

    this.taxService
      .deleteAlert(alert.id)
      .subscribe({

        next: () => {

          this.alerts =
            this.alerts.filter(
              item => item.id !== alert.id
            );

        },

        error: (error) => {

          console.error(
            'Error deleting alert:',
            error
          );

        }

      });

  }


  getQuarterFromDate(
    date: string
  ): string {

    const month =
      new Date(date).getMonth() + 1;


    if (
      month >= 4 &&
      month <= 6
    ) {

      return 'Q1';

    }


    if (
      month >= 7 &&
      month <= 9
    ) {

      return 'Q2';

    }


    if (
      month >= 10 &&
      month <= 12
    ) {

      return 'Q3';

    }


    return 'Q4';

  }

}