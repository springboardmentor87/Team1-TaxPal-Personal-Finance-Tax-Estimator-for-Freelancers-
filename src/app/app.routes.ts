import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login';
import { SignupComponent } from './auth/signup';
import { DashboardComponent } from './dashboard/dashboard';
import { TransactionListComponent } from './transactions/transaction-list';
import { ComingSoonComponent } from './shared/coming-soon';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionListComponent, canActivate: [authGuard] },
  { path: 'coming-soon', component: ComingSoonComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
