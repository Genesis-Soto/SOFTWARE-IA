import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.join(__dirname, '../../dev.db.json');

interface DBSchema {
  users: any[];
}

let data: DBSchema = { users: [] };

// Load from disk if exists
if (fs.existsSync(DB_FILE)) {
  try {
    data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    console.log('[DB] Loaded database from', DB_FILE, `(${data.users.length} users)`);
  } catch (e) {
    console.log('[DB] Creating new database');
  }
} else {
  console.log('[DB] New database created at', DB_FILE);
}

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return crypto.randomUUID();
}

// Simple query interface
export const db = {
  users: {
    findAll: () => data.users,
    findById: (id: string) => data.users.find(u => u.id === id),
    findByEmail: (email: string) => data.users.find(u => u.email === email),
    create: (user: any) => {
      const newUser = {
        id: user.id || generateId(),
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      data.users.push(newUser);
      save();
      return newUser;
    },
    update: (id: string, updates: any) => {
      const idx = data.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      data.users[idx] = { ...data.users[idx], ...updates, updated_at: new Date().toISOString() };
      save();
      return data.users[idx];
    },
    delete: (id: string) => {
      const idx = data.users.findIndex(u => u.id === id);
      if (idx === -1) return false;
      data.users.splice(idx, 1);
      save();
      return true;
    },
  },
};

export default db;
