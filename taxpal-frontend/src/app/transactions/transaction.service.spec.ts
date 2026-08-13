// @vitest-environment jsdom
import { StorageService } from '../shared/storage.service';
import { AuthService } from '../auth/auth.service';
import { TransactionService } from './transaction.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('TransactionService', () => {
  let storageService: StorageService;
  let authService: AuthService;
  let transactionService: TransactionService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
    authService = new AuthService(storageService);
    transactionService = new TransactionService(storageService, authService);
  });

  it('should be created', () => {
    expect(transactionService).toBeTruthy();
  });

  it('should add income and expense transactions for logged in user', () => {
    authService.login('demo', 'password');

    transactionService.addTransaction({
      description: 'Web Design Project',
      amount: 15000,
      type: 'income',
      category: 'Consulting',
      date: '2026-08-01',
      notes: 'Client milestone payment'
    });

    let currentTxs = [];
    transactionService.transactions$.subscribe(txs => currentTxs = txs);

    expect(currentTxs.length).toBeGreaterThan(0);
    const added = currentTxs.find((t: any) => t.description === 'Web Design Project');
    expect(added).toBeTruthy();
    expect(added?.amount).toBe(15000);
  });

  it('should delete transaction correctly', () => {
    authService.login('demo', 'password');

    let currentTxs: any[] = [];
    transactionService.transactions$.subscribe(txs => currentTxs = txs);
    const initialCount = currentTxs.length;

    if (initialCount > 0) {
      const targetId = currentTxs[0].id;
      transactionService.deleteTransaction(targetId);
      expect(currentTxs.length).toBe(initialCount - 1);
    }
  });
});
