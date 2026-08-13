import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalWrapperComponent } from '../shared/modal-wrapper';
import { Transaction } from './transaction.model';
import { CategoryService } from '../categories/category.service';
import { CurrencyService } from '../shared/currency.service';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalWrapperComponent],
  template: `
    <app-modal-wrapper 
      [isOpen]="isOpen" 
      [title]="'Record New ' + (type === 'income' ? 'Income' : 'Expense')"
      [titleColor]="type === 'income' ? 'var(--income)' : 'var(--expense)'"
      [maxWidth]="'480px'"
      (close)="onClose()">
      
      <p class="modal-intro-text">
        Add details about your {{ type }} to track your finances better.
      </p>

      <form [formGroup]="txForm" (ngSubmit)="onSubmit()">
        <div class="modal-body">
          
          <!-- Description -->
          <div class="form-group">
            <label class="form-label" for="description">Description</label>
            <input 
              type="text" 
              id="description" 
              formControlName="description" 
              (input)="onDescriptionInput()"
              class="form-input" 
              placeholder="e.g. Web Design Project or AWS Cloud Server"
              required>
            <div *ngIf="txForm.get('description')?.invalid && (txForm.get('description')?.dirty || txForm.get('description')?.touched)" class="input-error-msg">
              Description is required.
            </div>

            <!-- Auto-Categorization Suggestion Banner -->
            <div class="auto-suggest-banner" *ngIf="suggestedCategory && !txForm.get('category')?.value">
              <span class="suggest-icon">⚡</span>
              <span>Suggested Category: <strong>{{ suggestedCategory }}</strong></span>
              <button type="button" class="btn-apply-suggestion" (click)="applySuggestedCategory()">Apply</button>
            </div>
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label class="form-label" for="amount">Amount</label>
            <div class="amount-input-wrapper">
              <span class="currency-symbol">{{ currencySymbol }}</span>
              <input 
                type="number" 
                id="amount" 
                formControlName="amount" 
                class="form-input amount-input" 
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required>
            </div>
            <div *ngIf="txForm.get('amount')?.invalid && (txForm.get('amount')?.dirty || txForm.get('amount')?.touched)" class="input-error-msg">
              Amount must be a positive number.
            </div>
          </div>

          <!-- Category -->
          <div class="form-group">
            <label class="form-label" for="category">Category</label>
            <select 
              id="category" 
              formControlName="category" 
              class="form-input form-select"
              required>
              <option value="" disabled selected>Select a category</option>
              <option *ngFor="let cat of getCategories()" [value]="cat">{{ cat }}</option>
            </select>
            <div *ngIf="txForm.get('category')?.invalid && (txForm.get('category')?.dirty || txForm.get('category')?.touched)" class="input-error-msg">
              Category is required.
            </div>
          </div>

          <!-- Date -->
          <div class="form-group">
            <label class="form-label" for="date">Date</label>
            <input 
              type="date" 
              id="date" 
              formControlName="date" 
              class="form-input"
              required>
            <div *ngIf="txForm.get('date')?.invalid && (txForm.get('date')?.dirty || txForm.get('date')?.touched)" class="input-error-msg">
              Date is required.
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label" for="notes">Notes (Optional)</label>
            <textarea 
              id="notes" 
              formControlName="notes" 
              class="form-input form-textarea" 
              placeholder="Add any additional details..."></textarea>
          </div>

        </div>

        <!-- Footer Buttons -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="onClose()">Cancel</button>
          <button 
            type="submit" 
            class="btn" 
            [ngClass]="type === 'income' ? 'btn-income' : 'btn-expense'"
            [disabled]="txForm.invalid">
            Save
          </button>
        </div>
      </form>
    </app-modal-wrapper>
  `,
  styles: [`
    .modal-intro-text {
      padding: 0 24px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 8px;
      margin-bottom: -8px;
    }

    .amount-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol {
      position: absolute;
      left: 16px;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
    }

    .amount-input {
      padding-left: 32px;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-body .form-group:last-child {
      margin-bottom: 0;
    }

    .auto-suggest-banner {
      margin-top: 8px;
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      border-radius: var(--radius-sm);
      padding: 6px 12px;
      font-size: 12px;
      color: #0369a1;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .suggest-icon {
      margin-right: 4px;
    }

    .btn-apply-suggestion {
      background: #0ea5e9;
      color: white;
      border: none;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
  `]
})
export class TransactionModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() type: 'income' | 'expense' = 'income';

  @Output() save = new EventEmitter<Omit<Transaction, 'id' | 'user_id'>>();
  @Output() close = new EventEmitter<void>();

  incomeCategories = ['Consulting', 'Web Design', 'Product Sales', 'Royalties', 'Other'];
  expenseCategories = [
    'Rent/Mortgage',
    'Business Expenses', 
    'Office Rent', 
    'Software Subscriptions', 
    'Professional Development', 
    'Marketing', 
    'Travel', 
    'Meals & Entertainment', 
    'Utilities', 
    'Food',
    'Other'
  ];

  suggestedCategory = '';

  txForm = new FormGroup({
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    category: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl('', { nonNullable: true })
  });

  currencySymbol = '₹';

  constructor(
    private categoryService: CategoryService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.currencyService.symbol$.subscribe(sym => {
      this.currencySymbol = sym;
    });
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.resetForm();
    }
  }

  getCategories(): string[] {
    const list = this.categoryService.getCategoriesByType(this.type).map(c => c.name);
    return list.length > 0 ? list : (this.type === 'income' ? this.incomeCategories : this.expenseCategories);
  }

  onDescriptionInput(): void {
    const desc = this.txForm.get('description')?.value || '';
    if (desc.trim()) {
      this.suggestedCategory = this.categoryService.suggestCategory(desc, this.type);
    } else {
      this.suggestedCategory = '';
    }
  }

  applySuggestedCategory(): void {
    if (this.suggestedCategory) {
      this.txForm.patchValue({ category: this.suggestedCategory });
    }
  }

  resetForm(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    this.suggestedCategory = '';

    this.txForm.reset({
      description: '',
      amount: null,
      category: '',
      date: todayStr,
      notes: ''
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.txForm.invalid) return;

    const values = this.txForm.getRawValue();

    this.save.emit({
      type: this.type,
      description: values.description,
      amount: values.amount as number,
      category: values.category,
      date: values.date,
      notes: values.notes || undefined
    });

    this.onClose();
  }
}
