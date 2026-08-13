import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionService } from '../transactions/transaction.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // Format: 'YYYY-MM'
  description?: string;
  createdAt: string;
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'Good' | 'Warning' | 'Exceeded';
  statusColor: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  healthStatus: 'Good' | 'Warning' | 'Critical';
  healthColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  public budgets$: Observable<Budget[]> = this.budgetsSubject.asObservable();

  private apiUrl = 'http://localhost:8080/api/budgets';

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Clear legacy mock sample budgets from browser storage
    localStorage.removeItem('taxpal_budgets');

    this.authService.currentUser$.subscribe(user => {
      this.loadBudgetsForUser(user?.id);
    });
  }

  private getStorageKey(userId?: string | number): string {
    const id = userId || this.authService.getCurrentUserValue()?.id || 'guest';
    return `taxpal_budgets_user_${id}`;
  }

  private loadBudgetsForUser(userId?: string | number): void {
    const storageKey = this.getStorageKey(userId);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.budgetsSubject.next(parsed);
        return;
      } catch (e) {
        console.error('Error reading saved user budgets:', e);
      }
    }

    // Default for any user is EMPTY ([]) so no pre-filled sample data exists
    this.budgetsSubject.next([]);
  }

  private saveBudgets(budgets: Budget[]): void {
    const storageKey = this.getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(budgets));
    this.budgetsSubject.next(budgets);
  }

  public getBudgetsByMonth(targetMonth: string): Observable<BudgetProgress[]> {
    return combineLatest([this.budgets$, this.transactionService.transactions$]).pipe(
      map(([budgets, transactions]) => {
        const monthBudgets = budgets.filter(b => b.month === targetMonth);
        
        return monthBudgets.map(b => {
          // Calculate spent in target month for this expense category
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(targetMonth))
            .reduce((sum, t) => sum + t.amount, 0);

          const remaining = Math.max(0, b.limit - spent);
          const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;

          let status: 'Good' | 'Warning' | 'Exceeded' = 'Good';
          let statusColor = '#10b981'; // Green

          if (percentage >= 100) {
            status = 'Exceeded';
            statusColor = '#ef4444'; // Red
          } else if (percentage >= 80) {
            status = 'Warning';
            statusColor = '#f59e0b'; // Yellow/Orange
          }

          return {
            ...b,
            spent,
            remaining,
            percentage,
            status,
            statusColor
          };
        });
      })
    );
  }

  public getBudgetSummary(targetMonth: string): Observable<BudgetSummary> {
    return this.getBudgetsByMonth(targetMonth).pipe(
      map(progressList => {
        if (progressList.length === 0) {
          return {
            totalBudget: 0,
            totalSpent: 0,
            remaining: 0,
            healthStatus: 'Good',
            healthColor: '#10b981'
          };
        }

        const totalBudget = progressList.reduce((sum, b) => sum + b.limit, 0);
        const totalSpent = progressList.reduce((sum, b) => sum + b.spent, 0);
        const remaining = totalBudget - totalSpent;

        const exceededCount = progressList.filter(b => b.status === 'Exceeded').length;
        const warningCount = progressList.filter(b => b.status === 'Warning').length;

        let healthStatus: 'Good' | 'Warning' | 'Critical' = 'Good';
        let healthColor = '#10b981';

        if (exceededCount > 0) {
          healthStatus = 'Critical';
          healthColor = '#ef4444';
        } else if (warningCount > 0) {
          healthStatus = 'Warning';
          healthColor = '#f59e0b';
        }

        return {
          totalBudget,
          totalSpent,
          remaining,
          healthStatus,
          healthColor
        };
      })
    );
  }

  public addBudget(budgetData: Omit<Budget, 'id' | 'createdAt'>): Budget {
    const current = this.budgetsSubject.value;
    const newBudget: Budget = {
      ...budgetData,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updated = [...current, newBudget];
    this.saveBudgets(updated);
    return newBudget;
  }

  public updateBudget(id: string, newLimit: number, description?: string): void {
    const current = this.budgetsSubject.value;
    const updated = current.map(b => b.id === id ? { ...b, limit: newLimit, description: description !== undefined ? description : b.description } : b);
    this.saveBudgets(updated);
  }

  public deleteBudget(id: string): void {
    const current = this.budgetsSubject.value;
    const updated = current.filter(b => b.id !== id);
    this.saveBudgets(updated);
  }
}
