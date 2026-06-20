import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { db } from '../config/database';
import { formatUserResponse, formatUserResponseWithDate } from '../utils/formatUserResponse';

const SALT_ROUNDS = 12;

const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name || user.fullName,
    },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role = 'ANALYST' } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Email, password and full name are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if email exists
    const existing = db.users.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = db.users.create({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role: role.toUpperCase(),
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = db.users.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user
export const getMe = (req: any, res: Response): void => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = db.users.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: formatUserResponseWithDate(user),
    });
  } catch (error) {
    console.error('[Auth] GetMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
