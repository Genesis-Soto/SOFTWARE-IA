import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const ENV = {
  PORT: process.env.PORT || '4000',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

if (!process.env.JWT_SECRET && ENV.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}
