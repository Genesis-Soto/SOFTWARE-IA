import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock the ENV config
vi.mock('../config/env', () => ({
  ENV: {
    JWT_SECRET: 'test-secret-key',
    PORT: '4000',
    NODE_ENV: 'test',
  },
}));

import { authMiddleware, requireRole } from '../middleware/auth';

function createMockReq(headers: Record<string, string> = {}, user?: { id: string; email: string; role: string; fullName: string }) {
  return {
    header: vi.fn((name: string) => headers[name]),
    user,
  } as unknown as Parameters<typeof authMiddleware>[0];
}

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

describe('authMiddleware', () => {
  it('returns 401 when no token is provided', () => {
    const req = createMockReq({});
    const res = createMockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    const req = createMockReq({ Authorization: 'Bearer invalid-token' });
    const res = createMockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next when token is valid', () => {
    const payload = { id: 'user-1', email: 'test@test.com', role: 'ADMIN', fullName: 'Test User' };
    const token = jwt.sign(payload, 'test-secret-key');

    const req = createMockReq({ Authorization: `Bearer ${token}` });
    const res = createMockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when token is expired', () => {
    const payload = { id: 'user-1', email: 'test@test.com', role: 'ADMIN', fullName: 'Test User' };
    const token = jwt.sign(payload, 'test-secret-key', { expiresIn: '-1s' });

    const req = createMockReq({ Authorization: `Bearer ${token}` });
    const res = createMockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('returns 401 when no user is set', () => {
    const req = createMockReq({});
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireRole('ADMIN');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user role does not match', () => {
    const req = createMockReq({}, { id: '1', email: 'test@test.com', role: 'ANALYST', fullName: 'Test' });
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireRole('ADMIN');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user has required role', () => {
    const req = createMockReq({}, { id: '1', email: 'test@test.com', role: 'ADMIN', fullName: 'Test' });
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireRole('ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('accepts multiple roles', () => {
    const req = createMockReq({}, { id: '1', email: 'test@test.com', role: 'ANALYST', fullName: 'Test' });
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireRole('ADMIN', 'ANALYST');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
