import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TransactionService } from '../transactions/transaction.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CategoryService } from '../categories/category.service';

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

  private apiUrl = 'http://localhost:8080/api/budget';

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private http: HttpClient
  ) {
    // Clear legacy mock sample budgets from browser storage
    localStorage.removeItem('taxpal_budgets');

    this.authService.currentUser$.subscribe(user => {
      this.loadBudgetsForUser(user?.id);
    });

    // Auto-clean budgets when categories are deleted in Category Management
    this.categoryService.categories$.subscribe(categories => {
      if (categories && categories.length > 0) {
        const categoryNames = new Set(categories.map(c => c.name.toLowerCase()));
        const currentBudgets = this.budgetsSubject.value;
        const orphaned = currentBudgets.filter(b => !categoryNames.has(b.category.toLowerCase()));
        if (orphaned.length > 0) {
          orphaned.forEach(b => this.deleteBudget(b.id));
        }
      }
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private getStorageKey(userId?: string | number): string {
    const id = userId || this.authService.getCurrentUserValue()?.id || 'guest';
    return `taxpal_budgets_user_${id}`;
  }

  public loadBudgetsForUser(userId?: string | number): void {
    const token = this.authService.getToken();
    if (token) {
      const headers = this.getAuthHeaders();
      this.http.get<{ success: boolean; data: any[] }>(this.apiUrl, { headers }).subscribe({
        next: (res) => {
          if (res.success && Array.isArray(res.data)) {
            const mapped: Budget[] = res.data.map(item => ({
              id: item.id ? item.id.toString() : '',
              category: item.category,
              limit: Number(item.budget_limit || item.limit || 0),
              month: item.month ? item.month.substring(0, 7) : new Date().toISOString().substring(0, 7),
              description: item.description || '',
              createdAt: item.created_at || new Date().toISOString()
            }));
            this.budgetsSubject.next(mapped);
            return;
          }
          this.loadFromLocalStorage(userId);
        },
        error: () => {
          this.loadFromLocalStorage(userId);
        }
      });
    } else {
      this.loadFromLocalStorage(userId);
    }
  }

  private loadFromLocalStorage(userId?: string | number): void {
    const storageKey = this.getStorageKey(userId);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        this.budgetsSubject.next(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error reading saved user budgets:', e);
      }
    }
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
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(targetMonth))
            .reduce((sum, t) => sum + t.amount, 0);

          const remaining = Math.max(0, b.limit - spent);
          const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;

          let status: 'Good' | 'Warning' | 'Exceeded' = 'Good';
          let statusColor = '#10b981';

          if (percentage >= 100) {
            status = 'Exceeded';
            statusColor = '#ef4444';
          } else if (percentage >= 80) {
            status = 'Warning';
            statusColor = '#f59e0b';
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
    // Ensure category exists in Category Management
    if (budgetData.category) {
      this.categoryService.ensureCategoryExists(budgetData.category, 'expense');
    }

    const current = this.budgetsSubject.value;
    const newBudget: Budget = {
      ...budgetData,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const token = this.authService.getToken();
    if (token) {
      const headers = this.getAuthHeaders();
      const payload = {
        category: budgetData.category,
        budget_limit: budgetData.limit,
        month: `${budgetData.month}-01`,
        description: budgetData.description
      };
      this.http.post<{ success: boolean }>(this.apiUrl, payload, { headers }).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadBudgetsForUser();
          }
        },
        error: (err) => {
          console.error('Failed to add budget to backend:', err);
        }
      });
    }

    const updated = [...current, newBudget];
    this.saveBudgets(updated);
    return newBudget;
  }

  public updateBudget(id: string, newLimit: number, description?: string): void {
    const current = this.budgetsSubject.value;
    const target = current.find(b => b.id === id);

    const token = this.authService.getToken();
    if (token && target) {
      const headers = this.getAuthHeaders();
      const payload = {
        category: target.category,
        budget_limit: newLimit,
        month: `${target.month}-01`,
        description: description !== undefined ? description : target.description
      };
      this.http.put<{ success: boolean }>(`${this.apiUrl}/${id}`, payload, { headers }).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadBudgetsForUser();
          }
        },
        error: (err) => console.error('Failed to update budget on backend:', err)
      });
    }

    const updated = current.map(b => b.id === id ? { ...b, limit: newLimit, description: description !== undefined ? description : b.description } : b);
    this.saveBudgets(updated);
  }

  public deleteBudget(id: string): void {
    const token = this.authService.getToken();
    if (token) {
      const headers = this.getAuthHeaders();
      this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`, { headers }).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadBudgetsForUser();
          }
        },
        error: (err) => console.error('Failed to delete budget on backend:', err)
      });
    }

    const current = this.budgetsSubject.value;
    const updated = current.filter(b => b.id !== id);
    this.saveBudgets(updated);
  }
}

