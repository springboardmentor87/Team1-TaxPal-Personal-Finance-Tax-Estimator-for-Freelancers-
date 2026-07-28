import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../shared/storage.service';
import { AuthService } from '../auth/auth.service';
import { Transaction } from './transaction.model';
import { generateMockTransactions } from '../mock-data/seed-data';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly TRANSACTIONS_KEY = 'taxpal_transactions';

  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$: Observable<Transaction[]> = this.transactionsSubject.asObservable();

  private currentUserId: string | null = null;

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {
    // Listen to current user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadTransactions();
      } else {
        this.currentUserId = null;
        this.transactionsSubject.next([]);
      }
    });
  }

  private loadTransactions(): void {
    if (!this.currentUserId) return;

    let allTransactions = this.storageService.getItem<Transaction[]>(this.TRANSACTIONS_KEY) || [];

    // If it's the demo user and there are no transactions, seed mock data
    if (this.currentUserId === 'user_demo') {
      const demoTxs = allTransactions.filter(t => t.user_id === 'user_demo');
      if (demoTxs.length === 0) {
        const seeded = generateMockTransactions('user_demo');
        allTransactions = [...allTransactions, ...seeded];
        this.storageService.setItem(this.TRANSACTIONS_KEY, allTransactions);
      }
    }

    const userTransactions = allTransactions.filter(t => t.user_id === this.currentUserId);
    // Sort transactions by date descending
    userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.transactionsSubject.next(userTransactions);
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'user_id'>): void {
    if (!this.currentUserId) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: 'tx_' + Math.random().toString(36).substring(2, 11),
      user_id: this.currentUserId
    };

    const allTransactions = this.storageService.getItem<Transaction[]>(this.TRANSACTIONS_KEY) || [];
    allTransactions.push(newTransaction);
    this.storageService.setItem(this.TRANSACTIONS_KEY, allTransactions);

    this.loadTransactions();
  }

  deleteTransaction(id: string): void {
    if (!this.currentUserId) return;

    let allTransactions = this.storageService.getItem<Transaction[]>(this.TRANSACTIONS_KEY) || [];
    allTransactions = allTransactions.filter(t => t.id !== id);
    this.storageService.setItem(this.TRANSACTIONS_KEY, allTransactions);

    this.loadTransactions();
  }
}
