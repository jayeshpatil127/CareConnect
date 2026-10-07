import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth';

/**
 * Role authorization middleware that checks if the authenticated user has permission.
 *
 * Requirements:
 * Must be executed AFTER authenticateToken middleware has populated req.user.
 *
 * @param allowedRoles - One or more UserRole values permitted to access the route
 */
export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Ensure user has been authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // 2. Check if the user's role matches any allowed role
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // 3. User is authorized
    next();
  };
};
