import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Logo / Title -->
        <div class="brand-header">
          <svg class="brand-logo" width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#0ea5e9"/>
            <path d="M12 6V18M6 12H18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff" stroke="#0ea5e9" stroke-width="2"/>
          </svg>
          <h1 class="brand-title">TaxPal</h1>
          <p class="brand-subtitle">Sign in to your account to continue</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage()" class="alert alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username"
              class="form-input" 
              placeholder="Enter your username" 
              required>
            <div *ngIf="loginForm.get('username')?.invalid && (loginForm.get('username')?.dirty || loginForm.get('username')?.touched)" class="input-error-msg">
              Username is required.
            </div>
          </div>

          <div class="form-group">
            <div class="password-label-wrapper">
              <label class="form-label" for="password">Password</label>
              <a href="#" class="forgot-password" (click)="$event.preventDefault()">Forgot password?</a>
            </div>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              class="form-input" 
              placeholder="Enter your password" 
              required>
            <div *ngIf="loginForm.get('password')?.invalid && (loginForm.get('password')?.dirty || loginForm.get('password')?.touched)" class="input-error-msg">
              Password is required.
            </div>
          </div>

          <!-- Demo Helper Text -->
          <div class="demo-helper">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Demo account: <strong>demo</strong> / <strong>password</strong></span>
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loginForm.invalid">
            Sign in
          </button>
        </form>

        <!-- Sign Up Prompt -->
        <p class="signup-prompt">
          Don't have an account? 
          <a routerLink="/signup" class="signup-link">Sign up</a>
        </p>

        <!-- Footer -->
        <p class="login-footer">© 2026 TaxPal. All rights reserved.</p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--bg-primary);
      padding: 24px;
    }

    .login-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 40px;
      width: 100%;
      max-width: 440px;
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .brand-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .brand-logo {
      margin: 0 auto 16px;
      filter: drop-shadow(0 4px 6px rgba(14, 165, 233, 0.15));
    }

    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .password-label-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .password-label-wrapper .form-label {
      margin-bottom: 0;
    }

    .forgot-password {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .forgot-password:hover {
      color: var(--primary-hover);
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-size: 13px;
      margin-bottom: 20px;
      animation: scaleIn 0.2s ease;
    }

    .alert-error {
      background-color: var(--expense-light);
      color: var(--expense-hover);
      border: 1px solid rgba(244, 63, 94, 0.2);
    }

    .demo-helper {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: var(--primary-light);
      color: var(--primary-hover);
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      margin-bottom: 20px;
      border: 1px solid rgba(14, 165, 233, 0.15);
    }

    .signup-prompt {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 24px;
    }

    .signup-link {
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .signup-link:hover {
      color: var(--primary-hover);
    }

    .login-footer {
      text-align: center;
      font-size: 12px;
      color: var(--text-light);
      margin-top: 32px;
      border-top: 1px solid var(--border);
      padding-top: 16px;
    }
  `]
})
export class LoginComponent {
  errorMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.getRawValue();
    const result = this.authService.login(username, password);

    if (result.success) {
      this.errorMessage.set(null);
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error || 'Login failed');
    }
  }
}
