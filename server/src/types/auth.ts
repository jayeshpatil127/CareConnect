export type UserRole = 'patient' | 'doctor' | 'admin';

export interface AuthenticatedUser {
  userId: number;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
