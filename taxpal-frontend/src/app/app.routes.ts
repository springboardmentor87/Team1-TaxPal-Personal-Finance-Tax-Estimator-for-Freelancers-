import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login';
import { SignupComponent } from './auth/signup';
import { DashboardComponent } from './dashboard/dashboard';
import { TransactionListComponent } from './transactions/transaction-list';
import { BudgetListComponent } from './budgets/budget-list';
import { CategoryListComponent } from './categories/category-list';
import { TaxEstimatorComponent } from './tax-estimator/tax-estimator';
import { ComingSoonComponent } from './shared/coming-soon';
import { TaxEstimatorComponent } from './tax-estimator/tax-estimator';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionListComponent, canActivate: [authGuard] },
  { path: 'budgets', component: BudgetListComponent, canActivate: [authGuard] },
  { path: 'categories', component: CategoryListComponent, canActivate: [authGuard] },
  { path: 'tax-estimator', component: TaxEstimatorComponent, canActivate: [authGuard] },
  { path: 'coming-soon', component: ComingSoonComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

