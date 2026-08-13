import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface CategoryItem {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  description?: string;
  isCustom?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private defaultExpenseCategories: CategoryItem[] = [
    { id: 'cat-1', name: 'Business Expenses', type: 'expense', color: '#ef4444', description: 'Operational business expenses' },
    { id: 'cat-2', name: 'Office Rent', type: 'expense', color: '#3b82f6', description: 'Office space and rent' },
    { id: 'cat-3', name: 'Software Subscriptions', type: 'expense', color: '#8b5cf6', description: 'Software and SaaS subscriptions' },
    { id: 'cat-4', name: 'Professional Development', type: 'expense', color: '#10b981', description: 'Courses, books, and training' },
    { id: 'cat-5', name: 'Marketing', type: 'expense', color: '#f59e0b', description: 'Advertising and promotions' },
    { id: 'cat-6', name: 'Travel', type: 'expense', color: '#ec4899', description: 'Travel, flights, and hotels' },
    { id: 'cat-7', name: 'Meals & Entertainment', type: 'expense', color: '#14b8a6', description: 'Client meals and dining' },
    { id: 'cat-8', name: 'Utilities', type: 'expense', color: '#0ea5e9', description: 'Internet, phone, and power' },
    { id: 'cat-9', name: 'Rent/Mortgage', type: 'expense', color: '#f97316', description: 'Property rent' },
    { id: 'cat-10', name: 'Food', type: 'expense', color: '#64748b', description: 'Groceries and food' },
    { id: 'cat-11', name: 'Other', type: 'expense', color: '#94a3b8', description: 'Other expenses' }
  ];

  private defaultIncomeCategories: CategoryItem[] = [
    { id: 'cat-inc-1', name: 'Consulting', type: 'income', color: '#10b981', description: 'Client consulting' },
    { id: 'cat-inc-2', name: 'Web Design', type: 'income', color: '#0ea5e9', description: 'Design and development services' },
    { id: 'cat-inc-3', name: 'Product Sales', type: 'income', color: '#8b5cf6', description: 'Digital product sales' },
    { id: 'cat-inc-4', name: 'Royalties', type: 'income', color: '#f59e0b', description: 'Affiliate income and royalties' },
    { id: 'cat-inc-5', name: 'Other', type: 'income', color: '#64748b', description: 'Other income' }
  ];

  private categoriesSubject = new BehaviorSubject<CategoryItem[]>([]);
  public categories$: Observable<CategoryItem[]> = this.categoriesSubject.asObservable();

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.loadCategoriesForUser(user?.id);
    });
  }

  private getStorageKey(userId?: string | number): string {
    const id = userId || this.authService.getCurrentUserValue()?.id || 'guest';
    return `taxpal_categories_user_${id}`;
  }

  private loadCategoriesForUser(userId?: string | number): void {
    const key = this.getStorageKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.categoriesSubject.next(parsed);
        return;
      } catch (e) {
        console.error('Error reading saved categories:', e);
      }
    }
    const initial = [...this.defaultExpenseCategories, ...this.defaultIncomeCategories];
    this.saveCategories(initial);
  }

  private saveCategories(categories: CategoryItem[]): void {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(categories));
    this.categoriesSubject.next(categories);
  }

  public getCategoriesByType(type: 'income' | 'expense'): CategoryItem[] {
    return this.categoriesSubject.value.filter(c => c.type === type);
  }

  public addCategory(name: string, type: 'income' | 'expense', color: string, description?: string): CategoryItem {
    const current = this.categoriesSubject.value;
    const newCategory: CategoryItem = {
      id: `cat-custom-${Date.now()}`,
      name: name.trim(),
      type,
      color: color || '#0ea5e9',
      description: description || '',
      isCustom: true
    };
    const updated = [...current, newCategory];
    this.saveCategories(updated);
    return newCategory;
  }

  public updateCategory(id: string, name: string, color: string, description?: string): void {
    const current = this.categoriesSubject.value;
    const updated = current.map(c => c.id === id ? { ...c, name: name.trim(), color, description } : c);
    this.saveCategories(updated);
  }

  public ensureCategoryExists(name: string, type: 'income' | 'expense' = 'expense'): void {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const current = this.categoriesSubject.value;
    const exists = current.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      this.addCategory(trimmed, type, '#3b82f6', `${trimmed} category`);
    }
  }

  public deleteCategory(id: string): void {
    const current = this.categoriesSubject.value;
    const updated = current.filter(c => c.id !== id);
    this.saveCategories(updated);
  }

  /**
   * Auto-suggests category based on transaction description keywords
   */
  public suggestCategory(description: string, type: 'income' | 'expense' = 'expense'): string {
    if (!description || !description.trim()) return '';

    const text = description.toLowerCase().trim();

    if (type === 'income') {
      if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('figma')) return 'Web Design';
      if (text.includes('consult') || text.includes('advisory') || text.includes('client')) return 'Consulting';
      if (text.includes('sale') || text.includes('course') || text.includes('template')) return 'Product Sales';
      if (text.includes('affiliate') || text.includes('royalty')) return 'Royalties';
      return 'Consulting';
    }

    if (text.includes('rent') || text.includes('mortgage') || text.includes('lease')) {
      if (text.includes('office') || text.includes('wework') || text.includes('desk')) return 'Office Rent';
      return 'Rent/Mortgage';
    }
    if (text.includes('software') || text.includes('saas') || text.includes('aws') || text.includes('github') || text.includes('adobe') || text.includes('hostinger') || text.includes('domain') || text.includes('hosting')) {
      return 'Software Subscriptions';
    }
    if (text.includes('travel') || text.includes('uber') || text.includes('flight') || text.includes('cab') || text.includes('hotel') || text.includes('taxi')) {
      return 'Travel';
    }
    if (text.includes('meal') || text.includes('coffee') || text.includes('starbucks') || text.includes('swiggy') || text.includes('zomato') || text.includes('dinner') || text.includes('lunch')) {
      return 'Meals & Entertainment';
    }
    if (text.includes('marketing') || text.includes('ad') || text.includes('google ads') || text.includes('facebook ads') || text.includes('seo')) {
      return 'Marketing';
    }
    if (text.includes('utility') || text.includes('electric') || text.includes('internet') || text.includes('wifi') || text.includes('phone')) {
      return 'Utilities';
    }
    if (text.includes('course') || text.includes('udemy') || text.includes('book') || text.includes('training') || text.includes('conference')) {
      return 'Professional Development';
    }
    if (text.includes('grocery') || text.includes('food') || text.includes('supermarket')) {
      return 'Food';
    }

    return 'Business Expenses';
  }
}
