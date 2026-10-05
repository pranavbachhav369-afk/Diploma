import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { User, Admin } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'diploma_rankers_super_secret_jwt_key_2025';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'admin';
    name: string;
  };
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function comparePassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function generateToken(payload: { id: string; email: string; role: 'student' | 'admin'; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'student' | 'admin';
      name: string;
    };

    if (decoded.role === 'admin') {
      const admin = db.findAdminById(decoded.id);
      if (!admin) {
        return res.status(401).json({ error: 'Admin account not found or disabled.' });
      }
    } else {
      const user = db.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User account not found.' });
      }
      if (!user.is_active) {
        return res.status(403).json({ error: 'Account has been deactivated. Please contact support.' });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required.' });
    }
    next();
  });
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'student' | 'admin';
      name: string;
    };
    req.user = decoded;
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
}
