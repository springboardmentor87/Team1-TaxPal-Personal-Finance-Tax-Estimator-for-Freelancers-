import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../shared/sidebar';
import { HeaderComponent } from '../shared/header';
import { AuthService } from '../auth/auth.service';
import { TransactionService } from '../transactions/transaction.service';
import { CurrencyService } from '../shared/currency.service';
import { User, Transaction } from '../transactions/transaction.model';
import { ReportService } from './report.service';
import {
  GeneratedReport,
  ReportFormat,
  ReportPeriod,
  ReportType
} from './report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <div class="reports-layout">
      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="isSidebarOpen" 
        [user]="currentUser"
        (toggle)="toggleSidebar()"
        (logout)="onLogout()">
      </app-sidebar>

      <!-- Main Content Area -->
      <main class="main-content">
        <app-header 
          title="Financial Reports" 
          subtitle="Generate and download your financial reports"
          (toggleSidebar)="toggleSidebar()">
        </app-header>

        <!-- Toast Notification -->
        <div class="toast" *ngIf="toastMessage" [class.show]="toastMessage">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ toastMessage }}</span>
        </div>

        <div class="reports-grid">
          <!-- Left Column: Generator & Recent Reports -->
          <div class="reports-controls-col">
            <!-- Generate Report Card -->
            <section class="card form-card">
              <h2 class="card-title">Generate Report</h2>
              <form (ngSubmit)="onGenerateReport()" class="report-form">
                <div class="form-group">
                  <label for="reportType">Report Type</label>
                  <select id="reportType" name="reportType" [(ngModel)]="selectedType" class="form-select">
                    <option value="Income Statement">Income Statement</option>
                    <option value="Expense Breakdown">Expense Breakdown</option>
                    <option value="Tax Summary">Tax Summary</option>
                    <option value="Cash Flow Summary">Cash Flow Summary</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="period">Period</label>
                  <select id="period" name="period" [(ngModel)]="selectedPeriod" class="form-select">
                    <option value="Current Month">Current Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="Q1 2025">Q1 2025 (Jan - Mar)</option>
                    <option value="Q2 2025">Q2 2025 (Apr - Jun)</option>
                    <option value="Q3 2025">Q3 2025 (Jul - Sep)</option>
                    <option value="Q4 2025">Q4 2025 (Oct - Dec)</option>
                    <option value="Year 2025">Year 2025</option>
                    <option value="Custom Range">Custom Range</option>
                  </select>
                </div>

                <!-- Custom Range Inputs -->
                <div class="custom-dates" *ngIf="selectedPeriod === 'Custom Range'">
                  <div class="form-group">
                    <label for="startDate">Start Date</label>
                    <input type="date" id="startDate" name="startDate" [(ngModel)]="customStartDate" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label for="endDate">End Date</label>
                    <input type="date" id="endDate" name="endDate" [(ngModel)]="customEndDate" class="form-input" />
                  </div>
                </div>

                <div class="form-group">
                  <label for="format">Format</label>
                  <select id="format" name="format" [(ngModel)]="selectedFormat" class="form-select">
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="onResetForm()">Reset</button>
                  <button type="submit" class="btn btn-primary" [disabled]="isGenerating">
                    <span *ngIf="!isGenerating">Generate Report</span>
                    <span *ngIf="isGenerating">Generating...</span>
                  </button>
                </div>
              </form>
            </section>

            <!-- Recent Reports Card -->
            <section class="card recent-reports-card">
              <div class="card-header-row">
                <h2 class="card-title">Recent Reports</h2>
                <span class="badge badge-count" *ngIf="recentReports.length > 0">{{ recentReports.length }}</span>
              </div>

              <div class="table-container" *ngIf="recentReports.length > 0; else noRecentReports">
                <table class="reports-table">
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Generated</th>
                      <th>Period</th>
                      <th>Format</th>
                      <th class="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let rep of recentReports" [class.selected-row]="activeReport?.id === rep.id">
                      <td class="font-medium text-dark">{{ rep.name }}</td>
                      <td class="text-muted">{{ rep.data.generatedDate }}</td>
                      <td><span class="period-pill">{{ rep.period }}</span></td>
                      <td>
                        <span class="format-badge" [class.badge-pdf]="rep.format === 'PDF'" [class.badge-csv]="rep.format === 'CSV'">
                          {{ rep.format }}
                        </span>
                      </td>
                      <td class="text-right actions-cell">
                        <button class="btn-icon" (click)="selectPreviewReport(rep)" title="Preview Report">
                          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button class="btn-icon" (click)="onDownload(rep)" title="Download">
                          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button class="btn-icon btn-delete" (click)="onDelete(rep.id)" title="Delete">
                          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ng-template #noRecentReports>
                <div class="empty-state-card">
                  <svg class="empty-icon" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="empty-text">No results.</p>
                </div>
              </ng-template>
            </section>
          </div>

          <!-- Right Column: Report Preview Panel -->
          <div class="reports-preview-col">
            <section class="card preview-card" id="printable-report">
              <div class="preview-header">
                <h2 class="card-title">Report Preview</h2>
                <div class="preview-actions" *ngIf="activeReport">
                  <button class="btn btn-secondary btn-sm" (click)="onPrint()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button class="btn btn-primary btn-sm" (click)="onDownload(activeReport)">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download ({{ activeReport.format }})
                  </button>
                </div>
              </div>

              <!-- Report Document View -->
              <div class="report-document" *ngIf="activeReport; else emptyPreviewState">
                <!-- Document Header -->
                <div class="doc-header">
                  <div class="doc-brand">
                    <div class="brand-badge">TaxPal</div>
                    <div>
                      <h1 class="doc-title">{{ activeReport.data.reportType }}</h1>
                      <p class="doc-subtitle">Period: {{ activeReport.data.period }}</p>
                    </div>
                  </div>
                  <div class="doc-meta">
                    <div><strong>User:</strong> {{ activeReport.data.userName }}</div>
                    <div><strong>Email:</strong> {{ activeReport.data.userEmail }}</div>
                    <div><strong>Generated:</strong> {{ activeReport.data.generatedDate }}</div>
                  </div>
                </div>

                <!-- KPI Summary Grid -->
                <div class="doc-kpi-grid">
                  <div class="doc-kpi-box income-box">
                    <span class="doc-kpi-label">Gross Income</span>
                    <span class="doc-kpi-val income-color">{{ currencySymbol }}{{ activeReport.data.totalIncome | number:'1.2-2' }}</span>
                  </div>
                  <div class="doc-kpi-box expense-box">
                    <span class="doc-kpi-label">Total Expenses</span>
                    <span class="doc-kpi-val expense-color">{{ currencySymbol }}{{ activeReport.data.totalExpenses | number:'1.2-2' }}</span>
                  </div>
                  <div class="doc-kpi-box net-box">
                    <span class="doc-kpi-label">Net Operating Income</span>
                    <span class="doc-kpi-val" [class.income-color]="activeReport.data.netIncome >= 0" [class.expense-color]="activeReport.data.netIncome < 0">
                      {{ currencySymbol }}{{ activeReport.data.netIncome | number:'1.2-2' }}
                    </span>
                  </div>
                  <div class="doc-kpi-box tax-box">
                    <span class="doc-kpi-label">Est. Tax Liability (22%)</span>
                    <span class="doc-kpi-val tax-color">{{ currencySymbol }}{{ activeReport.data.estimatedTax | number:'1.2-2' }}</span>
                  </div>
                </div>

                <!-- Expense Breakdown Table -->
                <div class="doc-section" *ngIf="activeReport.data.expenseCategories.length > 0">
                  <h3 class="doc-section-title">Expense Breakdown by Category</h3>
                  <table class="doc-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th class="text-right">Transaction Count</th>
                        <th class="text-right">Amount</th>
                        <th class="text-right">Share of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let cat of activeReport.data.expenseCategories">
                        <td class="font-medium">{{ cat.category }}</td>
                        <td class="text-right text-muted">{{ cat.transactionCount }}</td>
                        <td class="text-right font-semibold">{{ currencySymbol }}{{ cat.amount | number:'1.2-2' }}</td>
                        <td class="text-right">
                          <span class="percentage-pill">{{ cat.percentage | number:'1.1-1' }}%</span>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2"><strong>Total Expenses</strong></td>
                        <td class="text-right font-bold expense-color">{{ currencySymbol }}{{ activeReport.data.totalExpenses | number:'1.2-2' }}</td>
                        <td class="text-right font-bold">100.0%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Monthly Breakdown Table (If Multi-Month) -->
                <div class="doc-section" *ngIf="activeReport.data.periodBreakdowns.length > 1">
                  <h3 class="doc-section-title">Monthly Breakdown Summary</h3>
                  <table class="doc-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th class="text-right">Income</th>
                        <th class="text-right">Expenses</th>
                        <th class="text-right">Net Income</th>
                        <th class="text-right">Savings Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let p of activeReport.data.periodBreakdowns">
                        <td class="font-medium">{{ p.label }}</td>
                        <td class="text-right income-color">{{ currencySymbol }}{{ p.income | number:'1.2-2' }}</td>
                        <td class="text-right expense-color">{{ currencySymbol }}{{ p.expenses | number:'1.2-2' }}</td>
                        <td class="text-right font-semibold">{{ currencySymbol }}{{ p.netIncome | number:'1.2-2' }}</td>
                        <td class="text-right text-muted">{{ p.savingsRate | number:'1.1-1' }}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Itemized Transactions Table -->
                <div class="doc-section" *ngIf="activeReport.data.transactions.length > 0">
                  <h3 class="doc-section-title">Itemized Transactions</h3>
                  <table class="doc-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th class="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let tx of activeReport.data.transactions">
                        <td class="text-muted">{{ tx.date }}</td>
                        <td class="font-medium">{{ tx.description }}</td>
                        <td><span class="category-tag">{{ tx.category }}</span></td>
                        <td>
                          <span class="type-pill" [class.type-inc]="tx.type === 'income'" [class.type-exp]="tx.type === 'expense'">
                            {{ tx.type | uppercase }}
                          </span>
                        </td>
                        <td class="text-right font-semibold" [class.income-color]="tx.type === 'income'" [class.expense-color]="tx.type === 'expense'">
                          {{ tx.type === 'income' ? '+' : '-' }}{{ currencySymbol }}{{ tx.amount | number:'1.2-2' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Footer Signoff -->
                <div class="doc-footer">
                  <p>Generated by TaxPal • Personal Finance & Tax Estimator for Freelancers</p>
                  <p>All values calculated based on recorded transactions and selected tax configurations.</p>
                </div>
              </div>

              <!-- Empty Preview State -->
              <ng-template #emptyPreviewState>
                <div class="empty-preview-container">
                  <div class="preview-empty-icon">
                    <svg width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 class="empty-preview-title">Select a report to preview</h3>
                  <p class="empty-preview-text">Generated reports will appear here for review before downloading</p>
                </div>
              </ng-template>
            </section>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .reports-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-primary, #f8fafc);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 32px 40px;
      max-width: 1440px;
      width: calc(100% - 260px);
    }

    .reports-grid {
      display: grid;
      grid-template-columns: 440px 1fr;
      gap: 24px;
      align-items: start;
    }

    .reports-controls-col {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .card {
      background: white;
      border-radius: var(--radius-lg, 12px);
      border: 1px solid var(--border-color, #e2e8f0);
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 16px 0;
    }

    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .card-header-row .card-title {
      margin-bottom: 0;
    }

    .badge-count {
      background: #e0f2fe;
      color: #0284c7;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .report-form {
      display: flex;
      flex-direction: column;
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
      color: var(--text-secondary, #475569);
    }

    .form-select, .form-input {
      height: 42px;
      padding: 8px 12px;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      font-size: 14px;
      background-color: white;
      color: var(--text-primary, #1e293b);
      outline: none;
      transition: border-color 0.2s;
    }

    .form-select:focus, .form-input:focus {
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
    }

    .custom-dates {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-sm {
      padding: 7px 14px;
      font-size: 13px;
    }

    .btn-primary {
      background: #0ea5e9;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0284c7;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Recent Reports Table */
    .table-container {
      overflow-x: auto;
      max-height: 380px;
    }

    .reports-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .reports-table th {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #f1f5f9;
      color: #64748b;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .reports-table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .reports-table tr:hover {
      background-color: #f8fafc;
    }

    .selected-row {
      background-color: #f0f9ff !important;
    }

    .period-pill {
      display: inline-block;
      padding: 2px 8px;
      background: #f1f5f9;
      border-radius: 6px;
      font-size: 11px;
      color: #475569;
      font-weight: 500;
    }

    .format-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .badge-pdf {
      background: #fee2e2;
      color: #dc2626;
    }

    .badge-csv {
      background: #dcfce7;
      color: #16a34a;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .btn-icon {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background: #e2e8f0;
      color: #0ea5e9;
    }

    .btn-delete:hover {
      background: #fee2e2;
      color: #ef4444;
    }

    .empty-state-card {
      padding: 36px 16px;
      text-align: center;
      color: #94a3b8;
    }

    .empty-icon {
      margin-bottom: 8px;
      opacity: 0.6;
    }

    .empty-text {
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }

    /* Preview Panel */
    .preview-card {
      min-height: 600px;
      display: flex;
      flex-direction: column;
    }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .preview-header .card-title {
      margin-bottom: 0;
    }

    .preview-actions {
      display: flex;
      gap: 10px;
    }

    .empty-preview-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .preview-empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      margin-bottom: 16px;
    }

    .empty-preview-title {
      font-size: 18px;
      font-weight: 700;
      color: #334155;
      margin: 0 0 6px 0;
    }

    .empty-preview-text {
      font-size: 14px;
      color: #64748b;
      max-width: 320px;
      margin: 0;
    }

    /* Document Styling */
    .report-document {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0ea5e9;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .doc-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-badge {
      background: #0ea5e9;
      color: white;
      font-weight: 800;
      font-size: 18px;
      padding: 8px 14px;
      border-radius: 8px;
      letter-spacing: -0.5px;
    }

    .doc-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
    }

    .doc-subtitle {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      margin: 0;
    }

    .doc-meta {
      font-size: 12px;
      color: #475569;
      text-align: right;
      line-height: 1.6;
    }

    .doc-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }

    .doc-kpi-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .doc-kpi-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .doc-kpi-val {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }

    .income-color {
      color: #10b981;
    }

    .expense-color {
      color: #ef4444;
    }

    .tax-color {
      color: #f59e0b;
    }

    .doc-section {
      margin-bottom: 28px;
    }

    .doc-section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 12px 0;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
    }

    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .doc-table th {
      background: #f8fafc;
      padding: 8px 12px;
      font-weight: 600;
      color: #475569;
      border: 1px solid #e2e8f0;
      text-align: left;
    }

    .doc-table td {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
    }

    .doc-table tfoot td {
      background: #f8fafc;
      border-top: 2px solid #cbd5e1;
    }

    .percentage-pill {
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #334155;
    }

    .category-tag {
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #334155;
    }

    .type-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .type-inc {
      background: #dcfce7;
      color: #16a34a;
    }

    .type-exp {
      background: #fee2e2;
      color: #dc2626;
    }

    .text-right {
      text-align: right;
    }

    .font-bold {
      font-weight: 700;
    }

    .font-semibold {
      font-weight: 600;
    }

    .font-medium {
      font-weight: 500;
    }

    .text-muted {
      color: #64748b;
    }

    .text-dark {
      color: #0f172a;
    }

    .doc-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-top: 32px;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.5;
    }

    /* Toast */
    .toast {
      position: fixed;
      top: 24px;
      right: 24px;
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Print styling */
    @media print {
      body * {
        visibility: hidden;
      }
      #printable-report, #printable-report * {
        visibility: visible;
      }
      #printable-report {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .preview-header, .preview-actions {
        display: none !important;
      }
    }

    /* Responsive */
    @media (max-width: 1100px) {
      .reports-grid {
        grid-template-columns: 1fr;
      }
      .doc-kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
        width: 100%;
        padding: 20px;
      }
      .doc-header {
        flex-direction: column;
        gap: 16px;
      }
      .doc-meta {
        text-align: left;
      }
      .doc-kpi-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  currencySymbol = '$';
  isSidebarOpen = false;
  isGenerating = false;
  toastMessage = '';

  // Form selections
  selectedType: ReportType = 'Income Statement';
  selectedPeriod: ReportPeriod = 'Current Month';
  selectedFormat: ReportFormat = 'PDF';
  customStartDate = '';
  customEndDate = '';

  // Reports state
  recentReports: GeneratedReport[] = [];
  activeReport: GeneratedReport | null = null;
  transactions: Transaction[] = [];

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private reportService: ReportService,
    private currencyService: CurrencyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Current user
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.subs.push(userSub);

    // Currency
    this.currencySymbol = this.currencyService.currentSymbol || '$';

    // Transactions
    const txSub = this.transactionService.transactions$.subscribe(txs => {
      this.transactions = txs || [];
    });
    this.subs.push(txSub);

    // Recent reports
    const repSub = this.reportService.reports$.subscribe(reports => {
      this.recentReports = reports;
      if (reports.length > 0 && !this.activeReport) {
        this.activeReport = reports[0];
      } else if (reports.length === 0) {
        this.activeReport = null;
      }
    });
    this.subs.push(repSub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onResetForm(): void {
    this.selectedType = 'Income Statement';
    this.selectedPeriod = 'Current Month';
    this.selectedFormat = 'PDF';
    this.customStartDate = '';
    this.customEndDate = '';
  }

  onGenerateReport(): void {
    this.isGenerating = true;
    setTimeout(() => {
      const newRep = this.reportService.generateReport(
        this.selectedType,
        this.selectedPeriod,
        this.selectedFormat,
        this.customStartDate,
        this.customEndDate,
        this.transactions
      );
      this.activeReport = newRep;
      this.isGenerating = false;
      this.showToast(`Report generated: ${newRep.name}`);

      // If format was CSV, automatically trigger CSV download
      if (newRep.format === 'CSV') {
        this.reportService.downloadCSV(newRep);
      }
    }, 400);
  }

  selectPreviewReport(report: GeneratedReport): void {
    this.activeReport = report;
  }

  onDownload(report: GeneratedReport): void {
    if (report.format === 'CSV') {
      this.reportService.downloadCSV(report);
      this.showToast('CSV downloaded successfully.');
    } else {
      this.reportService.printOrSavePDF();
      this.showToast('Opening print dialog for PDF export.');
    }
  }

  onPrint(): void {
    this.reportService.printOrSavePDF();
  }

  onDelete(id: string): void {
    this.reportService.deleteReport(id);
    if (this.activeReport?.id === id) {
      this.activeReport = this.recentReports[0] || null;
    }
    this.showToast('Report deleted from history.');
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }
}