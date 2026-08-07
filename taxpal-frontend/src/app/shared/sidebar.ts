import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../transactions/transaction.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.open]="isOpen">
      <div class="sidebar-header">
        <svg class="brand-logo" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#0ea5e9"/>
          <path d="M12 6V18M6 12H18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="3" fill="#ffffff" stroke="#0ea5e9" stroke-width="2"/>
        </svg>
        <span class="brand-name">TaxPal</span>
      </div>
      
      <nav class="sidebar-nav">
        <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="onNavClick()">
          <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
          </svg>
          <span>Dashboard</span>
        </a>
        
        <a class="nav-item" routerLink="/transactions" routerLinkActive="active" (click)="onNavClick()">
          <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
          <span>Transactions</span>
        </a>
        
        <a class="nav-item" routerLink="/budgets" routerLinkActive="active" (click)="onNavClick()">
          <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Budgets</span>
        </a>

        <a class="nav-item" routerLink="/categories" routerLinkActive="active" (click)="onNavClick()">
          <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h10M7 12h10M7 17h10" />
          </svg>
          <span>Categories</span>
        </a>
        
        <a class="nav-item" routerLink="/coming-soon" [queryParams]="{module: 'Tax Estimator'}" routerLinkActive="active" (click)="onNavClick()">
          <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Tax Estimator</span>
        </a>
        
        <a class="nav-item" routerLink="/coming-soon" [queryParams]="{module: 'Reports'}" routerLinkActive="active" (click)="onNavClick()">
          <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          <span>Reports</span>
        </a>
      </nav>
      
      <div class="sidebar-footer" *ngIf="user">
        <div class="user-profile">
          <div class="user-avatar">{{ getUserInitials() }}</div>
          <div class="user-details">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>
        </div>
        <button class="btn-logout" (click)="onLogout()" title="Logout">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      background-color: var(--bg-dark);
      color: white;
      display: flex;
      flex-direction: column;
      padding: 24px;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 0%, #bae6fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      color: #94a3b8;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .nav-item.active {
      background-color: var(--primary);
      color: white;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
    }

    .sidebar-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
      margin-top: auto;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, #38bdf8 0%, #0369a1 100%);
      color: white;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .user-email {
      font-size: 11px;
      color: #64748b;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .btn-logout {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 8px;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-logout:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--expense);
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() user: User | null = null;
  @Output() toggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  getUserInitials(): string {
    if (!this.user) return '';
    const parts = this.user.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.user.name.substring(0, 2).toUpperCase();
  }

  onNavClick(): void {
    if (window.innerWidth <= 768) {
      this.toggle.emit();
    }
  }

  onLogout(): void {
    this.logout.emit();
  }
}
