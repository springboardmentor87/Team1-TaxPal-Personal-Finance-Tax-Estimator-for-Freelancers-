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
    <div class="signup-page">
      <div class="signup-card">
        <!-- Logo / Title -->
        <div class="brand-header">
          <svg class="brand-logo" width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#0ea5e9"/>
            <path d="M12 6V18M6 12H18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff" stroke="#0ea5e9" stroke-width="2"/>
          </svg>
          <h1 class="brand-title">Create an Account</h1>
          <p class="brand-subtitle">Enter your information to create your TaxPal account</p>
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

        <!-- Signup Form -->
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username"
              class="form-input" 
              placeholder="Choose a username" 
              required>
            <div *ngIf="signupForm.get('username')?.invalid && (signupForm.get('username')?.dirty || signupForm.get('username')?.touched)" class="input-error-msg">
              Username is required.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              class="form-input" 
              placeholder="Choose a password" 
              required>
            <div *ngIf="signupForm.get('password')?.invalid && (signupForm.get('password')?.dirty || signupForm.get('password')?.touched)" class="input-error-msg">
              <span *ngIf="signupForm.get('password')?.errors?.['required']">Password is required.</span>
              <span *ngIf="signupForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters.</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="fullName">Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              formControlName="fullName"
              class="form-input" 
              placeholder="Enter your full name" 
              required>
            <div *ngIf="signupForm.get('fullName')?.invalid && (signupForm.get('fullName')?.dirty || signupForm.get('fullName')?.touched)" class="input-error-msg">
              Full name is required.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              class="form-input" 
              placeholder="Enter your email address" 
              required>
            <div *ngIf="signupForm.get('email')?.invalid && (signupForm.get('email')?.dirty || signupForm.get('email')?.touched)" class="input-error-msg">
              <span *ngIf="signupForm.get('email')?.errors?.['required']">Email is required.</span>
              <span *ngIf="signupForm.get('email')?.errors?.['email']">Please enter a valid email address.</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="country">Country</label>
            <select 
              id="country" 
              formControlName="country"
              class="form-input form-select" 
              required>
              <option value="" disabled selected>Select your country</option>
              <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
            </select>
            <div *ngIf="signupForm.get('country')?.invalid && (signupForm.get('country')?.dirty || signupForm.get('country')?.touched)" class="input-error-msg">
              Country is required.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="incomeBracket">Income Bracket (Optional)</label>
            <select 
              id="incomeBracket" 
              formControlName="incomeBracket"
              class="form-input form-select">
              <option value="" disabled selected>Select your income bracket</option>
              <option value="low">Low (under ₹30k)</option>
              <option value="middle">Middle (₹30k - ₹100k)</option>
              <option value="high">High (over ₹100k)</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="signupForm.invalid">
            Create Account
          </button>
        </form>

        <!-- Sign In Prompt -->
        <p class="signin-prompt">
          Already have an account? 
          <a routerLink="/login" class="signin-link">Sign in</a>
        </p>

        <!-- Terms Agreement Notice -->
        <p class="terms-notice">
          By creating an account, you agree to our <a href="#" (click)="$event.preventDefault()">Terms of Service</a> and <a href="#" (click)="$event.preventDefault()">Privacy Policy</a>.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .signup-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--bg-primary);
      padding: 24px;
    }

    .signup-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 40px;
      width: 100%;
      max-width: 460px;
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .brand-header {
      text-align: center;
      margin-bottom: 24px;
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

    .signin-prompt {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 24px;
    }

    .signin-link {
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .signin-link:hover {
      color: var(--primary-hover);
    }

    .terms-notice {
      text-align: center;
      font-size: 11px;
      color: var(--text-light);
      margin-top: 24px;
      line-height: 1.5;
    }

    .terms-notice a {
      color: var(--text-secondary);
      text-decoration: underline;
    }

    .terms-notice a:hover {
      color: var(--primary);
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
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    country: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    incomeBracket: new FormControl('', { nonNullable: true })
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    const values = this.signupForm.getRawValue();
    const result = this.authService.signup({
      username: values.username,
      password: values.password,
      name: values.fullName,
      email: values.email,
      country: values.country,
      income_bracket: values.incomeBracket || undefined
    });

    if (result.success) {
      this.errorMessage.set(null);
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error || 'Signup failed');
    }
  }
}
