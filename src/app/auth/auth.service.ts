import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../shared/storage.service';
import { User } from '../transactions/transaction.model';
import { DEMO_USER } from '../mock-data/seed-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'taxpal_users';
  private readonly CURRENT_USER_KEY = 'taxpal_current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.initializeUsers();
    const savedUser = this.storageService.getItem<User>(this.CURRENT_USER_KEY);
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
    }
  }

  private initializeUsers(): void {
    let users = this.storageService.getItem<User[]>(this.USERS_KEY);

    // Reset if storage has incompatible structures
    if (users && (!Array.isArray(users) || users.some(u => !u || !u.username))) {
      this.storageService.removeItem(this.USERS_KEY);
      this.storageService.removeItem(this.CURRENT_USER_KEY);
      users = null;
    }

    if (!users || users.length === 0) {
      this.storageService.setItem(this.USERS_KEY, [DEMO_USER]);
    }
  }

  getUsers(): User[] {
    return this.storageService.getItem<User[]>(this.USERS_KEY) || [];
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const user = users.find(
      u => u && u.username && u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'User does not exist' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    // Login successful
    const { password: _, ...userWithoutPassword } = user;
    this.storageService.setItem(this.CURRENT_USER_KEY, userWithoutPassword);
    this.currentUserSubject.next(userWithoutPassword);
    return { success: true };
  }

  signup(user: Omit<User, 'id'>): { success: boolean; error?: string } {
    const users = this.getUsers();

    if (users.some(u => u && u.username && u.username.toLowerCase() === user.username.trim().toLowerCase())) {
      return { success: false, error: 'Username is already taken' };
    }

    if (users.some(u => u && u.email && u.email.toLowerCase() === user.email.trim().toLowerCase())) {
      return { success: false, error: 'Email is already registered' };
    }

    const newUser: User = {
      ...user,
      username: user.username.trim(),
      email: user.email.trim(),
      id: 'user_' + Math.random().toString(36).substring(2, 11)
    };

    users.push(newUser);
    this.storageService.setItem(this.USERS_KEY, users);

    // Auto-login after registration
    const { password: _, ...userWithoutPassword } = newUser;
    this.storageService.setItem(this.CURRENT_USER_KEY, userWithoutPassword);
    this.currentUserSubject.next(userWithoutPassword);

    return { success: true };
  }

  logout(): void {
    this.storageService.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
