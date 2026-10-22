import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { isConnectedToMongo } from '../config/db.js';
import { inMemoryDB } from '../store/inMemoryStore.js';

function generateToken(id: string, email: string): string {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_react_native_todo_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, email }, secret, { expiresIn } as any);
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isConnectedToMongo) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
        return;
      }

      const newUser = await User.create({
        email: normalizedEmail,
        password,
        name: name?.trim() || 'Task Champion',
      });

      const token = generateToken(newUser._id.toString(), newUser.email);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        data: {
          user: {
            id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            createdAt: newUser.createdAt,
          },
          token,
        },
      });
    } else {
      // In-Memory Fallback
      const existing = await inMemoryDB.findUserByEmail(normalizedEmail);
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
        return;
      }

      const newUser = await inMemoryDB.createUser({
        email: normalizedEmail,
        password,
        name: name?.trim() || 'Task Champion',
      });

      const token = generateToken(newUser.id, newUser.email);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully! (In-Memory Database)',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            createdAt: newUser.createdAt,
          },
          token,
        },
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration.',
    });
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isConnectedToMongo) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
        return;
      }

      const token = generateToken(user._id.toString(), user.email);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } else {
      // In-Memory Fallback
      const user = await inMemoryDB.findUserByEmail(normalizedEmail);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
        return;
      }

      const token = generateToken(user.id, user.email);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully! (In-Memory Database)',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during login.',
    });
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile.',
    });
  }
}
