// @vitest-environment jsdom
import { StorageService } from '../shared/storage.service';
import { AuthService } from './auth.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AuthService', () => {
  let storageService: StorageService;
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
    service = new AuthService(storageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login demo user successfully', () => {
    const res = service.login('demo', 'password');
    expect(res.success).toBe(true);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should reject invalid credentials', () => {
    const res = service.login('demo', 'wrongpass');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Incorrect password');
  });

  it('should signup a new user successfully', () => {
    const res = service.signup({
      username: 'testuser',
      password: 'password123',
      name: 'Test User',
      email: 'test@example.com',
      country: 'India',
      incomeBracket: '50k-100k'
    });
    expect(res.success).toBe(true);
    expect(service.isLoggedIn()).toBe(true);
  });
});
