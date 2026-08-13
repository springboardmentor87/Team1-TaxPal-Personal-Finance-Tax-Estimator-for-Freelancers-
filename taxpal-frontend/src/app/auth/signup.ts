import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-signup',
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
              <h2>Join Thousands of Smart Freelancers</h2>
              <p>Start estimating your taxes, organizing expenses, and saving hours on accounting today.</p>
            </div>

            <div class="hero-features">
              <div class="feature-item">
                <div class="feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Free 30-Day Full Feature Access</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>No Credit Card Required</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Bank-grade 256-bit Encryption</span>
              </div>
            </div>

            <!-- Floating Stat Widget -->
            <div class="hero-stat-card">
              <div class="stat-badge">⭐ 4.9/5 Rating</div>
              <div class="stat-main">
                <div>
                  <div class="stat-label">Active Freelancers</div>
                  <div class="stat-val">10,000+ Trust TaxPal</div>
                </div>
                <div class="stat-graph-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
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
              <h1 class="welcome-title">Create Account 🚀</h1>
              <p class="welcome-sub">Fill in details below to get started in less than a minute.</p>
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

            <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
              <!-- Grid for Username & Full Name -->
              <div class="form-grid">
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
                      placeholder="johndoe" 
                      required>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="fullName">Full Name</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input 
                      type="text" 
                      id="fullName" 
                      formControlName="fullName"
                      class="form-input with-icon" 
                      placeholder="John Doe" 
                      required>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email"
                    class="form-input with-icon" 
                    placeholder="john@example.com" 
                    required>
                </div>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label class="form-label" for="password">Password</label>
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
                    placeholder="Min 8 chars (e.g. Password123)" 
                    required>
                </div>
                <!-- Password Requirement Feedback -->
                <div class="password-requirements" *ngIf="signupForm.get('password')?.touched || signupForm.get('password')?.value">
                  <div class="req-item" [class.valid]="hasMinLength()" [class.invalid]="!hasMinLength()">
                    <span>{{ hasMinLength() ? '✓' : '✕' }} At least 8 characters</span>
                  </div>
                  <div class="req-item" [class.valid]="hasCapitalLetter()" [class.invalid]="!hasCapitalLetter()">
                    <span>{{ hasCapitalLetter() ? '✓' : '✕' }} At least 1 capital letter (A-Z)</span>
                  </div>
                  <div class="req-item" [class.valid]="hasLowercaseLetter()" [class.invalid]="!hasLowercaseLetter()">
                    <span>{{ hasLowercaseLetter() ? '✓' : '✕' }} At least 1 lowercase letter (a-z)</span>
                  </div>
                  <div class="req-item" [class.valid]="hasNumber()" [class.invalid]="!hasNumber()">
                    <span>{{ hasNumber() ? '✓' : '✕' }} At least 1 number (0-9)</span>
                  </div>
                </div>
              </div>

              <!-- Country & Income Grid -->
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label" for="country">Country</label>
                  <select 
                    id="country" 
                    formControlName="country"
                    class="form-input form-select" 
                    required>
                    <option value="" disabled selected>Select country</option>
                    <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="incomeBracket">Income (Optional)</label>
                  <select 
                    id="incomeBracket" 
                    formControlName="incomeBracket"
                    class="form-input form-select">
                    <option value="" disabled selected>Bracket</option>
                    <option value="low">Under ₹30k</option>
                    <option value="middle">₹30k - ₹100k</option>
                    <option value="high">Over ₹100k</option>
                  </select>
                </div>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="signupForm.invalid">
                <span>Create Free Account</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>

            <div class="divider">
              <span>Or</span>
            </div>

            <!-- Sign In Prompt -->
            <div class="signin-prompt">
              Already have an account? 
              <a routerLink="/login" class="signin-link">Sign in here</a>
            </div>

            <div class="auth-footer">
              <p>By signing up, you agree to our <a href="#" (click)="$event.preventDefault()">Terms</a> and <a href="#" (click)="$event.preventDefault()">Privacy Policy</a>.</p>
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
      min-height: 660px;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
      animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Left Hero Panel */
    .auth-hero {
      flex: 1;
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
      flex: 1.25;
      padding: 40px 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }

    .auth-form-card {
      width: 100%;
      max-width: 440px;
    }

    .form-header {
      margin-bottom: 24px;
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

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
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
      height: 44px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background-color: #f8fafc;
      font-size: 14px;
      color: #0f172a;
      transition: all 0.2s ease;
      padding: 0 14px;
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

    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      background-size: 16px;
      padding-right: 36px;
    }

    .password-requirements {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .req-item {
      font-size: 12px;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .req-item.valid {
      color: #16a34a;
    }

    .req-item.invalid {
      color: #dc2626;
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
      margin: 20px 0;
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

    .signin-prompt {
      text-align: center;
      font-size: 14px;
      color: #64748b;
    }

    .signin-link {
      font-weight: 700;
      color: #0ea5e9;
      text-decoration: none;
      margin-left: 4px;
    }

    .signin-link:hover {
      text-decoration: underline;
    }

    .auth-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    .auth-footer a {
      color: #64748b;
      text-decoration: underline;
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

      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SignupComponent {
  errorMessage = signal<string | null>(null);

  countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'India',
    'Singapore'
  ];

  signupForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]
    }),
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    country: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    incomeBracket: new FormControl('', { nonNullable: true })
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  hasMinLength(): boolean {
    const val = this.signupForm.get('password')?.value || '';
    return val.length >= 8;
  }

  hasCapitalLetter(): boolean {
    const val = this.signupForm.get('password')?.value || '';
    return /[A-Z]/.test(val);
  }

  hasLowercaseLetter(): boolean {
    const val = this.signupForm.get('password')?.value || '';
    return /[a-z]/.test(val);
  }

  hasNumber(): boolean {
    const val = this.signupForm.get('password')?.value || '';
    return /\d/.test(val);
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      if (!this.hasCapitalLetter()) {
        this.errorMessage.set('Password must contain at least one capital letter (A-Z).');
      } else if (!this.hasMinLength()) {
        this.errorMessage.set('Password must be at least 8 characters long.');
      } else if (!this.hasLowercaseLetter()) {
        this.errorMessage.set('Password must contain at least one lowercase letter (a-z).');
      } else if (!this.hasNumber()) {
        this.errorMessage.set('Password must contain at least one number (0-9).');
      }
      return;
    }

    const values = this.signupForm.getRawValue();
    this.authService.signup({
      username: values.username,
      password: values.password,
      name: values.fullName,
      email: values.email,
      country: values.country,
      income_bracket: values.incomeBracket || 'Default'
    }).subscribe(result => {
      if (result.success) {
        this.errorMessage.set(null);
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      } else {
        this.errorMessage.set(result.error || 'Signup failed');
      }
    });
  }
}
