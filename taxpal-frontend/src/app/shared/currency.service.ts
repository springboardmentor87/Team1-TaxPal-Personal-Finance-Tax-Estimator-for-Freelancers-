import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CurrencyConfig {
  country: string;
  code: string;
  symbol: string;
}

export const COUNTRY_CURRENCY_MAP: { [country: string]: { code: string; symbol: string } } = {
  'India': { code: 'INR', symbol: '₹' },
  'United States': { code: 'USD', symbol: '$' },
  'United Kingdom': { code: 'GBP', symbol: '£' },
  'Canada': { code: 'CAD', symbol: '$' },
  'Australia': { code: 'AUD', symbol: '$' },
  'Germany': { code: 'EUR', symbol: '€' },
  'France': { code: 'EUR', symbol: '€' },
  'Japan': { code: 'JPY', symbol: '¥' }
};

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly STORAGE_KEY = 'taxpal_user_currency';

  private currencyConfigSubject = new BehaviorSubject<CurrencyConfig>({
    country: 'India',
    code: 'INR',
    symbol: '₹'
  });

  public currencyConfig$: Observable<CurrencyConfig> = this.currencyConfigSubject.asObservable();
  public symbol$: Observable<string> = this.currencyConfig$.pipe(map(c => c.symbol));

  constructor() {
    this.loadCurrency();
  }

  private loadCurrency(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        this.currencyConfigSubject.next(config);
        return;
      } catch (e) {
        console.error('Error loading currency:', e);
      }
    }
  }

  public setCountry(country: string): void {
    const mapping = COUNTRY_CURRENCY_MAP[country] || { code: 'INR', symbol: '₹' };
    const config: CurrencyConfig = {
      country,
      code: mapping.code,
      symbol: mapping.symbol
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    this.currencyConfigSubject.next(config);
  }

  public get currentSymbol(): string {
    return this.currencyConfigSubject.value.symbol;
  }

  public get currentCode(): string {
    return this.currencyConfigSubject.value.code;
  }

  public get currentCountry(): string {
    return this.currencyConfigSubject.value.country;
  }
}
