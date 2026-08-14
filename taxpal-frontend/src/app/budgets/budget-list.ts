import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

import { Subscription } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { SidebarComponent } from '../shared/sidebar';
import { HeaderComponent } from '../shared/header';
import { ModalWrapperComponent } from '../shared/modal-wrapper';

import { AuthService } from '../auth/auth.service';
import { User } from '../transactions/transaction.model';

import {
  BudgetService,
  BudgetProgress,
  BudgetSummary
} from './budget.service';

import {
  CategoryService,
  CategoryItem
} from '../categories/category.service';

import { CurrencyService } from '../shared/currency.service';

import {
  Chart,
  registerables
} from 'chart.js';


Chart.register(...registerables);


@Component({
  selector: 'app-budget-list',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    ModalWrapperComponent
  ],

  template: `

    <div class="app-layout">

      <!-- Sidebar -->
      <app-sidebar
        [isOpen]="isSidebarOpen"
        [user]="currentUser"
        (toggle)="toggleSidebar()"
        (logout)="onLogout()">
      </app-sidebar>


      <!-- Main Content -->
      <main class="main-content">

        <!-- Header -->
        <app-header
          title="Budgets & Spending Limits"
          subtitle="Set monthly category limits and track visual budget progress in real time."
          (toggleSidebar)="toggleSidebar()">

          <div class="header-actions-group">

            <div class="month-selector-wrapper">

              <span class="month-icon">

                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="#64748b"
                  stroke-width="2"
                  viewBox="0 0 24 24">

                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

                </svg>

              </span>

              <label
                for="month-select"
                class="month-label">

                Filter Month:

              </label>

              <input
                type="month"
                id="month-select"
                [value]="selectedMonth"
                (change)="onMonthChange($event)"
                class="month-input">

            </div>


            <button
              class="btn btn-primary-gradient"
              (click)="openCreateBudgetModal()">

              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24">

                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4v16m8-8H4"/>

              </svg>

              <span>
                Create New Budget
              </span>

            </button>

          </div>

        </app-header>


        <div class="page-container">

          <!-- Summary Cards -->

          <div class="metrics-grid">

            <!-- Total Budget -->
            <div class="metric-card">

              <div class="metric-header">

                <span class="metric-title">
                  Total Budget
                </span>

                <div class="metric-icon-bg bg-primary-light">

                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="#0ea5e9"
                    stroke-width="2"
                    viewBox="0 0 24 24">

                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                  </svg>

                </div>

              </div>

              <div class="metric-value">

                {{ currencySymbol }}
                {{ summary.totalBudget | number:'1.2-2' }}

              </div>

              <div class="metric-footer">
                Target monthly allocation
              </div>

            </div>


            <!-- Spent -->
            <div class="metric-card">

              <div class="metric-header">

                <span class="metric-title">
                  Currently Spent
                </span>

                <div class="metric-icon-bg bg-expense-light">

                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="#ef4444"
                    stroke-width="2"
                    viewBox="0 0 24 24">

                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />

                  </svg>

                </div>

              </div>

              <div class="metric-value text-expense">

                {{ currencySymbol }}
                {{ summary.totalSpent | number:'1.2-2' }}

              </div>

              <div class="metric-footer">
                Logged expenses this month
              </div>

            </div>


            <!-- Remaining -->
            <div class="metric-card">

              <div class="metric-header">

                <span class="metric-title">
                  Remaining
                </span>

                <div class="metric-icon-bg bg-income-light">

                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="#10b981"
                    stroke-width="2"
                    viewBox="0 0 24 24">

                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />

                  </svg>

                </div>

              </div>

              <div
                class="metric-value"
                [style.color]="summary.remaining >= 0 ? 'var(--income)' : 'var(--expense)'">

                {{ currencySymbol }}
                {{ summary.remaining | number:'1.2-2' }}

              </div>

              <div class="metric-footer">
                Unspent budget pool
              </div>

            </div>


            <!-- Health -->
            <div class="metric-card">

              <div class="metric-header">

                <span class="metric-title">
                  Budget Health
                </span>

                <div class="metric-icon-bg bg-warning-light">

                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="#f59e0b"
                    stroke-width="2"
                    viewBox="0 0 24 24">

                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />

                  </svg>

                </div>

              </div>

              <div class="metric-value">

                <span
                  class="health-badge"
                  [style.background-color]="summary.healthColor + '20'"
                  [style.color]="summary.healthColor">

                  {{ summary.healthStatus }}

                </span>

              </div>

              <div class="metric-footer">
                Spending limit status
              </div>

            </div>

          </div>


          <!-- Chart + Progress -->

          <div class="grid-two-cols">

            <!-- Chart -->
            <div class="card chart-card">

              <div class="card-header">

                <div>

                  <h2 class="card-title">
                    Spending Breakdown
                  </h2>

                  <p class="card-subtitle">
                    Expense distribution across categories
                  </p>

                </div>

                <span class="month-pill">
                  {{ formatMonthDisplay(selectedMonth) }}
                </span>

              </div>

              <div class="chart-wrapper">

                <canvas
                  #budgetChartCanvas>
                </canvas>

              </div>

            </div>


            <!-- Progress -->
            <div class="card progress-card">

              <div class="card-header">

                <div>

                  <h2 class="card-title">
                    Category Progress
                  </h2>

                  <p class="card-subtitle">
                    Real-time category limit utilization
                  </p>

                </div>

                <span class="badge-count">

                  {{ budgets.length }}
                  Categories

                </span>

              </div>


              <div
                class="progress-list"
                *ngIf="budgets.length > 0; else noBudgetsMsg">

                <div
                  class="progress-item"
                  *ngFor="let item of budgets">

                  <div class="progress-info">

                    <div class="category-name-group">

                      <span
                        class="category-dot"
                        [style.background-color]="getCategoryColor(item.category)">
                      </span>

                      <span class="category-title">

                        {{ item.category }}

                      </span>

                    </div>


                    <span class="progress-values">

                      <strong>

                        {{ currencySymbol }}
                        {{ item.spent | number:'1.0-0' }}

                      </strong>

                      /

                      {{ currencySymbol }}
                      {{ item.limit | number:'1.0-0' }}

                    </span>

                  </div>


                  <div class="progress-bar-bg">

                    <div
                      class="progress-bar-fill"
                      [style.width.%]="item.percentage > 100 ? 100 : item.percentage"
                      [style.background-color]="item.statusColor">
                    </div>

                  </div>


                  <div class="progress-sub-info">

                    <span
                      class="percentage-label"
                      [style.color]="item.statusColor">

                      {{ item.percentage }}% spent

                    </span>


                    <span
                      class="status-pill"
                      [style.color]="item.statusColor"
                      [style.background-color]="item.statusColor + '18'">

                      {{ item.status }}

                    </span>

                  </div>

                </div>

              </div>


              <ng-template #noBudgetsMsg>

                <div class="empty-state">

                  <svg
                    width="48"
                    height="48"
                    fill="none"
                    stroke="#94a3b8"
                    stroke-width="1.5"
                    viewBox="0 0 24 24">

                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                  </svg>

                  <p>
                    No budgets set for
                    {{ formatMonthDisplay(selectedMonth) }}.
                  </p>

                  <button
                    class="btn btn-sm btn-primary"
                    (click)="openCreateBudgetModal()">

                    Set a Budget

                  </button>

                </div>

              </ng-template>

            </div>

          </div>


          <!-- Table -->

          <div class="card table-card">

            <div class="card-header-padded">

              <div>

                <h2 class="card-title">
                  Budget Allocation Table
                </h2>

                <p class="card-subtitle">
                  Overview of limits, actual spending, and remaining balance
                </p>

              </div>

            </div>


            <div class="table-responsive">

              <table class="data-table">

                <thead>

                  <tr>

                    <th>Category</th>
                    <th>Monthly Limit</th>
                    <th>Currently Spent</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th style="text-align: right;">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  <tr *ngFor="let item of budgets">

                    <td>

                      <div class="category-cell">

                        <span
                          class="category-dot"
                          [style.background-color]="getCategoryColor(item.category)">
                        </span>

                        <span class="cat-cell-title">

                          {{ item.category }}

                        </span>

                      </div>

                    </td>


                    <td class="font-semibold">

                      {{ currencySymbol }}
                      {{ item.limit | number:'1.2-2' }}

                    </td>


                    <td class="font-semibold">

                      {{ currencySymbol }}
                      {{ item.spent | number:'1.2-2' }}

                    </td>


                    <td>

                      <span
                        class="remaining-value"
                        [style.color]="item.remaining >= 0 ? 'var(--income)' : 'var(--expense)'">

                        {{ currencySymbol }}
                        {{ item.remaining | number:'1.2-2' }}

                      </span>

                    </td>


                    <td>

                      <span
                        class="status-badge-chip"
                        [style.background-color]="item.statusColor + '18'"
                        [style.color]="item.statusColor">

                        {{ item.status }}

                      </span>

                    </td>


                    <td style="text-align: right;">

                      <div class="table-actions-cell">

                        <button
                          class="action-chip chip-edit"
                          (click)="editBudget(item)"
                          title="Edit Limit">

                          <svg
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            viewBox="0 0 24 24">

                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />

                          </svg>

                        </button>


                        <button
                          class="action-chip chip-delete"
                          (click)="deleteBudget(item.id)"
                          title="Delete Budget">

                          <svg
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            viewBox="0 0 24 24">

                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />

                          </svg>

                        </button>

                      </div>

                    </td>

                  </tr>


                  <tr *ngIf="budgets.length === 0">

                    <td
                      colspan="6"
                      class="text-center py-4 text-subtle">

                      No budgets set for this month.
                      Click "Create New Budget" above to start budgeting.

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </main>


      <!-- Modal -->

      <app-modal-wrapper
        [isOpen]="isModalOpen"
        [title]="editingId ? 'Edit Budget Limit' : 'Create New Budget'"
        [maxWidth]="'480px'"
        (close)="closeModal()">

        <form
          [formGroup]="budgetForm"
          (ngSubmit)="onSubmitBudget()"
          style="padding: 24px;">

          <div class="form-group">

            <label
              class="form-label"
              for="budgetCategory">

              Category

            </label>

            <select
              id="budgetCategory"
              formControlName="category"
              class="form-input form-select"
              [attr.disabled]="editingId ? true : null">

              <option
                value=""
                disabled
                selected>

                Select a category

              </option>

              <option
                *ngFor="let cat of expenseCategories"
                [value]="cat.name">

                {{ cat.name }}

              </option>

            </select>

          </div>


          <div class="form-group">

            <label
              class="form-label"
              for="budgetLimit">

              Budget Amount ({{ currencySymbol }})

            </label>

            <input
              type="number"
              id="budgetLimit"
              formControlName="limit"
              class="form-input"
              placeholder="e.g. 15000"
              step="500"
              min="100">

          </div>


          <div class="form-group">

            <label
              class="form-label"
              for="budgetMonth">

              Month

            </label>

            <input
              type="month"
              id="budgetMonth"
              formControlName="month"
              class="form-input">

          </div>


          <div class="form-group">

            <label
              class="form-label"
              for="budgetDesc">

              Description (Optional)

            </label>

            <textarea
              id="budgetDesc"
              formControlName="description"
              class="form-input form-textarea"
              placeholder="Add any additional details...">
            </textarea>

          </div>


          <div
            class="modal-footer"
            style="padding: 16px 0 0 0; margin-top: 16px;">

            <button
              type="button"
              class="btn btn-secondary"
              (click)="closeModal()">

              Cancel

            </button>


            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="budgetForm.invalid">

              {{ editingId ? 'Update Budget' : 'Create Budget' }}

            </button>

          </div>

        </form>

      </app-modal-wrapper>

    </div>

  `,


  styles: [`

    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-primary);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
      padding: 24px 36px 48px 36px;
    }

    .page-container {
      width: 100%;
      max-width: 1300px;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .header-actions-group {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .month-selector-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      padding: 10px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .month-icon {
      display: flex;
      align-items: center;
    }

    .month-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .month-input {
      border: none;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      outline: none;
      background: transparent;
      cursor: pointer;
    }

    .btn-primary-gradient {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-primary-gradient:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }

    .metric-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 22px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
    }

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .metric-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .metric-icon-bg {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bg-primary-light {
      background: #e0f2fe;
    }

    .bg-expense-light {
      background: #fee2e2;
    }

    .bg-income-light {
      background: #d1fae5;
    }

    .bg-warning-light {
      background: #fef3c7;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .text-expense {
      color: var(--expense);
    }

    .metric-footer {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 6px;
    }

    .health-badge {
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 13px;
      font-weight: 700;
      display: inline-block;
    }

    .grid-two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: stretch;
    }

    .card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 28px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.4px;
    }

    .card-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .month-pill {
      font-size: 12px;
      font-weight: 700;
      color: #0284c7;
      background: #e0f2fe;
      padding: 4px 12px;
      border-radius: 12px;
    }

    .badge-count {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary);
      background: #f1f5f9;
      padding: 4px 12px;
      border-radius: 12px;
    }

    .chart-wrapper {
      flex: 1;
      min-height: 280px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-card {
      justify-content: space-between;
    }

    .progress-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
      justify-content: center;
    }

    .progress-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .progress-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
    }

    .category-name-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .category-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    .category-title {
      font-weight: 700;
      color: var(--text-primary);
    }

    .progress-values {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .progress-bar-bg {
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;
    }

    .progress-sub-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }

    .percentage-label {
      font-weight: 700;
    }

    .status-pill {
      padding: 2px 10px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 11px;
    }

    .table-card {
      padding: 0;
      overflow: hidden;
    }

    .card-header-padded {
      padding: 24px 32px 16px 32px;
      border-bottom: 1px solid var(--border);
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }

    .data-table th {
      padding: 14px 32px;
      background: #f8fafc;
      color: var(--text-secondary);
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border);
    }

    .data-table td {
      padding: 18px 32px;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
      vertical-align: middle;
    }

    .category-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cat-cell-title {
      font-weight: 700;
      color: var(--text-primary);
    }

    .font-semibold {
      font-weight: 700;
    }

    .remaining-value {
      font-weight: 700;
    }

    .status-badge-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
    }

    .table-actions-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }

    .action-chip {
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .chip-edit:hover {
      color: #0284c7;
      background: #e0f2fe;
    }

    .chip-delete:hover {
      color: #e11d48;
      background: #ffe4e6;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-secondary);
    }

    @media (max-width: 992px) {

      .grid-two-cols {
        grid-template-columns: 1fr;
      }

      .main-content {
        margin-left: 0;
        padding: 16px;
      }

    }

  `]
})


export class BudgetListComponent
  implements OnInit, OnDestroy, AfterViewInit {


  @ViewChild('budgetChartCanvas')
  budgetChartCanvas!: ElementRef<HTMLCanvasElement>;


  currentUser: User | null = null;

  isSidebarOpen = false;

  selectedMonth: string =
    new Date().toISOString().substring(0, 7);


  budgets: BudgetProgress[] = [];


  summary: BudgetSummary = {

    totalBudget: 0,

    totalSpent: 0,

    remaining: 0,

    healthStatus: 'Good',

    healthColor: 'var(--income)'

  };


  expenseCategories: CategoryItem[] = [];

  currencySymbol = '₹';


  isModalOpen = false;

  editingId: string | null = null;


  budgetForm = new FormGroup({

    category:
      new FormControl(
        '',
        {
          nonNullable: true,
          validators: [Validators.required]
        }
      ),

    limit:
      new FormControl<number | null>(
        null,
        {
          validators: [
            Validators.required,
            Validators.min(100)
          ]
        }
      ),

    month:
      new FormControl(
        this.selectedMonth,
        {
          nonNullable: true,
          validators: [Validators.required]
        }
      ),

    description:
      new FormControl(
        '',
        {
          nonNullable: true
        }
      )

  });


  private chart: Chart | null = null;

  private subs =
    new Subscription();


  // ==========================================
  // BACKEND API
  // ==========================================

  private apiUrl =
    'http://localhost:8080/api/budgets';


  constructor(

    private authService: AuthService,

    private budgetService: BudgetService,

    private categoryService: CategoryService,

    private currencyService: CurrencyService,

    private cdr: ChangeDetectorRef,

    private http: HttpClient

  ) { }


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.currentUser =
      this.authService.getCurrentUserValue();


    this.expenseCategories =
      this.categoryService.getCategoriesByType(
        'expense'
      );


    this.subs.add(

      this.currencyService.symbol$
        .subscribe(sym => {

          this.currencySymbol = sym;

          this.renderChart();

          this.cdr.detectChanges();

        })

    );


    this.loadData();

  }


  ngAfterViewInit(): void {

    this.renderChart();

  }


  ngOnDestroy(): void {

    this.subs.unsubscribe();

    if (this.chart) {

      this.chart.destroy();

    }

  }


  // ==========================================
  // LOAD DATA FROM BACKEND
  // ==========================================

  private loadData(): void {

    const month =
      this.formatMonthForBackend(
        this.selectedMonth
      );


    console.log(
      'Loading budgets for:',
      month
    );


    this.http
      .get<any>(
        `${this.apiUrl}/progress?month=${month}`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Budget Progress Response:',
            response
          );


          const data =
            response?.data || [];


          this.budgets =
            data.map(
              (item: any) => ({

                id:
                  String(item.id),

                category:
                  item.category,

                limit:
                  Number(item.budget || 0),

                month:
                  this.formatMonthForFrontend(
                    item.month
                  ),

                description:
                  item.description || '',

                createdAt:
                  item.created_at || '',

                spent:
                  Number(item.spent || 0),

                remaining:
                  Number(item.remaining || 0),

                percentage:
                  Number(item.percentage || 0),

                status:
                  item.status || 'Good',

                statusColor:
                  this.getStatusColor(
                    item.status
                  )

              })
            );


          this.calculateSummary();


          this.cdr.detectChanges();


          setTimeout(() => {

            this.renderChart();

          });

        },

        error: (error) => {

          console.error(
            'LOAD BUDGET ERROR:',
            error
          );


          this.budgets = [];


          this.calculateSummary();

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // MONTH CHANGE
  // ==========================================

  onMonthChange(
    event: Event
  ): void {

    const target =
      event.target as HTMLInputElement;


    if (
      target &&
      target.value
    ) {

      this.selectedMonth =
        target.value;


      this.budgetForm.patchValue({

        month:
          this.selectedMonth

      });


      this.loadData();

    }

  }


  // ==========================================
  // MONTH HELPERS
  // ==========================================

  private formatMonthForBackend(
    month: string
  ): string {

    if (!month) {

      return '';

    }


    if (
      month.length === 7
    ) {

      return `${month}-01`;

    }


    return month;

  }


  private formatMonthForFrontend(
    month: string
  ): string {

    if (!month) {

      return '';

    }


    return month.substring(
      0,
      7
    );

  }


  formatMonthDisplay(
    monthStr: string
  ): string {

    const [
      year,
      month
    ] =
      monthStr.split('-');


    const date =
      new Date(
        Number(year),
        Number(month) - 1,
        1
      );


    return date.toLocaleString(
      'default',
      {
        month: 'long',
        year: 'numeric'
      }
    );

  }


  // ==========================================
  // COLORS
  // ==========================================

  getCategoryColor(
    categoryName: string
  ): string {

    const cat =
      this.expenseCategories.find(
        c =>
          c.name === categoryName
      );


    return cat
      ? cat.color
      : '#0ea5e9';

  }


  private getStatusColor(
    status: string
  ): string {

    if (
      status === 'Exceeded'
    ) {

      return '#ef4444';

    }


    if (
      status === 'Warning'
    ) {

      return '#f59e0b';

    }


    return '#10b981';

  }


  // ==========================================
  // SUMMARY
  // ==========================================

  private calculateSummary(): void {

    const totalBudget =
      this.budgets.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(item.limit || 0),
        0
      );


    const totalSpent =
      this.budgets.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(item.spent || 0),
        0
      );


    const remaining =
      totalBudget -
      totalSpent;


    const exceeded =
      this.budgets.some(
        item =>
          item.status === 'Exceeded'
      );


    const warning =
      this.budgets.some(
        item =>
          item.status === 'Warning'
      );


    let healthStatus:
      'Good' |
      'Warning' |
      'Critical'
      = 'Good';


    let healthColor =
      '#10b981';


    if (exceeded) {

      healthStatus =
        'Critical';

      healthColor =
        '#ef4444';

    }

    else if (warning) {

      healthStatus =
        'Warning';

      healthColor =
        '#f59e0b';

    }


    this.summary = {

      totalBudget,

      totalSpent,

      remaining,

      healthStatus,

      healthColor

    };

  }


  // ==========================================
  // SIDEBAR
  // ==========================================

  toggleSidebar(): void {

    this.isSidebarOpen =
      !this.isSidebarOpen;

  }


  onLogout(): void {

    this.authService.logout();

  }


  // ==========================================
  // CREATE MODAL
  // ==========================================

  openCreateBudgetModal(): void {

    this.editingId = null;


    this.budgetForm.reset({

      category: '',

      limit: null,

      month:
        this.selectedMonth,

      description: ''

    });


    this.isModalOpen = true;

  }


  // ==========================================
  // EDIT
  // ==========================================

  editBudget(
    item: BudgetProgress
  ): void {

    this.editingId =
      String(item.id);


    this.budgetForm.patchValue({

      category:
        item.category,

      limit:
        item.limit,

      month:
        item.month,

      description:
        item.description || ''

    });


    this.isModalOpen = true;

  }


  // ==========================================
  // DELETE FROM BACKEND
  // ==========================================

  deleteBudget(
    id: string
  ): void {

    if (
      !confirm(
        'Are you sure you want to delete this budget limit?'
      )
    ) {

      return;

    }


    console.log(
      'Deleting budget:',
      id
    );


    this.http
      .delete(
        `${this.apiUrl}/${id}`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Budget deleted successfully:',
            response
          );


          this.loadData();

        },

        error: (error) => {

          console.error(
            'Delete Budget Error:',
            error
          );


          alert(
            error?.error?.message ||
            'Failed to delete budget'
          );

        }

      });

  }


  // ==========================================
  // CLOSE MODAL
  // ==========================================

  closeModal(): void {

    this.isModalOpen = false;

    this.editingId = null;

  }


  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  onSubmitBudget(): void {

    console.log(
      '========== BUDGET SUBMIT =========='
    );


    if (
      this.budgetForm.invalid
    ) {

      console.log(
        'Budget form is invalid'
      );


      this.budgetForm.markAllAsTouched();


      return;

    }


    const val =
      this.budgetForm.getRawValue();


    const body = {

      category:
        val.category,

      budget_limit:
        Number(val.limit),

      month:
        this.formatMonthForBackend(
          val.month
        ),

      description:
        val.description || null

    };


    console.log(
      'Sending budget to backend:',
      body
    );


    // ======================================
    // UPDATE
    // ======================================

    if (this.editingId) {

      console.log(
        'PUT:',
        `${this.apiUrl}/${this.editingId}`
      );


      this.http
        .put(
          `${this.apiUrl}/${this.editingId}`,
          body
        )
        .subscribe({

          next: (response) => {

            console.log(
              'Budget updated successfully:',
              response
            );


            this.closeModal();


            this.loadData();

          },

          error: (error) => {

            console.error(
              'UPDATE BUDGET ERROR:',
              error
            );


            alert(
              error?.error?.message ||
              'Failed to update budget'
            );

          }

        });


      return;

    }


    // ======================================
    // CREATE
    // ======================================

    console.log(
      'POST:',
      this.apiUrl
    );


    this.http
      .post(
        this.apiUrl,
        body
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Budget created successfully:',
            response
          );


          this.closeModal();


          this.loadData();

        },

        error: (error) => {

          console.error(
            'CREATE BUDGET ERROR:',
            error
          );


          alert(
            error?.error?.message ||
            'Failed to create budget'
          );

        }

      });

  }


  // ==========================================
  // CHART
  // ==========================================

  private renderChart(): void {

    if (
      !this.budgetChartCanvas ||
      !this.budgetChartCanvas.nativeElement
    ) {

      return;

    }


    const ctx =
      this.budgetChartCanvas
        .nativeElement
        .getContext('2d');


    if (!ctx) {

      return;

    }


    if (this.chart) {

      this.chart.destroy();

      this.chart = null;

    }


    const labels =
      this.budgets.map(
        b => b.category
      );


    const spentData =
      this.budgets.map(
        b => Number(b.spent || 0)
      );


    const backgroundColors =
      this.budgets.map(
        b =>
          this.getCategoryColor(
            b.category
          )
      );


    if (
      labels.length === 0
    ) {

      return;

    }


    const currentSym =
      this.currencySymbol;


    const chartData =
      spentData.every(
        value =>
          value === 0
      )

        ? this.budgets.map(
          b =>
            Number(
              b.limit || 0
            )
        )

        : spentData;


    this.chart =
      new Chart(
        ctx,
        {

          type: 'doughnut',


          data: {

            labels,


            datasets: [

              {

                data:
                  chartData,

                backgroundColor:
                  backgroundColors,

                borderWidth:
                  3,

                borderColor:
                  '#ffffff'

              }

            ]

          },


          options: {

            responsive: true,

            maintainAspectRatio:
              false,


            plugins: {

              legend: {

                position: 'right',


                labels: {

                  font: {

                    family:
                      "'Plus Jakarta Sans', -apple-system, sans-serif",

                    size:
                      13,

                    weight:
                      600

                  },

                  color:
                    '#334155',

                  usePointStyle:
                    true,

                  pointStyle:
                    'circle',

                  padding:
                    18

                }

              },


              tooltip: {

                callbacks: {

                  label:
                    (context) => {

                      const label =
                        context.label ||
                        '';

                      const val =
                        context.raw as number;


                      return ` ${label}: ${currentSym}${val.toLocaleString()}`;

                    }

                }

              }

            },


            cutout:
              '75%'

          }

        }

      );

  }

}