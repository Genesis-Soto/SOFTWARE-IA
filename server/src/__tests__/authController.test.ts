import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database
interface MockUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}
const mockUsers: MockUser[] = [];
vi.mock('../config/database', () => ({
  db: {
    users: {
      findByEmail: vi.fn((email: string) => mockUsers.find(u => u.email === email)),
      findById: vi.fn((id: string) => mockUsers.find(u => u.id === id)),
      create: vi.fn((user: Omit<MockUser, 'created_at' | 'updated_at'>) => {
        const newUser: MockUser = { id: 'generated-id', ...user, created_at: '2024-01-01', updated_at: '2024-01-01' };
        mockUsers.push(newUser);
        return newUser;
      }),
    },
  },
}));

vi.mock('../config/env', () => ({
  ENV: {
    JWT_SECRET: 'test-secret',
    PORT: '4000',
    NODE_ENV: 'test',
  },
}));

import { register, login, getMe } from '../controllers/authController';

function createMockRes() {
  const res = {
    statusCode: 200,
    jsonData: null as Record<string, unknown> | null,
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  }) as unknown as typeof res.status;
  res.json = vi.fn((data: Record<string, unknown>) => {
    res.jsonData = data;
    return res;
  }) as unknown as typeof res.json;
  return res;
}

beforeEach(() => {
  mockUsers.length = 0;
  vi.clearAllMocks();
});

describe('register controller', () => {
  it('returns 400 when email is missing', async () => {
    const req = { body: { password: 'password123', fullName: 'Test' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect((res.jsonData as Record<string, string>).error).toBe('Email, password and full name are required');
  });

  it('returns 400 when password is missing', async () => {
    const req = { body: { email: 'test@test.com', fullName: 'Test' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect((res.jsonData as Record<string, string>).error).toBe('Email, password and full name are required');
  });

  it('returns 400 when fullName is missing', async () => {
    const req = { body: { email: 'test@test.com', password: 'password123' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect((res.jsonData as Record<string, string>).error).toBe('Email, password and full name are required');
  });

  it('returns 400 when password is too short', async () => {
    const req = { body: { email: 'test@test.com', password: '12345', fullName: 'Test' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect((res.jsonData as Record<string, string>).error).toBe('Password must be at least 6 characters');
  });

  it('returns 409 when email already exists', async () => {
    mockUsers.push({ id: '1', email: 'existing@test.com', password_hash: 'hash', full_name: 'Existing', role: 'ANALYST' });

    const req = { body: { email: 'existing@test.com', password: 'password123', fullName: 'Test' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    expect(res.status).toHaveBeenCalledWith(409);
    expect((res.jsonData as Record<string, string>).error).toBe('Email already registered');
  });

  it('creates user and returns token on success', async () => {
    const req = { body: { email: 'new@test.com', password: 'password123', fullName: 'New User' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.jsonData as Record<string, unknown>;
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect((data.user as Record<string, string>).email).toBe('new@test.com');
    expect((data.user as Record<string, string>).fullName).toBe('New User');
    expect((data.user as Record<string, string>).role).toBe('ANALYST');
  });

  it('defaults role to ANALYST when not specified', async () => {
    const req = { body: { email: 'user@test.com', password: 'password123', fullName: 'User' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    const data = res.jsonData as Record<string, unknown>;
    expect((data.user as Record<string, string>).role).toBe('ANALYST');
  });

  it('uppercases the provided role', async () => {
    const req = { body: { email: 'admin@test.com', password: 'password123', fullName: 'Admin', role: 'admin' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    const data = res.jsonData as Record<string, unknown>;
    expect((data.user as Record<string, string>).role).toBe('ADMIN');
  });

  it('returns a valid JWT token', async () => {
    const req = { body: { email: 'jwt@test.com', password: 'password123', fullName: 'JWT User' } } as unknown as Parameters<typeof register>[0];
    const res = createMockRes();

    await register(req, res as unknown as Parameters<typeof register>[1]);

    const data = res.jsonData as Record<string, unknown>;
    const decoded = jwt.verify(data.token as string, 'test-secret') as Record<string, string>;
    expect(decoded.email).toBe('jwt@test.com');
  });
});

describe('login controller', () => {
  beforeEach(async () => {
    const hash = await bcrypt.hash('password123', 12);
    mockUsers.push({
      id: 'user-1',
      email: 'user@test.com',
      password_hash: hash,
      full_name: 'Test User',
      role: 'ANALYST',
    });
  });

  it('returns 400 when email is missing', async () => {
    const req = { body: { password: 'password123' } } as unknown as Parameters<typeof login>[0];
    const res = createMockRes();

    await login(req, res as unknown as Parameters<typeof login>[1]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect((res.jsonData as Record<string, string>).error).toBe('Email and password are required');
  });

  it('returns 400 when password is missing', async () => {
    const req = { body: { email: 'user@test.com' } } as unknown as Parameters<typeof login>[0];
    const res = createMockRes();

    await login(req, res as unknown as Parameters<typeof login>[1]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect((res.jsonData as Record<string, string>).error).toBe('Email and password are required');
  });

  it('returns 401 when email not found', async () => {
    const req = { body: { email: 'notfound@test.com', password: 'password123' } } as unknown as Parameters<typeof login>[0];
    const res = createMockRes();

    await login(req, res as unknown as Parameters<typeof login>[1]);

    expect(res.status).toHaveBeenCalledWith(401);
    expect((res.jsonData as Record<string, string>).error).toBe('Invalid credentials');
  });

  it('returns 401 when password is wrong', async () => {
    const req = { body: { email: 'user@test.com', password: 'wrongpassword' } } as unknown as Parameters<typeof login>[0];
    const res = createMockRes();

    await login(req, res as unknown as Parameters<typeof login>[1]);

    expect(res.status).toHaveBeenCalledWith(401);
    expect((res.jsonData as Record<string, string>).error).toBe('Invalid credentials');
  });

  it('returns token and user on successful login', async () => {
    const req = { body: { email: 'user@test.com', password: 'password123' } } as unknown as Parameters<typeof login>[0];
    const res = createMockRes();

    await login(req, res as unknown as Parameters<typeof login>[1]);

    expect(res.json).toHaveBeenCalled();
    const data = res.jsonData as Record<string, unknown>;
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect((data.user as Record<string, string>).email).toBe('user@test.com');
    expect((data.user as Record<string, string>).fullName).toBe('Test User');
    expect((data.user as Record<string, string>).role).toBe('ANALYST');
  });
});

describe('getMe controller', () => {
  beforeEach(() => {
    mockUsers.push({
      id: 'user-1',
      email: 'me@test.com',
      full_name: 'Me User',
      role: 'ADMIN',
      created_at: '2024-01-01',
    });
  });

  it('returns 401 when no user on request', () => {
    const req = { user: undefined } as unknown as Parameters<typeof getMe>[0];
    const res = createMockRes();

    getMe(req, res as unknown as Parameters<typeof getMe>[1]);

    expect(res.status).toHaveBeenCalledWith(401);
    expect((res.jsonData as Record<string, string>).error).toBe('Not authenticated');
  });

  it('returns 404 when user not found in database', () => {
    const req = { user: { id: 'nonexistent' } } as unknown as Parameters<typeof getMe>[0];
    const res = createMockRes();

    getMe(req, res as unknown as Parameters<typeof getMe>[1]);

    expect(res.status).toHaveBeenCalledWith(404);
    expect((res.jsonData as Record<string, string>).error).toBe('User not found');
  });

  it('returns user data on success', () => {
    const req = { user: { id: 'user-1' } } as unknown as Parameters<typeof getMe>[0];
    const res = createMockRes();

    getMe(req, res as unknown as Parameters<typeof getMe>[1]);

    expect(res.json).toHaveBeenCalled();
    const data = res.jsonData as Record<string, unknown>;
    expect(data.success).toBe(true);
    const user = data.user as Record<string, string>;
    expect(user.email).toBe('me@test.com');
    expect(user.fullName).toBe('Me User');
    expect(user.role).toBe('ADMIN');
    expect(user.createdAt).toBe('2024-01-01');
  });
});
