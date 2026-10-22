import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { isConnectedToMongo } from '../config/db.js';
import { inMemoryDB } from '../store/inMemoryStore.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
}

interface JwtPayload {
  id: string;
  email: string;
}

/**
 * Authentication middleware to verify JWT token in Authorization header
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_react_native_todo_2026';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Attach user ID
    req.userId = decoded.id;

    if (isConnectedToMongo) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
        return;
      }
      req.user = user;
    } else {
      // In-memory fallback
      const memUser = await inMemoryDB.findUserById(decoded.id);
      if (!memUser) {
        res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
        return;
      }
      req.user = {
        _id: memUser.id,
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        createdAt: memUser.createdAt,
      };
    }

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
}
