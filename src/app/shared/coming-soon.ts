import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SidebarComponent } from './sidebar';
import { HeaderComponent } from './header';
import { User } from '../transactions/transaction.model';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
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
          [title]="moduleName + ' Module'" 
          [subtitle]="'Status: Under Development'"
          (toggleSidebar)="toggleSidebar()">
        </app-header>

        <section class="coming-soon-card card">
          <div class="coming-soon-content">
            <div class="lock-icon-wrapper">
              <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 class="coming-soon-title">{{ moduleName }} is Locked</h2>
            <p class="coming-soon-text">
              The <strong>{{ moduleName }}</strong> feature is planned for a future release milestone. 
              Currently, only the Auth, Dashboard summaries, and full Transactions logger are functional for Milestone 1.
            </p>
            <button class="btn btn-primary" (click)="goHome()">Back to Dashboard</button>
          </div>
        </section>
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
      max-width: 1200px;
      width: calc(100% - 260px);
    }

    .coming-soon-card {
      padding: 60px 24px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .coming-soon-content {
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .lock-icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background-color: var(--primary-light);
      color: var(--primary-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      box-shadow: 0 4px 10px rgba(14, 165, 233, 0.1);
    }

    .coming-soon-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .coming-soon-text {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
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
export class ComingSoonComponent implements OnInit {
  user: User | null = null;
  sidebarOpen = signal(false);
  moduleName = 'Budgets';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (!u) {
        this.router.navigate(['/login']);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['module']) {
        this.moduleName = params['module'];
      } else {
        this.moduleName = 'Feature';
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(val => !val);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
