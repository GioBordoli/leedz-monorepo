import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is required' });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({ error: 'JWT token is required' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, secret) as User;
    req.user = decoded;
    
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token has expired' });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional JWT Authentication Middleware
 * Sets user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      next();
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, secret) as User;
    req.user = decoded;
    
    next();

  } catch (error) {
    // Fail silently for optional auth
    next();
  }
}; 