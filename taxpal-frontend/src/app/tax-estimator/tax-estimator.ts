import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SidebarComponent } from '../shared/sidebar';
import { HeaderComponent } from '../shared/header';
import { TransactionService } from '../transactions/transaction.service';
import { CurrencyService } from '../shared/currency.service';
import { User } from '../transactions/transaction.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface TaxCalculationResult {
  financialYear: string;
  regime: string;
  annualIncome: number;
  businessIncome: number;
  otherIncome: number;
  grossIncome: number;
  businessExpenses: number;
  eligibleDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  taxableIncome: number;
  basicTax: number;
  rebateApplied: number;
  cess: number;
  estimatedTax: number;
  effectiveTaxRate: number;
  netIncome: number;
}

interface RegimeComparison {
  newRegimeTax: number;
  oldRegimeTax: number;
  betterRegime: 'new' | 'old';
  saving: number;
}

@Component({
  selector: 'app-tax-estimator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="sidebarOpen()" 
        [user]="user"
        (toggle)="toggleSidebar()"
        (logout)="logout()">
      </app-sidebar>
      
      <!-- Main Content Area -->
      <main class="main-content">
        <app-header 
          [title]="'Tax Estimator'" 
          [subtitle]="'Estimate your income tax liability and compare regimes in real time'"
          (toggleSidebar)="toggleSidebar()">
          
          <button class="btn btn-secondary shadow-sm" (click)="prefillFromLedger()" [disabled]="isLoadingPrefill">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18m0 0V9m0-5h-5m-9 5h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
            </svg>
            {{ isLoadingPrefill ? 'Loading Ledger...' : 'Prefill from Ledger' }}
          </button>
        </app-header>

        <!-- Toast Notification for Prefill Info -->
        <div class="alert alert-success" *ngIf="prefillMessage">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <span>{{ prefillMessage }}</span>
          </div>
          <button class="btn-close-alert" (click)="prefillMessage = ''">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="estimator-grid">
          
          <!-- LEFT COLUMN: Input Form -->
          <div class="card form-card">
            <div class="card-header-bar">
              <h3 class="section-title">Tax Assessment Form</h3>
              <span class="currency-tag">Currency: {{ currencySymbol }} (INR)</span>
            </div>

            <form [formGroup]="taxForm" (ngSubmit)="onSubmit()">
              
              <!-- Section 1: Income Details -->
              <div class="form-section">
                <h4 class="form-section-title">
                  <span class="section-badge">1</span>
                  Income Details
                </h4>
                
                <div class="form-group">
                  <label class="form-label" for="annualIncome">Annual/Salary Income</label>
                  <div class="input-container-icon">
                    <span class="input-icon">{{ currencySymbol }}</span>
                    <input 
                      type="number" 
                      id="annualIncome" 
                      formControlName="annualIncome" 
                      class="form-input icon-padded" 
                      placeholder="0.00"
                      min="0">
                  </div>
                  <div *ngIf="isInvalid('annualIncome', 'required')" class="input-error-msg">
                    Salary income is required. Input 0 if none.
                  </div>
                  <div *ngIf="isInvalid('annualIncome', 'min')" class="input-error-msg">
                    Income must be a positive number.
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="businessIncome">Business / Freelance Income</label>
                  <div class="input-container-icon">
                    <span class="input-icon">{{ currencySymbol }}</span>
                    <input 
                      type="number" 
                      id="businessIncome" 
                      formControlName="businessIncome" 
                      class="form-input icon-padded" 
                      placeholder="0.00"
                      min="0">
                  </div>
                  <div *ngIf="isInvalid('businessIncome', 'required')" class="input-error-msg">
                    Business income is required. Input 0 if none.
                  </div>
                  <div *ngIf="isInvalid('businessIncome', 'min')" class="input-error-msg">
                    Business income must be a positive number.
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="otherIncome">Other Income</label>
                  <div class="input-container-icon">
                    <span class="input-icon">{{ currencySymbol }}</span>
                    <input 
                      type="number" 
                      id="otherIncome" 
                      formControlName="otherIncome" 
                      class="form-input icon-padded" 
                      placeholder="0.00"
                      min="0">
                  </div>
                  <div *ngIf="isInvalid('otherIncome', 'required')" class="input-error-msg">
                    Other income is required. Input 0 if none.
                  </div>
                  <div *ngIf="isInvalid('otherIncome', 'min')" class="input-error-msg">
                    Other income must be a positive number.
                  </div>
                </div>
              </div>

              <!-- Section 2: Expense / Deduction Details -->
              <div class="form-section">
                <h4 class="form-section-title">
                  <span class="section-badge">2</span>
                  Expenses & Deductions
                </h4>

                <div class="form-group">
                  <label class="form-label" for="businessExpenses">Business Expenses</label>
                  <div class="input-container-icon">
                    <span class="input-icon">{{ currencySymbol }}</span>
                    <input 
                      type="number" 
                      id="businessExpenses" 
                      formControlName="businessExpenses" 
                      class="form-input icon-padded" 
                      placeholder="0.00"
                      min="0">
                  </div>
                  <div *ngIf="isInvalid('businessExpenses', 'required')" class="input-error-msg">
                    Business expenses are required. Input 0 if none.
                  </div>
                  <div *ngIf="isInvalid('businessExpenses', 'min')" class="input-error-msg">
                    Business expenses must be a positive number.
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="eligibleDeductions">Eligible Deductions (80C, 80D, etc.)</label>
                  <div class="input-container-icon">
                    <span class="input-icon">{{ currencySymbol }}</span>
                    <input 
                      type="number" 
                      id="eligibleDeductions" 
                      formControlName="eligibleDeductions" 
                      class="form-input icon-padded" 
                      placeholder="0.00"
                      min="0">
                  </div>
                  <div *ngIf="isInvalid('eligibleDeductions', 'required')" class="input-error-msg">
                    Deductions are required. Input 0 if none.
                  </div>
                  <div *ngIf="isInvalid('eligibleDeductions', 'min')" class="input-error-msg">
                    Deductions must be a positive number.
                  </div>
                  <span class="field-hint">Note: Deductions are generally NOT allowed under the New Tax Regime.</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="otherDeductions">Other Deductible Expenses</label>
                  <div class="input-container-icon">
                    <span class="input-icon">{{ currencySymbol }}</span>
                    <input 
                      type="number" 
                      id="otherDeductions" 
                      formControlName="otherDeductions" 
                      class="form-input icon-padded" 
                      placeholder="0.00"
                      min="0">
                  </div>
                  <div *ngIf="isInvalid('otherDeductions', 'required')" class="input-error-msg">
                    Other deductions are required. Input 0 if none.
                  </div>
                  <div *ngIf="isInvalid('otherDeductions', 'min')" class="input-error-msg">
                    Other deductions must be a positive number.
                  </div>
                </div>
              </div>

              <!-- Section 3: Tax Information -->
              <div class="form-section">
                <h4 class="form-section-title">
                  <span class="section-badge">3</span>
                  Tax Parameters
                </h4>

                <div class="form-group">
                  <label class="form-label" for="financialYear">Assessment Financial Year</label>
                  <select id="financialYear" formControlName="financialYear" class="form-input form-select">
                    <option value="2025-26">FY 2025-26 (AY 2026-27) - Current Slabs</option>
                    <option value="2024-25">FY 2024-25 (AY 2025-26) - Previous Slabs</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Tax Regime</label>
                  <div class="regime-flex-cards">
                    <label class="regime-card" [class.selected]="taxForm.get('taxRegime')?.value === 'new'">
                      <input type="radio" formControlName="taxRegime" value="new" class="sr-only">
                      <span class="regime-title">New Regime</span>
                      <span class="regime-summary">Default choice. Lower tax rates, rebate up to ₹12L (FY 26) or ₹7L (FY 25). Zero tax liability if income is below the rebate limit.</span>
                    </label>
                    <label class="regime-card" [class.selected]="taxForm.get('taxRegime')?.value === 'old'">
                      <input type="radio" formControlName="taxRegime" value="old" class="sr-only">
                      <span class="regime-title">Old Regime</span>
                      <span class="regime-summary">Enables deductions (80C up to ₹1.5L, 80D up to ₹25k, etc.). Recommended if you have high investments/savings.</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="form-footer-actions">
                <button type="button" class="btn btn-secondary" (click)="resetForm()">Reset Form</button>
                <button type="submit" class="btn btn-primary" [disabled]="taxForm.invalid">
                  Calculate Tax Summary
                </button>
              </div>

            </form>
          </div>

          <!-- RIGHT COLUMN: Calculation Summary & Comparison -->
          <div class="card result-card" [class.has-results]="showResults">
            
            <!-- Empty state when no calculations have been run -->
            <div class="results-empty-state" *ngIf="!showResults">
              <div class="empty-icon-wrapper">
                <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 class="empty-heading">Estimate Pending</h4>
              <p class="empty-text">Fill in your income details and click the Calculate button to view your estimated tax breakdown and optimal tax savings regime recommendation.</p>
            </div>

            <!-- Result breakdown details -->
            <div class="results-body" *ngIf="showResults && results">
              <div class="results-header">
                <h3 class="section-title">Estimation Summary</h3>
                <span class="active-regime-chip" [class.new-regime]="results.regime === 'new'" [class.old-regime]="results.regime === 'old'">
                  {{ results.regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime' }} (FY {{ results.financialYear }})
                </span>
              </div>

              <!-- Key Metrics Slabs -->
              <div class="summary-key-metrics">
                <div class="metric-box">
                  <span class="metric-label">Estimated Tax Liability</span>
                  <span class="metric-value tax-due-text">{{ currencySymbol }}{{ results.estimatedTax | number:'1.2-2' }}</span>
                </div>
                <div class="metric-box">
                  <span class="metric-label">Effective Tax Rate</span>
                  <span class="metric-value">{{ results.effectiveTaxRate | number:'1.1-2' }}%</span>
                </div>
              </div>

              <!-- Breakdown Rows -->
              <div class="breakdown-details-list">
                
                <div class="breakdown-item main-item">
                  <span class="item-label">Gross Total Income</span>
                  <span class="item-value font-bold">{{ currencySymbol }}{{ results.grossIncome | number:'1.2-2' }}</span>
                </div>
                
                <div class="breakdown-item sub-item">
                  <span class="item-label">Salary / Annual Income</span>
                  <span class="item-value">{{ currencySymbol }}{{ results.annualIncome | number:'1.2-2' }}</span>
                </div>
                
                <div class="breakdown-item sub-item">
                  <span class="item-label">Business / Freelance Income</span>
                  <span class="item-value">{{ currencySymbol }}{{ results.businessIncome | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item sub-item">
                  <span class="item-label">Other Miscellaneous Income</span>
                  <span class="item-value">{{ currencySymbol }}{{ results.otherIncome | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item-divider"></div>

                <div class="breakdown-item main-item">
                  <span class="item-label">Total Deductions / Expenses</span>
                  <span class="item-value font-bold text-expense">-{{ currencySymbol }}{{ results.totalDeductions | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item sub-item">
                  <span class="item-label">Business Expenses</span>
                  <span class="item-value">{{ currencySymbol }}{{ results.businessExpenses | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item sub-item" *ngIf="results.regime === 'old'">
                  <span class="item-label">Eligible Deductions (80C/80D/etc.)</span>
                  <span class="item-value">{{ currencySymbol }}{{ results.eligibleDeductions | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item sub-item">
                  <span class="item-label">Other Deductible Expenses</span>
                  <span class="item-value">{{ currencySymbol }}{{ results.otherDeductions | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item-divider"></div>

                <div class="breakdown-item main-item highlighted-item">
                  <span class="item-label">Net Taxable Income</span>
                  <span class="item-value font-bold">{{ currencySymbol }}{{ results.taxableIncome | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item sub-item">
                  <span class="item-label">Basic Slab Tax</span>
                  <span class="item-value">{{ currencySymbol }}{{ results.basicTax | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item sub-item" *ngIf="results.rebateApplied > 0">
                  <span class="item-label text-income font-semibold">Section 87A Rebate</span>
                  <span class="item-value text-income font-semibold">-{{ currencySymbol }}{{ results.rebateApplied | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item sub-item">
                  <span class="item-label">Health & Education Cess (4%)</span>
                  <span class="item-value">{{ currencySymbol }}{{ results.cess | number:'1.2-2' }}</span>
                </div>

                <div class="breakdown-item-divider"></div>

                <div class="breakdown-item main-item net-income-row">
                  <span class="item-label text-income">Net Income (Take-Home)</span>
                  <span class="item-value font-extrabold text-income">{{ currencySymbol }}{{ results.netIncome | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Recommendation Card -->
              <div class="recommendation-card" *ngIf="comparison">
                <div class="rec-icon">⚡</div>
                <div class="rec-details">
                  <h4 class="rec-title">Optimal Choice Recommendation</h4>
                  
                  <p class="rec-text" *ngIf="comparison.saving > 0">
                    Choosing the <strong>{{ comparison.betterRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime' }}</strong> is the optimal strategy, 
                    saving you <strong class="text-income">₹{{ comparison.saving | number:'1.0-0' }}</strong> in tax liability!
                  </p>

                  <p class="rec-text" *ngIf="comparison.saving === 0">
                    Both regimes yield zero tax. The default <strong>New Tax Regime</strong> is recommended for minimal reporting complexity.
                  </p>

                  <div class="rec-comparison-grid">
                    <div class="comp-box" [class.best]="comparison.betterRegime === 'new'">
                      <span class="comp-label">New Regime Tax</span>
                      <span class="comp-val">₹{{ comparison.newRegimeTax | number:'1.0-0' }}</span>
                    </div>
                    <div class="comp-box" [class.best]="comparison.betterRegime === 'old'">
                      <span class="comp-label">Old Regime Tax</span>
                      <span class="comp-val">₹{{ comparison.oldRegimeTax | number:'1.0-0' }}</span>
                    </div>
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
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-primary);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 40px;
      max-width: 1250px;
      width: calc(100% - 260px);
    }

    .estimator-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: start;
    }

    /* Form Styles */
    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .currency-tag {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary);
      background-color: rgba(99, 102, 241, 0.08);
      padding: 4px 10px;
      border-radius: var(--radius-full);
    }

    .form-section {
      margin-bottom: 28px;
      border-bottom: 1px dashed var(--border);
      padding-bottom: 24px;
    }

    .form-section:last-of-type {
      border-bottom: none;
      padding-bottom: 8px;
    }

    .form-section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 18px;
    }

    .section-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: var(--radius-full);
      background-color: var(--primary);
      color: white;
      font-size: 12px;
      font-weight: 700;
    }

    .input-container-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      color: var(--text-light);
      font-weight: 600;
      font-size: 14px;
      pointer-events: none;
    }

    .form-input.icon-padded {
      padding-left: 32px;
    }

    .field-hint {
      display: block;
      font-size: 11px;
      color: var(--text-light);
      margin-top: 4px;
    }

    .regime-flex-cards {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }

    .regime-card {
      flex: 1;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.25s ease;
      background-color: var(--bg-secondary);
    }

    .regime-card:hover {
      border-color: rgba(99, 102, 241, 0.4);
      background-color: rgba(99, 102, 241, 0.02);
    }

    .regime-card.selected {
      border-color: var(--primary);
      background-color: rgba(99, 102, 241, 0.05);
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.08);
    }

    .regime-title {
      font-weight: 700;
      font-size: 14px;
      color: var(--text-primary);
    }

    .regime-card.selected .regime-title {
      color: var(--primary);
    }

    .regime-summary {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .form-footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 16px;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Result Card Styles */
    .result-card {
      min-height: 450px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .result-card.has-results {
      justify-content: flex-start;
      animation: scaleIn 0.35s ease;
    }

    .results-empty-state {
      text-align: center;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .empty-icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-full);
      background-color: rgba(99, 102, 241, 0.05);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.05);
    }

    .empty-heading {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .empty-text {
      font-size: 13px;
      color: var(--text-secondary);
      max-width: 320px;
      line-height: 1.6;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }

    .active-regime-chip {
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: var(--radius-full);
    }

    .active-regime-chip.new-regime {
      background-color: var(--income-light);
      color: var(--income-hover);
    }

    .active-regime-chip.old-regime {
      background-color: var(--expense-light);
      color: var(--expense-hover);
    }

    .summary-key-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
    }

    .metric-box {
      background-color: var(--bg-primary);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: 1px solid var(--border);
    }

    .metric-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-primary);
    }

    .tax-due-text {
      color: var(--expense-hover);
      background: linear-gradient(135deg, var(--expense) 0%, var(--expense-hover) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .breakdown-details-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .breakdown-item.main-item {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 600;
    }

    .breakdown-item.sub-item {
      padding-left: 16px;
      font-size: 12px;
      color: var(--text-light);
    }

    .breakdown-item.highlighted-item {
      background-color: rgba(99, 102, 241, 0.03);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--primary);
    }

    .breakdown-item.net-income-row {
      font-size: 16px;
      border-top: 1px solid var(--border);
      padding-top: 14px;
      margin-top: 4px;
    }

    .breakdown-item-divider {
      height: 1px;
      background-color: var(--border);
      margin: 4px 0;
    }

    .font-bold { font-weight: 700; }
    .font-extrabold { font-weight: 800; }

    /* Recommendation Card */
    .recommendation-card {
      margin-top: 24px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.06);
    }

    .rec-icon {
      font-size: 20px;
      background-color: #bbf7d0;
      border-radius: var(--radius-full);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .rec-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .rec-title {
      font-size: 13px;
      font-weight: 700;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .rec-text {
      font-size: 12px;
      color: #14532d;
      line-height: 1.5;
    }

    .rec-comparison-grid {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .comp-box {
      flex: 1;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .comp-box.best {
      border-color: #86efac;
      background-color: #f8fafc;
      box-shadow: 0 2px 6px rgba(22, 163, 74, 0.05);
    }

    .comp-label {
      font-size: 10px;
      color: var(--text-light);
    }

    .comp-val {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .comp-box.best .comp-val {
      color: var(--income-hover);
    }

    /* Alert customization */
    .btn-close-alert {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: background-color 0.2s;
    }

    .btn-close-alert:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 992px) {
      .estimator-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
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
export class TaxEstimatorComponent implements OnInit {
  user: User | null = null;
  sidebarOpen = signal(false);
  currencySymbol = '₹';
  
  showResults = false;
  isLoadingPrefill = false;
  prefillMessage = '';
  
  taxForm!: FormGroup;
  results: TaxCalculationResult | null = null;
  comparison: RegimeComparison | null = null;

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private currencyService: CurrencyService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // 1. Authenticate user
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (!u) {
        this.router.navigate(['/login']);
      }
    });

    // 2. Fetch currency symbol (will default to ₹ for India)
    this.currencyService.symbol$.subscribe(sym => {
      this.currencySymbol = sym;
    });

    // 3. Initialize Reactive Form
    this.initForm();
  }

  initForm(): void {
    this.taxForm = new FormGroup({
      annualIncome: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      businessIncome: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      otherIncome: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      businessExpenses: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      eligibleDeductions: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      otherDeductions: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      financialYear: new FormControl<string>('2025-26', [Validators.required]),
      taxRegime: new FormControl<string>('new', [Validators.required])
    });
  }

  isInvalid(controlName: string, errorName: string): boolean {
    const control = this.taxForm.get(controlName);
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched));
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(val => !val);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  resetForm(): void {
    this.taxForm.reset({
      annualIncome: 0,
      businessIncome: 0,
      otherIncome: 0,
      businessExpenses: 0,
      eligibleDeductions: 0,
      otherDeductions: 0,
      financialYear: '2025-26',
      taxRegime: 'new'
    });
    this.showResults = false;
    this.results = null;
    this.comparison = null;
    this.prefillMessage = '';
  }

  prefillFromLedger(): void {
    this.isLoadingPrefill = true;
    this.prefillMessage = '';

    // Trigger load of transaction records to ensure they are up to date
    this.transactionService.loadTransactions();

    // Subscribe to first emission of transaction list
    const sub = this.transactionService.transactions$.subscribe({
      next: (txs) => {
        if (!txs || txs.length === 0) {
          this.isLoadingPrefill = false;
          this.prefillMessage = 'No transaction records found in the ledger to prefill.';
          if (sub) sub.unsubscribe();
          return;
        }

        let totalIncome = 0;
        let totalExpenses = 0;

        txs.forEach(t => {
          if (t.type === 'income') {
            totalIncome += Number(t.amount || 0);
          } else if (t.type === 'expense') {
            totalExpenses += Number(t.amount || 0);
          }
        });

        // Patch values into form
        this.taxForm.patchValue({
          businessIncome: totalIncome,
          businessExpenses: totalExpenses
        });

        this.taxForm.markAsDirty();
        this.isLoadingPrefill = false;
        this.prefillMessage = `Prefilled ₹${totalIncome.toLocaleString('en-IN')} of Freelance Income and ₹${totalExpenses.toLocaleString('en-IN')} of Business Expenses from your transaction history.`;
        
        // Auto-run estimation upon prefill
        this.onSubmit();

        if (sub) sub.unsubscribe();
      },
      error: (err) => {
        console.error('Error prefilling from ledger:', err);
        this.isLoadingPrefill = false;
        this.prefillMessage = 'Failed to load transactions for prefill.';
        if (sub) sub.unsubscribe();
      }
    });
  }

  onSubmit(): void {
    if (this.taxForm.invalid) return;
    this.calculateTax();
  }

  calculateTax(): void {
    if (this.taxForm.invalid) return;
    const vals = this.taxForm.value;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    this.http.post<{ success: boolean; data: any }>('http://localhost:8080/api/tax-estimator/calculate', vals, { headers }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          
          this.results = {
            financialYear: d.financialYear,
            regime: d.selectedRegime,
            annualIncome: d.annualIncome,
            businessIncome: d.businessIncome,
            otherIncome: d.otherIncome,
            grossIncome: d.grossIncome,
            businessExpenses: d.businessExpenses,
            eligibleDeductions: d.eligibleDeductions,
            otherDeductions: d.otherDeductions,
            totalDeductions: d.totalDeductions,
            taxableIncome: d.taxableIncome,
            basicTax: d.estimatedTax + d.rebateApplied,
            rebateApplied: d.rebateApplied,
            cess: d.cess,
            estimatedTax: d.totalTax,
            effectiveTaxRate: d.effectiveTaxRate,
            netIncome: d.netIncome
          };

          const betterRegime = d.newRegimeTax <= d.oldRegimeTax ? 'new' : 'old';
          const saving = Math.abs(d.oldRegimeTax - d.newRegimeTax);
          this.comparison = {
            newRegimeTax: d.newRegimeTax,
            oldRegimeTax: d.oldRegimeTax,
            betterRegime,
            saving
          };

          this.showResults = true;
        }
      },
      error: (err) => {
        console.error('Failed to calculate tax from backend API:', err);
      }
    });
  }

  // Slabs for New Regime: FY 2024-25 vs FY 2025-26
  private calculateNewRegimeTax(income: number, fy: string): number {
    let tax = 0;
    if (fy === '2025-26') {
      // Slabs FY 2025-26:
      // Up to 4L: Nil
      // 4L to 8L: 5%
      // 8L to 12L: 10%
      // 12L to 16L: 15%
      // 16L to 20L: 20%
      // 20L to 24L: 25%
      // Above 24L: 30%
      if (income <= 400000) return 0;
      if (income > 400000) tax += Math.min(400000, income - 400000) * 0.05;
      if (income > 800000) tax += Math.min(400000, income - 800000) * 0.10;
      if (income > 1200000) tax += Math.min(400000, income - 1200000) * 0.15;
      if (income > 1600000) tax += Math.min(400000, income - 1600000) * 0.20;
      if (income > 2000000) tax += Math.min(400000, income - 2000000) * 0.25;
      if (income > 2400000) tax += (income - 2400000) * 0.30;
    } else {
      // Slabs FY 2024-25:
      // Up to 3L: Nil
      // 3L to 7L: 5%
      // 7L to 10L: 10%
      // 10L to 12L: 15%
      // 12L to 15L: 20%
      // Above 15L: 30%
      if (income <= 300000) return 0;
      if (income > 300000) tax += Math.min(400000, income - 300000) * 0.05;
      if (income > 700000) tax += Math.min(300000, income - 700000) * 0.10;
      if (income > 1000000) tax += Math.min(200000, income - 1000000) * 0.15;
      if (income > 1200000) tax += Math.min(300000, income - 1200000) * 0.20;
      if (income > 1500000) tax += (income - 1500000) * 0.30;
    }
    return tax;
  }

  private calculateNewRegimeRebate(income: number, tax: number, fy: string): number {
    if (fy === '2025-26') {
      // Section 87A rebate for FY 25-26 in New Regime:
      // If taxable income <= 12L, rebate covers full tax liability up to ₹60,000.
      if (income <= 1200000) {
        return tax;
      }
    } else {
      // Section 87A rebate for FY 24-25 in New Regime:
      // If taxable income <= 7L, rebate covers full tax liability up to ₹25,000.
      if (income <= 700000) {
        return tax;
      }
    }
    return 0;
  }

  // Slabs for Old Regime (same for both FYs)
  private calculateOldRegimeTax(income: number): number {
    // Slabs:
    // Up to 2.5L: Nil
    // 2.5L to 5L: 5%
    // 5L to 10L: 20%
    // Above 10L: 30%
    let tax = 0;
    if (income <= 250000) return 0;
    if (income > 250000) tax += Math.min(250000, income - 250000) * 0.05;
    if (income > 500000) tax += Math.min(500000, income - 500000) * 0.20;
    if (income > 1000000) tax += (income - 1000000) * 0.30;
    return tax;
  }

  private calculateOldRegimeRebate(income: number, tax: number): number {
    // Section 87A rebate in Old Regime:
    // If taxable income <= 5L, rebate covers full tax liability up to ₹12,500.
    if (income <= 500000) {
      return tax;
    }
    return 0;
  }

  // Compare New vs Old Regime Tax liabilities side by side
  private runRegimeComparison(
    gross: number,
    bizExpense: number,
    deductions: number,
    otherDeduct: number,
    fy: string
  ): RegimeComparison {
    // 1. Calculate New Regime Tax
    const newTaxable = Math.max(0, gross - (bizExpense + otherDeduct));
    const newBasic = this.calculateNewRegimeTax(newTaxable, fy);
    const newRebate = this.calculateNewRegimeRebate(newTaxable, newBasic, fy);
    const newTax = (Math.max(0, newBasic - newRebate)) * 1.04;

    // 2. Calculate Old Regime Tax
    const oldTaxable = Math.max(0, gross - (bizExpense + deductions + otherDeduct));
    const oldBasic = this.calculateOldRegimeTax(oldTaxable);
    const oldRebate = this.calculateOldRegimeRebate(oldTaxable, oldBasic);
    const oldTax = (Math.max(0, oldBasic - oldRebate)) * 1.04;

    const betterRegime = newTax <= oldTax ? 'new' : 'old';
    const saving = Math.abs(oldTax - newTax);

    return {
      newRegimeTax: newTax,
      oldRegimeTax: oldTax,
      betterRegime,
      saving
    };
  }
}
