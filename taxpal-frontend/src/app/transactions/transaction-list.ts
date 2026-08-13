import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TransactionService } from './transaction.service';
import { Transaction, User } from './transaction.model';
import { SidebarComponent } from '../shared/sidebar';
import { HeaderComponent } from '../shared/header';
import { BadgeComponent } from '../shared/badge';
import { TransactionModalComponent } from './transaction-modal';
import { CurrencyService } from '../shared/currency.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
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

      <!-- Main Content -->
      <main class="main-content">
        <!-- Reusable Header with Action Projection -->
        <app-header 
          [title]="'Transactions History'" 
          [subtitle]="'Manage and filter your income & expense records'"
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

        <!-- Summary Cards -->
        <section class="summary-cards">
          <div class="card summary-card">
            <span class="card-title">Total Income (Lifetime)</span>
            <span class="card-value text-income">{{ currencySymbol }}{{ totalIncome | number:'1.2-2' }}</span>
          </div>
          <div class="card summary-card">
            <span class="card-title">Total Expenses (Lifetime)</span>
            <span class="card-value text-expense">{{ currencySymbol }}{{ totalExpenses | number:'1.2-2' }}</span>
          </div>
          <div class="card summary-card">
            <span class="card-title">Net Balance</span>
            <span class="card-value" [ngClass]="netBalance >= 0 ? 'text-income' : 'text-expense'">{{ currencySymbol }}{{ netBalance | number:'1.2-2' }}</span>
          </div>
        </section>

        <!-- Main Transactions Grid -->
        <section class="card transactions-card">
          <div class="transactions-header">
            <h3 class="section-title">All Transactions</h3>
            
            <div class="filter-actions">
              <!-- Search -->
              <input 
                type="text" 
                class="form-input search-input" 
                placeholder="Search description, category or notes..." 
                [(ngModel)]="searchQuery">
              
              <!-- Filter Type -->
              <select class="form-input filter-select-box" [(ngModel)]="selectedFilterType">
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>

              <!-- Category filter -->
              <select class="form-input filter-select-box" [(ngModel)]="selectedCategory">
                <option value="all">All Categories</option>
                <option *ngFor="let cat of getAllCategories()" [value]="cat">{{ cat }}</option>
              </select>
            </div>
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
                  <th>Notes</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tx of filteredTransactions()">
                  <td class="tx-date-cell">{{ formatDate(tx.date) }}</td>
                  <td class="tx-desc-cell font-semibold">{{ tx.description }}</td>
                  <td class="tx-category-cell">
                    <span class="category-chip">{{ tx.category }}</span>
                  </td>
                  <td class="text-right font-semibold" [ngClass]="tx.type === 'income' ? 'text-income' : 'text-expense'">
                    {{ tx.type === 'income' ? '+' : '-' }}{{ currencySymbol }}{{ tx.amount | number:'1.2-2' }}
                  </td>
                  <td>
                    <app-badge [type]="tx.type"></app-badge>
                  </td>
                  <td class="tx-notes-cell" [title]="tx.notes || ''">
                    {{ tx.notes || '—' }}
                  </td>
                  <td class="text-center">
                    <button class="btn-delete-tx" (click)="deleteTransaction(tx.id)" title="Delete Transaction">
                      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredTransactions().length === 0">
                  <td colspan="7" class="no-tx-row text-center">
                    <div class="no-tx-wrapper">
                      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                      </svg>
                      <p>No transactions found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <!-- Transaction Entry Modal -->
      <app-transaction-modal 
        [isOpen]="modalOpen" 
        [type]="modalType"
        (close)="closeModal()"
        (save)="onSaveTransaction($event)">
      </app-transaction-modal>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="confirmDeleteId" class="modal-overlay" (click)="cancelDelete()">
        <div class="modal-container" (click)="$event.stopPropagation()" style="max-width: 400px;">
          <div class="modal-header">
            <h2 class="modal-title" style="color: var(--expense);">Confirm Deletion</h2>
            <button class="modal-close" (click)="cancelDelete()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body" style="padding: 20px;">
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 0;">Are you sure you want to delete this transaction? This action cannot be undone.</p>
          </div>
          <div class="modal-footer" style="padding: 12px 20px;">
            <button type="button" class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
            <button type="button" class="btn btn-expense" (click)="executeDelete()">Delete</button>
          </div>
        </div>
      </div>

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

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .summary-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-value {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .text-income {
      color: var(--income-hover);
    }

    .text-expense {
      color: var(--expense-hover);
    }

    /* Grid layout and filtering */
    .transactions-card {
      margin-bottom: 24px;
    }

    .transactions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-input {
      width: 250px;
      padding: 8px 12px;
      font-size: 13px;
      border-radius: var(--radius-sm);
    }

    .filter-select-box {
      width: 150px;
      padding: 8px 12px;
      font-size: 13px;
      border-radius: var(--radius-sm);
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

    .tx-notes-cell {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-secondary);
      font-size: 13px;
    }

    .btn-delete-tx {
      background: none;
      border: none;
      color: var(--text-light);
      cursor: pointer;
      padding: 6px;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-delete-tx:hover {
      background-color: var(--expense-light);
      color: var(--expense);
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
export class TransactionListComponent implements OnInit {
  user: User | null = null;
  transactions: Transaction[] = [];

  // Lifetime Stats
  totalIncome = 0;
  totalExpenses = 0;
  netBalance = 0;

  // Search & Filters
  searchQuery = '';
  selectedFilterType = 'all';
  selectedCategory = 'all';

  // State
  sidebarOpen = signal(false);
  modalOpen = false;
  modalType: 'income' | 'expense' = 'income';
  confirmDeleteId: string | null = null;

  currencySymbol = '₹';

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currencyService.symbol$.subscribe(sym => {
      this.currencySymbol = sym;
    });

    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (!u) {
        this.router.navigate(['/login']);
      }
    });

    this.transactionService.transactions$.subscribe(txs => {
      this.transactions = txs;
      this.calculateLifetimeStats();
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(val => !val);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  calculateLifetimeStats(): void {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.netBalance = this.totalIncome - this.totalExpenses;
  }

  getAllCategories(): string[] {
    const cats = new Set(this.transactions.map(t => t.category));
    return Array.from(cats).sort();
  }

  filteredTransactions(): Transaction[] {
    return this.transactions.filter(t => {
      const search = this.searchQuery.toLowerCase();
      const matchesSearch = 
        t.description?.toLowerCase().includes(search) || 
        t.category.toLowerCase().includes(search) ||
        t.notes?.toLowerCase().includes(search);
      
      const matchesType = this.selectedFilterType === 'all' || t.type === this.selectedFilterType;
      const matchesCat = this.selectedCategory === 'all' || t.category === this.selectedCategory;

      return matchesSearch && matchesType && matchesCat;
    });
  }

  formatDate(dateStr: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
  }

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

  deleteTransaction(id: string): void {
    this.confirmDeleteId = id;
  }

  executeDelete(): void {
    if (this.confirmDeleteId) {
      this.transactionService.deleteTransaction(this.confirmDeleteId);
      this.confirmDeleteId = null;
    }
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }
}
