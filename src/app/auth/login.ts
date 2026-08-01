import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-wrapper">
        <!-- Left Banner / Hero Side -->
        <div class="auth-hero">
          <div class="hero-bg-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>
          <div class="hero-content">
            <div class="hero-brand">
              <div class="logo-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fill-opacity="0.9"/>
                  <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="hero-brand-name">TaxPal</span>
            </div>

            <div class="hero-headline">
              <h2>Master Your Taxes & Financial Freedom</h2>
              <p>Automated deductions, real-time tax estimation, and smart financial reporting tailored for modern professionals.</p>
            </div>

            <div class="hero-features">
              <div class="feature-item">
                <div class="feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Real-Time Tax Liability Estimation</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Automated Expense & Income Categorization</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Export-Ready Reports for Filing</span>
              </div>
            </div>

            <!-- Floating Stat Widget -->
            <div class="hero-stat-card">
              <div class="stat-badge">⚡ Instant Calculation</div>
              <div class="stat-main">
                <div>
                  <div class="stat-label">Average Time Saved</div>
                  <div class="stat-val">12+ Hours / Month</div>
                </div>
                <div class="stat-graph-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Form Side -->
        <div class="auth-form-container">
          <div class="auth-form-card">
            <div class="form-header">
              <h1 class="welcome-title">Welcome back 👋</h1>
              <p class="welcome-sub">Please enter your credentials to access your account.</p>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage()" class="alert alert-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{{ successMessage() }}</span>
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

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <!-- Username -->
              <div class="form-group">
                <label class="form-label" for="username">Username</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input 
                    type="text" 
                    id="username" 
                    formControlName="username"
                    class="form-input with-icon" 
                    placeholder="Enter your username" 
                    required>
                </div>
                <div *ngIf="loginForm.get('username')?.invalid && (loginForm.get('username')?.dirty || loginForm.get('username')?.touched)" class="input-error-msg">
                  Username is required.
                </div>
              </div>

              <!-- Password -->
              <div class="form-group">
                <div class="password-label-wrapper">
                  <label class="form-label" for="password">Password</label>
                  <a href="#" class="forgot-password" (click)="$event.preventDefault()">Forgot password?</a>
                </div>
                <div class="input-wrapper">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    type="password" 
                    id="password" 
                    formControlName="password"
                    class="form-input with-icon" 
                    placeholder="••••••••••••" 
                    required>
                </div>
                <div *ngIf="loginForm.get('password')?.invalid && (loginForm.get('password')?.dirty || loginForm.get('password')?.touched)" class="input-error-msg">
                  Password is required.
                </div>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loginForm.invalid">
                <span>Sign in to Dashboard</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>

            <div class="divider">
              <span>Or</span>
            </div>

            <!-- Sign Up Callout -->
            <div class="signup-prompt">
              Don't have an account? 
              <a routerLink="/signup" class="signup-link">Create an account</a>
            </div>

            <div class="auth-footer">
              <p>© 2026 TaxPal Finance. Encrypted with 256-bit SSL Security.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .auth-wrapper {
      display: flex;
      width: 100%;
      max-width: 1040px;
      min-height: 640px;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
      animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Left Hero Panel */
    .auth-hero {
      flex: 1.1;
      background: linear-gradient(145deg, #0284c7 0%, #0ea5e9 40%, #0284c7 100%);
      padding: 48px;
      color: #ffffff;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .hero-bg-shapes {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(50px);
      opacity: 0.3;
    }

    .shape-1 {
      width: 300px;
      height: 300px;
      background: #38bdf8;
      top: -50px;
      right: -50px;
    }

    .shape-2 {
      width: 250px;
      height: 250px;
      background: #0284c7;
      bottom: -60px;
      left: -40px;
    }

    .shape-3 {
      width: 180px;
      height: 180px;
      background: #38bdf8;
      top: 40%;
      left: 30%;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    .hero-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-box {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .hero-brand-name {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    .hero-headline {
      margin: 32px 0 24px;
    }

    .hero-headline h2 {
      font-size: 30px;
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
      color: #ffffff;
    }

    .hero-headline p {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.6;
    }

    .hero-features {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 32px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.95);
    }

    .feature-icon {
      width: 26px;
      height: 26px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
    }

    .hero-stat-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 16px;
      padding: 18px 20px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .stat-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 8px;
    }

    .stat-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }

    .stat-val {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 2px;
    }

    .stat-graph-icon {
      color: rgba(255, 255, 255, 0.9);
    }

    /* Right Form Side */
    .auth-form-container {
      flex: 1;
      padding: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }

    .auth-form-card {
      width: 100%;
      max-width: 380px;
    }

    .form-header {
      margin-bottom: 32px;
    }

    .welcome-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }

    .welcome-sub {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }

    .alert-success {
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      color: #94a3b8;
      pointer-events: none;
      transition: color 0.2s ease;
    }

    .form-input.with-icon {
      padding-left: 44px;
    }

    .form-input {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background-color: #f8fafc;
      font-size: 14px;
      color: #0f172a;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      background-color: #ffffff;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
    }

    .form-input:focus + .input-icon,
    .input-wrapper:focus-within .input-icon {
      color: #0ea5e9;
    }

    .password-label-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .forgot-password {
      font-size: 13px;
      font-weight: 600;
      color: #0ea5e9;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .forgot-password:hover {
      color: #0284c7;
      text-decoration: underline;
    }

    .btn-lg {
      height: 48px;
      font-size: 15px;
      font-weight: 700;
      border-radius: 12px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 8px;
    }

    .btn-lg:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(14, 165, 233, 0.45);
    }

    .btn-lg:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      box-shadow: none;
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 24px 0;
      color: #cbd5e1;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #e2e8f0;
    }

    .divider span {
      padding: 0 12px;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      color: #94a3b8;
    }

    .signup-prompt {
      text-align: center;
      font-size: 14px;
      color: #64748b;
    }

    .signup-link {
      font-weight: 700;
      color: #0ea5e9;
      text-decoration: none;
      margin-left: 4px;
    }

    .signup-link:hover {
      text-decoration: underline;
    }

    .auth-footer {
      margin-top: 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    @media (max-width: 900px) {
      .auth-wrapper {
        flex-direction: column;
        max-width: 480px;
        min-height: auto;
      }

      .auth-hero {
        padding: 32px;
      }

      .hero-stat-card {
        display: none;
      }

      .auth-form-container {
        padding: 32px 24px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['registered'] === 'true') {
      this.successMessage.set('Account created successfully! Please sign in with your credentials.');
    }
  }

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
