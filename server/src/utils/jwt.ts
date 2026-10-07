import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errors';

export interface TokenPayload {
  userId: number;
  role: string;
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
 * Kept reusable for subsequent auth middleware commits.
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
    const decoded = jwt.verify(token, secret) as JwtPayload & TokenPayload;
    return {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (error: any) {
    throw new AppError('Invalid or expired authentication token', 401);
  }
};
