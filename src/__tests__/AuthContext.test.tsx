import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the api module
vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
}));

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

const mockAuthApi = vi.mocked(authApi);

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(),
  get length() { return Object.keys(this.store).length; },
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.location
const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLocalStorage.store = {};
  mockLocation.href = '';
});

describe('AuthContext', () => {
  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });

  describe('initial state', () => {
    it('starts with no user and isLoading true when no token', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('fetches user on mount when token exists', async () => {
      mockLocalStorage.store['token'] = 'existing-token';
      mockAuthApi.me.mockResolvedValueOnce({
        success: true,
        user: { id: '1', email: 'test@test.com', fullName: 'Test User', role: 'ANALYST', createdAt: '2024-01-01' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual({
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'ANALYST',
        createdAt: '2024-01-01',
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('clears invalid token on mount when me() fails', async () => {
      mockLocalStorage.store['token'] = 'bad-token';
      mockAuthApi.me.mockRejectedValueOnce(new Error('Invalid token'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('login', () => {
    it('stores token and sets user on successful login', async () => {
      mockAuthApi.login.mockResolvedValueOnce({
        success: true,
        token: 'new-token',
        user: { id: '2', email: 'user@test.com', fullName: 'User', role: 'ADMIN' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('user@test.com', 'password123');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
      expect(result.current.user).toEqual({
        id: '2',
        email: 'user@test.com',
        fullName: 'User',
        role: 'ADMIN',
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('propagates error on failed login', async () => {
      mockAuthApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('bad@test.com', 'wrong');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
    });
  });

  describe('register', () => {
    it('stores token and sets user on successful register', async () => {
      mockAuthApi.register.mockResolvedValueOnce({
        success: true,
        token: 'reg-token',
        user: { id: '3', email: 'new@test.com', fullName: 'New User', role: 'ANALYST' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register('new@test.com', 'password123', 'New User', 'ANALYST');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'reg-token');
      expect(result.current.user).toEqual({
        id: '3',
        email: 'new@test.com',
        fullName: 'New User',
        role: 'ANALYST',
      });
    });
  });

  describe('logout', () => {
    it('clears token, user and redirects to login', async () => {
      mockAuthApi.login.mockResolvedValueOnce({
        success: true,
        token: 'token',
        user: { id: '1', email: 'user@test.com', fullName: 'User', role: 'ADMIN' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('user@test.com', 'password123');
      });

      act(() => {
        result.current.logout();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockLocation.href).toBe('/login');
    });
  });
});
