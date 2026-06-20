import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock fs to avoid actual file operations
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock crypto.randomUUID
vi.mock('crypto', () => ({
  default: {
    randomUUID: vi.fn(() => 'mock-uuid-1234'),
  },
  randomUUID: vi.fn(() => 'mock-uuid-1234'),
}));

let db: typeof import('../config/database').db;

beforeEach(async () => {
  vi.resetModules();
  vi.mocked(fs.existsSync).mockReturnValue(false);
  vi.mocked(fs.writeFileSync).mockImplementation(() => {});
  const module = await import('../config/database');
  db = module.db;
  // Clear users for each test
  db._raw.users.length = 0;
});

describe('database module', () => {
  describe('users.create', () => {
    it('creates a user with generated id', () => {
      const user = db.users.create({
        email: 'test@test.com',
        password_hash: 'hashed',
        full_name: 'Test User',
        role: 'ANALYST',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@test.com');
      expect(user.full_name).toBe('Test User');
      expect(user.role).toBe('ANALYST');
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it('uses provided id if given', () => {
      const user = db.users.create({
        id: 'custom-id',
        email: 'custom@test.com',
        password_hash: 'hashed',
        full_name: 'Custom',
        role: 'ADMIN',
      });

      expect(user.id).toBe('custom-id');
    });

    it('persists to disk after creation', () => {
      db.users.create({
        email: 'persist@test.com',
        password_hash: 'hashed',
        full_name: 'Persist',
        role: 'ANALYST',
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('users.findAll', () => {
    it('returns all users', () => {
      db.users.create({ email: 'a@test.com', password_hash: 'h', full_name: 'A', role: 'ANALYST' });
      db.users.create({ email: 'b@test.com', password_hash: 'h', full_name: 'B', role: 'ADMIN' });

      const all = db.users.findAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('users.findById', () => {
    it('returns user by id', () => {
      const created = db.users.create({ id: 'find-me', email: 'find@test.com', password_hash: 'h', full_name: 'Find', role: 'ANALYST' });
      const found = db.users.findById('find-me');
      expect(found).toEqual(created);
    });

    it('returns undefined for non-existent id', () => {
      expect(db.users.findById('nonexistent')).toBeUndefined();
    });
  });

  describe('users.findByEmail', () => {
    it('returns user by email', () => {
      db.users.create({ email: 'email@test.com', password_hash: 'h', full_name: 'Email', role: 'ANALYST' });
      const found = db.users.findByEmail('email@test.com');
      expect(found?.email).toBe('email@test.com');
    });

    it('returns undefined for non-existent email', () => {
      expect(db.users.findByEmail('none@test.com')).toBeUndefined();
    });
  });

  describe('users.update', () => {
    it('updates user fields', () => {
      db.users.create({ id: 'up-1', email: 'up@test.com', password_hash: 'h', full_name: 'Before', role: 'ANALYST' });

      const updated = db.users.update('up-1', { full_name: 'After' });
      expect(updated.full_name).toBe('After');
      expect(updated.email).toBe('up@test.com');
      expect(updated.updated_at).toBeDefined();
    });

    it('returns null for non-existent user', () => {
      expect(db.users.update('nonexistent', { full_name: 'X' })).toBeNull();
    });

    it('persists changes to disk', () => {
      db.users.create({ id: 'persist-up', email: 'pu@test.com', password_hash: 'h', full_name: 'P', role: 'ANALYST' });
      vi.mocked(fs.writeFileSync).mockClear();

      db.users.update('persist-up', { full_name: 'Updated' });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('users.delete', () => {
    it('removes user and returns true', () => {
      db.users.create({ id: 'del-1', email: 'del@test.com', password_hash: 'h', full_name: 'Del', role: 'ANALYST' });

      const result = db.users.delete('del-1');
      expect(result).toBe(true);
      expect(db.users.findById('del-1')).toBeUndefined();
    });

    it('returns false for non-existent user', () => {
      expect(db.users.delete('nonexistent')).toBe(false);
    });

    it('persists changes to disk', () => {
      db.users.create({ id: 'del-persist', email: 'dp@test.com', password_hash: 'h', full_name: 'DP', role: 'ANALYST' });
      vi.mocked(fs.writeFileSync).mockClear();

      db.users.delete('del-persist');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
});
