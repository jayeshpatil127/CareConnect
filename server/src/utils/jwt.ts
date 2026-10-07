import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errors';
import { UserRole } from '../types/auth';

export interface TokenPayload {
  userId: number;
  role: UserRole;
}

/**
 * Signs a JWT token with the provided identity payload.
 *
 * @param payload - Minimal identity payload containing userId and role
 * @returns signed JWT string
 */
export const signToken = (payload: TokenPayload): string => {
  const secret = config.jwt.secret;
  if (!secret) {
    throw new AppError('Server configuration error: JWT_SECRET is not configured', 500);
  }

  try {
    const options: SignOptions = {
      expiresIn: config.jwt.expiresIn as any,
    };

    return jwt.sign(payload, secret, options);
  } catch (error: any) {
    console.error('JWT sign error:', error.message || error);
    throw new AppError('Failed to generate authentication token', 500);
  }
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * Validates token signature, expiration, and required payload fields.
 *
 * @param token - JWT token string
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): TokenPayload => {
  const secret = config.jwt.secret;
  if (!secret) {
    throw new AppError('Server configuration error: JWT_SECRET is not configured', 500);
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & { userId?: number; role?: UserRole };

    if (!decoded.userId || !decoded.role) {
      throw new AppError('Invalid or expired token', 401);
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Invalid or expired token', 401);
  }
};
