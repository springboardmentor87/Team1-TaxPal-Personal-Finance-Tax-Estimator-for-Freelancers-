import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Transaction } from './transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly API_URL = 'http://localhost:5000/api/transactions';

  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$: Observable<Transaction[]> = this.transactionsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadTransactions();
      } else {
        this.transactionsSubject.next([]);
      }
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  public loadTransactions(): void {
    const headers = this.getAuthHeaders();
    this.http.get<{ success: boolean; data: any[] }>(`${this.API_URL}/get`, { headers }).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          const mapped: Transaction[] = res.data.map(item => ({
            id: item.id ? item.id.toString() : '',
            user_id: item.user_id ? item.user_id.toString() : '',
            description: item.title || item.description || '',
            amount: Number(item.amount),
            type: (item.type || '').toLowerCase() as 'income' | 'expense',
            category: item.category,
            date: item.transaction_date || item.date
          }));
          this.transactionsSubject.next(mapped);
        }
      },
      error: (err) => {
        console.error('Failed to fetch transactions from backend:', err);
      }
    });
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'user_id'>): void {
    const headers = this.getAuthHeaders();
    const payload = {
      title: transaction.description || transaction.category || 'Transaction',
      amount: transaction.amount,
      type: transaction.type === 'income' ? 'Income' : 'Expense',
      category: transaction.category,
      transaction_date: transaction.date
    };

    this.http.post<{ success: boolean }>(`${this.API_URL}/add`, payload, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadTransactions();
        }
      },
      error: (err) => {
        console.error('Failed to add transaction to backend:', err);
      }
    });
  }

  deleteTransaction(id: string): void {
    // Optimistic UI update or refresh after deletion
    const current = this.transactionsSubject.value.filter(t => t.id !== id);
    this.transactionsSubject.next(current);
  }
}
