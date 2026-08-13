import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../shared/sidebar';
import { HeaderComponent } from '../shared/header';
import { ModalWrapperComponent } from '../shared/modal-wrapper';
import { AuthService } from '../auth/auth.service';
import { User } from '../transactions/transaction.model';
import { CategoryService, CategoryItem } from './category.service';
import { CurrencyService } from '../shared/currency.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SidebarComponent, HeaderComponent, ModalWrapperComponent],
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
        <app-header 
          title="Settings" 
          subtitle="Manage your account settings, profile preferences, and categories."
          (toggleSidebar)="toggleSidebar()">
        </app-header>

        <!-- Toast Feedback Banner (Auto-dismisses in 2.5s or on click) -->
        <div class="toast-banner" *ngIf="toastMsg" (click)="dismissToast()">
          <div class="toast-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ toastMsg }}</span>
          </div>
          <button type="button" class="btn-toast-close" (click)="dismissToast(); $event.stopPropagation()">×</button>
        </div>

        <div class="page-container">
          <div class="settings-grid">
            <!-- Left Sub-Navigation (Fully Interactive) -->
            <div class="card subnav-card">
              <div class="subnav-list">
                <button 
                  class="subnav-item" 
                  [class.active]="activeSettingsTab === 'profile'"
                  (click)="setTab('profile')">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </button>

                <button 
                  class="subnav-item" 
                  [class.active]="activeSettingsTab === 'categories'"
                  (click)="setTab('categories')">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h10M7 12h10M7 17h10" />
                  </svg>
                  <span>Categories</span>
                </button>

                <button 
                  class="subnav-item" 
                  [class.active]="activeSettingsTab === 'notifications'"
                  (click)="setTab('notifications')">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Notifications</span>
                </button>

                <button 
                  class="subnav-item" 
                  [class.active]="activeSettingsTab === 'security'"
                  (click)="setTab('security')">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Security</span>
                </button>
              </div>
            </div>

            <!-- Right Content Panel -->
            <div class="card settings-content-card">
              
              <!-- 1. PROFILE TAB -->
              <div *ngIf="activeSettingsTab === 'profile'" class="tab-panel">
                <div class="panel-header">
                  <h2 class="panel-title">Profile Settings</h2>
                  <p class="panel-subtitle">Manage your account information and preferences.</p>
                </div>

                <div class="profile-header-group">
                  <div class="user-avatar-lg">{{ getUserInitials() }}</div>
                  <div>
                    <h3 class="user-name-title">{{ currentUser?.name || 'User Profile' }}</h3>
                    <p class="text-subtle">{{ currentUser?.email || 'user@example.com' }}</p>
                  </div>
                </div>

                <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" class="settings-form">
                  <div class="form-group">
                    <label class="form-label" for="profileName">Full Name</label>
                    <input type="text" id="profileName" formControlName="name" class="form-input">
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="profileEmail">Email Address</label>
                    <input type="email" id="profileEmail" formControlName="email" class="form-input" readonly style="background: #f8fafc; cursor: not-allowed;">
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label" for="profileCountry">Country of Residence</label>
                      <select id="profileCountry" formControlName="country" (change)="onCountryChange($event)" class="form-input form-select">
                        <option value="India">India (₹ INR)</option>
                        <option value="United States">United States ($ USD)</option>
                        <option value="United Kingdom">United Kingdom (£ GBP)</option>
                        <option value="Canada">Canada ($ CAD)</option>
                        <option value="Australia">Australia ($ AUD)</option>
                        <option value="Germany">Germany (€ EUR)</option>
                        <option value="Japan">Japan (¥ JPY)</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="profileBracket">Profession / Income Bracket</label>
                      <select id="profileBracket" formControlName="income_bracket" class="form-input form-select">
                        <option value="Freelancer">Freelance Software / Consultant</option>
                        <option value="Gig Worker">Gig Worker / Contractor</option>
                        <option value="Small Business">Small Business Owner</option>
                        <option value="5-10L">₹5L - ₹10L / Year</option>
                        <option value="10L+">₹10L+ / Year</option>
                      </select>
                    </div>
                  </div>

                  <div class="panel-actions">
                    <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid">
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>

              <!-- 2. CATEGORIES TAB (Original Document Spec) -->
              <div *ngIf="activeSettingsTab === 'categories'" class="tab-panel">
                <div class="panel-header">
                  <h2 class="panel-title">Category Management</h2>
                  
                  <div class="category-tabs">
                    <button 
                      class="tab-btn" 
                      [class.active]="activeCategoryType === 'expense'"
                      (click)="setCategoryType('expense')">
                      Expense Categories ({{ expenseCategories.length }})
                    </button>
                    <button 
                      class="tab-btn" 
                      [class.active]="activeCategoryType === 'income'"
                      (click)="setCategoryType('income')">
                      Income Categories ({{ incomeCategories.length }})
                    </button>
                  </div>
                </div>

                <div class="category-rows">
                  <div 
                    class="category-row-item" 
                    *ngFor="let cat of (activeCategoryType === 'expense' ? expenseCategories : incomeCategories)">
                    
                    <div class="category-info">
                      <span class="color-dot" [style.background-color]="cat.color"></span>
                      <span class="cat-name">{{ cat.name }}</span>
                    </div>

                    <div class="category-row-actions">
                      <button class="btn-icon btn-icon-edit" (click)="openEditCategoryModal(cat)" title="Edit Category">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        class="btn-icon btn-icon-delete" 
                        (click)="deleteCategory(cat.id)" 
                        title="Delete Category">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="add-category-footer">
                  <button class="btn-add-full" (click)="openAddCategoryModal()">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>Add New Category</span>
                  </button>
                </div>
              </div>

              <!-- 3. NOTIFICATIONS TAB -->
              <div *ngIf="activeSettingsTab === 'notifications'" class="tab-panel">
                <div class="panel-header">
                  <h2 class="panel-title">Notification Preferences</h2>
                  <p class="panel-subtitle">Configure alerts for budgets, tax deadlines, and account digests.</p>
                </div>

                <div class="toggle-list">
                  <div class="toggle-row">
                    <div>
                      <div class="toggle-title">Budget Exceeded Alerts</div>
                      <div class="toggle-desc">Receive instant notifications when category spending exceeds 80% limit</div>
                    </div>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="notifSettings.budgetAlerts">
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="toggle-row">
                    <div>
                      <div class="toggle-title">Quarterly Tax Due Reminders</div>
                      <div class="toggle-desc">Schedule email alerts 15 days before quarterly tax filing due dates</div>
                    </div>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="notifSettings.taxReminders">
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="toggle-row">
                    <div>
                      <div class="toggle-title">Weekly Financial Summary</div>
                      <div class="toggle-desc">Weekly email digest summarizing total income, expenses, and savings rate</div>
                    </div>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="notifSettings.weeklySummary">
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="toggle-row">
                    <div>
                      <div class="toggle-title">Security & Account Alerts</div>
                      <div class="toggle-desc">Receive security alerts for new device sign-ins and password updates</div>
                    </div>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="notifSettings.securityAlerts">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="panel-actions">
                  <button class="btn btn-primary" (click)="onSaveNotifications()">
                    Save Notification Preferences
                  </button>
                </div>
              </div>

              <!-- 4. SECURITY TAB -->
              <div *ngIf="activeSettingsTab === 'security'" class="tab-panel">
                <div class="panel-header">
                  <h2 class="panel-title">Security & Password</h2>
                  <p class="panel-subtitle">Update password and authentication settings.</p>
                </div>

                <form [formGroup]="securityForm" (ngSubmit)="onSaveSecurity()" class="settings-form">
                  <div class="form-group">
                    <label class="form-label" for="currentPass">Current Password</label>
                    <input type="password" id="currentPass" formControlName="currentPassword" class="form-input" placeholder="••••••••">
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="newPass">New Password</label>
                    <input type="password" id="newPass" formControlName="newPassword" class="form-input" placeholder="••••••••">
                    <p class="input-hint">Min 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number.</p>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="confirmPass">Confirm New Password</label>
                    <input type="password" id="confirmPass" formControlName="confirmPassword" class="form-input" placeholder="••••••••">
                  </div>

                  <div class="panel-actions">
                    <button type="submit" class="btn btn-primary" [disabled]="securityForm.invalid">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </main>

      <!-- Add/Edit Category Modal -->
      <app-modal-wrapper 
        [isOpen]="isModalOpen" 
        [title]="editingId ? 'Edit Category' : 'Add New Category'" 
        [maxWidth]="'450px'" 
        (close)="closeModal()">
        
        <form [formGroup]="catForm" (ngSubmit)="onSubmitCategory()" style="padding: 24px;">
          <div class="form-group">
            <label class="form-label" for="catName">Category Name</label>
            <input 
              type="text" 
              id="catName" 
              formControlName="name" 
              class="form-input" 
              placeholder="e.g. Business Expenses">
          </div>

          <div class="form-group">
            <label class="form-label" for="catType">Type</label>
            <select id="catType" formControlName="type" class="form-input form-select" [attr.disabled]="editingId ? true : null">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Color Tag</label>
            <div class="color-picker-grid">
              <button 
                type="button" 
                *ngFor="let color of colorPalette" 
                class="color-option" 
                [style.background-color]="color"
                [class.selected]="catForm.get('color')?.value === color"
                (click)="selectColor(color)">
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="catDesc">Description (Optional)</label>
            <input 
              type="text" 
              id="catDesc" 
              formControlName="description" 
              class="form-input" 
              placeholder="Category notes...">
          </div>

          <div class="modal-footer" style="padding: 16px 0 0 0; margin-top: 16px;">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="catForm.invalid">Save Category</button>
          </div>
        </form>
      </app-modal-wrapper>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background-color: var(--bg-primary); }
    .main-content { flex: 1; margin-left: 260px; display: flex; flex-direction: column; padding: 24px 36px 48px 36px; position: relative; }
    
    .page-container { width: 100%; max-width: 1200px; margin: 0; }

    .toast-banner { position: fixed; top: 24px; right: 36px; z-index: 1000; background: #10b981; color: white; padding: 12px 18px; border-radius: var(--radius-md); font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: space-between; gap: 14px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3); animation: slideInRight 0.3s ease; cursor: pointer; }
    .toast-content { display: flex; align-items: center; gap: 8px; }
    .btn-toast-close { background: none; border: none; color: white; font-size: 18px; font-weight: 700; cursor: pointer; padding: 0 4px; line-height: 1; opacity: 0.8; }
    .btn-toast-close:hover { opacity: 1; }

    .settings-grid { display: grid; grid-template-columns: 240px 1fr; gap: 28px; width: 100%; align-items: start; }
    
    .card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-md); }

    .subnav-card { padding: 14px; }
    .subnav-list { display: flex; flex-direction: column; gap: 6px; }
    .subnav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-md); border: none; background: none; font-size: 14px; font-weight: 600; color: var(--text-secondary); cursor: pointer; text-align: left; width: 100%; transition: all 0.2s ease; }
    .subnav-item:hover { background: #f8fafc; color: var(--text-primary); }
    .subnav-item.active { background: #e0f2fe; color: #0284c7; font-weight: 700; box-shadow: 0 2px 6px rgba(14, 165, 233, 0.12); }

    .settings-content-card { min-height: 480px; }
    .tab-panel { display: flex; flex-direction: column; }
    .panel-header { padding: 28px 32px 16px 32px; border-bottom: 1px solid var(--border); }
    .panel-title { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
    .panel-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }

    .profile-header-group { display: flex; align-items: center; gap: 20px; padding: 24px 32px 8px 32px; }
    .user-avatar-lg { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #0ea5e9, #0369a1); color: white; font-weight: 800; font-size: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }
    .user-name-title { font-size: 18px; font-weight: 800; color: var(--text-primary); }
    
    .settings-form { padding: 24px 32px 32px 32px; display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .category-tabs { display: flex; gap: 32px; margin-top: 16px; margin-bottom: -1px; }
    .tab-btn { background: none; border: none; padding: 10px 0; font-size: 14px; font-weight: 600; color: var(--text-secondary); cursor: pointer; border-bottom: 2.5px solid transparent; transition: all 0.2s ease; }
    .tab-btn:hover { color: var(--text-primary); }
    .tab-btn.active { color: #0284c7; border-bottom-color: #0284c7; font-weight: 700; }

    .category-rows { display: flex; flex-direction: column; }
    .category-row-item { display: flex; align-items: center; justify-content: space-between; padding: 18px 32px; border-bottom: 1px solid var(--border); transition: background-color 0.15s ease; }
    .category-row-item:hover { background-color: #f8fafc; }

    .category-info { display: flex; align-items: center; gap: 16px; }
    .color-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12); }
    .cat-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }

    .category-row-actions { display: flex; align-items: center; gap: 8px; }
    .btn-icon { background: none; border: none; cursor: pointer; color: #94a3b8; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
    .btn-icon-edit:hover { color: #0284c7; background: #e0f2fe; }
    .btn-icon-delete:hover { color: #e11d48; background: #ffe4e6; }

    .add-category-footer { padding: 24px 32px; background: white; }
    .btn-add-full { width: 100%; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; border: none; padding: 14px; border-radius: var(--radius-md); font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25); transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .btn-add-full:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35); }

    .toggle-list { display: flex; flex-direction: column; padding: 12px 32px; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid var(--border); }
    .toggle-row:last-child { border-bottom: none; }
    .toggle-title { font-weight: 700; font-size: 15px; color: var(--text-primary); }
    .toggle-desc { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }

    .switch { position: relative; display: inline-block; width: 46px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
    input:checked + .slider { background-color: #0284c7; }
    input:checked + .slider:before { transform: translateX(22px); }

    .two-factor-box { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid var(--border); padding: 16px 20px; border-radius: var(--radius-md); margin-top: 8px; }
    .tf-title { font-weight: 700; font-size: 14px; color: var(--text-primary); }
    .tf-desc { font-size: 12px; color: var(--text-secondary); }
    .badge-success { background: #d1fae5; color: #059669; padding: 4px 12px; border-radius: 12px; font-weight: 700; font-size: 12px; }

    .panel-actions { padding: 20px 32px 32px 32px; display: flex; justify-content: flex-end; }
    .input-hint { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; }

    .color-picker-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .color-option { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.15s; }
    .color-option.selected { border-color: #0f172a; transform: scale(1.15); box-shadow: 0 0 0 2px white; }

    @media (max-width: 992px) {
      .settings-grid { grid-template-columns: 1fr; }
      .main-content { margin-left: 0; padding: 16px; }
    }
  `]
})
export class CategoryListComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSidebarOpen = false;
  
  activeSettingsTab: 'profile' | 'categories' | 'notifications' | 'security' = 'categories';
  activeCategoryType: 'expense' | 'income' = 'expense';

  expenseCategories: CategoryItem[] = [];
  incomeCategories: CategoryItem[] = [];

  toastMsg = '';

  notifSettings = {
    budgetAlerts: true,
    taxReminders: true,
    weeklySummary: true,
    securityAlerts: true
  };

  isModalOpen = false;
  editingId: string | null = null;

  colorPalette = [
    '#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#ec4899', '#14b8a6', '#0ea5e9', '#f97316', '#64748b'
  ];

  profileForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    country: new FormControl('India', { nonNullable: true, validators: [Validators.required] }),
    income_bracket: new FormControl('Freelancer', { nonNullable: true, validators: [Validators.required] })
  });

  securityForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  catForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<'income' | 'expense'>('expense', { nonNullable: true, validators: [Validators.required] }),
    color: new FormControl('#ef4444', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true })
  });

  private toastTimer: any = null;
  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private currencyService: CurrencyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserValue();

    const currentCountry = this.currencyService.currentCountry;

    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email,
        country: this.currentUser.country || currentCountry || 'India',
        income_bracket: this.currentUser.income_bracket || 'Freelancer'
      });
    } else {
      this.profileForm.patchValue({ country: currentCountry });
    }

    this.subs.add(
      this.categoryService.categories$.subscribe(cats => {
        this.expenseCategories = cats.filter(c => c.type === 'expense');
        this.incomeCategories = cats.filter(c => c.type === 'income');
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  onCountryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select && select.value) {
      this.currencyService.setCountry(select.value);
      this.showToast(`Currency updated to ${this.currencyService.currentSymbol} (${this.currencyService.currentCode})`);
    }
  }

  setTab(tab: 'profile' | 'categories' | 'notifications' | 'security'): void {
    this.activeSettingsTab = tab;
  }

  setCategoryType(type: 'expense' | 'income'): void {
    this.activeCategoryType = type;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLogout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const parts = this.currentUser.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.currentUser.name.substring(0, 2).toUpperCase();
  }

  showToast(msg: string): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastMsg = msg;
    this.cdr.detectChanges();

    this.toastTimer = setTimeout(() => {
      this.toastMsg = '';
      this.cdr.detectChanges();
    }, 2500);
  }

  dismissToast(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastMsg = '';
    this.cdr.detectChanges();
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    const country = this.profileForm.get('country')?.value;
    if (country) {
      this.currencyService.setCountry(country);
    }
    this.showToast('Profile settings updated successfully!');
  }

  onSaveNotifications(): void {
    this.showToast('Notification preferences saved!');
  }

  onSaveSecurity(): void {
    if (this.securityForm.invalid) return;
    this.showToast('Password updated successfully!');
    this.securityForm.reset();
  }

  openAddCategoryModal(): void {
    this.editingId = null;
    this.catForm.reset({
      name: '',
      type: this.activeCategoryType,
      color: '#ef4444',
      description: ''
    });
    this.isModalOpen = true;
  }

  openEditCategoryModal(cat: CategoryItem): void {
    this.editingId = cat.id;
    this.catForm.patchValue({
      name: cat.name,
      type: cat.type,
      color: cat.color,
      description: cat.description || ''
    });
    this.isModalOpen = true;
  }

  selectColor(color: string): void {
    this.catForm.patchValue({ color });
  }

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id);
      this.showToast('Category deleted.');
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onSubmitCategory(): void {
    if (this.catForm.invalid) return;

    const val = this.catForm.getRawValue();

    if (this.editingId) {
      this.categoryService.updateCategory(this.editingId, val.name, val.color, val.description);
      this.showToast('Category updated.');
    } else {
      this.categoryService.addCategory(val.name, val.type, val.color, val.description);
      this.showToast('New category added.');
    }

    this.closeModal();
  }
}
