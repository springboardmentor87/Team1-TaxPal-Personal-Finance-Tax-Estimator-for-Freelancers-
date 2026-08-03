import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, catchError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../shared/storage.service';
import { User } from '../transactions/transaction.model';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5000/api/auth';
  private readonly TOKEN_KEY = 'taxpal_auth_token';
  private readonly CURRENT_USER_KEY = 'taxpal_current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    const savedUser = this.storageService.getItem<User>(this.CURRENT_USER_KEY);
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
    }
  }

  getToken(): string | null {
    return this.storageService.getItem<string>(this.TOKEN_KEY);
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<{ success: boolean; error?: string }> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      map(res => {
        if (res.token && res.user) {
          this.storageService.setItem(this.TOKEN_KEY, res.token);
          this.storageService.setItem(this.CURRENT_USER_KEY, res.user);
          this.currentUserSubject.next(res.user);
          return { success: true };
        }
        return { success: false, error: res.message || 'Login failed' };
      }),
      catchError(err => {
        const errorMsg = err.error?.message || err.message || 'Login failed';
        return of({ success: false, error: errorMsg });
      })
    );
  }

  signup(userData: {
    name: string;
    email: string;
    password: string;
    country: string;
    income_bracket: string;
    username?: string;
  }): Observable<{ success: boolean; error?: string }> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      country: userData.country,
      income_bracket: userData.income_bracket || 'Default'
    }).pipe(
      map(res => {
        if (res.success) {
          return { success: true };
        }
        return { success: false, error: res.message || 'Registration failed' };
      }),
      catchError(err => {
        const errorMsg = err.error?.message || err.message || 'Registration failed';
        return of({ success: false, error: errorMsg });
      })
    );
  }

  logout(): void {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null && !!this.getToken();
  }
}
