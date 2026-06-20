import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock import.meta.env before importing api
vi.stubGlobal('import', { meta: { env: { PROD: false } } });

// We need to mock fetch and localStorage
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
  get length() { return Object.keys(this.store).length; },
  key: vi.fn(),
};
vi.stubGlobal('localStorage', mockLocalStorage);

// Dynamic import after mocks are set up
let api: Awaited<typeof import('@/lib/api')>['api'];
let authApi: Awaited<typeof import('@/lib/api')>['authApi'];

beforeEach(async () => {
  vi.resetModules();
  mockLocalStorage.store = {};
  mockFetch.mockReset();

  const module = await import('@/lib/api');
  api = module.api;
  authApi = module.authApi;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ApiClient', () => {
  it('makes a GET request with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });

    const result = await api.get('/test');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/test',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual({ data: 'test' });
  });

  it('makes a POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const result = await api.post('/test', { key: 'value' });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      })
    );
    expect(result).toEqual({ success: true });
  });

  it('includes Authorization header when token exists', async () => {
    mockLocalStorage.store['token'] = 'my-jwt-token';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'protected' }),
    });

    await api.get('/protected');
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers['Authorization']).toBe('Bearer my-jwt-token');
  });

  it('does not include Authorization header when no token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'public' }),
    });

    await api.get('/public');
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers['Authorization']).toBeUndefined();
  });

  it('throws error on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    await expect(api.get('/protected')).rejects.toThrow('Unauthorized');
  });

  it('throws generic HTTP error when no error message in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve(null),
    });

    await expect(api.get('/error')).rejects.toThrow('HTTP 500');
  });

  it('handles json parse failure gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('invalid json')),
    });

    await expect(api.get('/bad-json')).rejects.toThrow('HTTP 500');
  });
});

describe('authApi', () => {
  it('calls register endpoint with correct data', async () => {
    const mockResponse = {
      success: true,
      token: 'new-token',
      user: { id: '1', email: 'test@test.com', fullName: 'Test User', role: 'ANALYST' },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await authApi.register({
      email: 'test@test.com',
      password: 'password123',
      fullName: 'Test User',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123',
          fullName: 'Test User',
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('calls login endpoint with correct data', async () => {
    const mockResponse = {
      success: true,
      token: 'token-123',
      user: { id: '1', email: 'test@test.com', fullName: 'Test User', role: 'ANALYST' },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await authApi.login({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123',
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('calls me endpoint', async () => {
    mockLocalStorage.store['token'] = 'my-token';

    const mockResponse = {
      success: true,
      user: { id: '1', email: 'test@test.com', fullName: 'Test User', role: 'ANALYST', createdAt: '2024-01-01' },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await authApi.me();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/me',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockResponse);
  });
});
