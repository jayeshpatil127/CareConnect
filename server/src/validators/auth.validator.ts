import { AppError } from '../utils/errors';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES: readonly UserRole[] = ['patient', 'doctor', 'admin'] as const;

export const validateRegisterInput = (body: unknown): RegisterDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { fullName, email, password, role } = body as Record<string, unknown>;

  // fullName validation
  if (!fullName || typeof fullName !== 'string') {
    throw new AppError('Full name is required', 400);
  }
  const trimmedName = fullName.trim();
  if (trimmedName.length === 0) {
    throw new AppError('Full name cannot be empty', 400);
  }
  if (trimmedName.length > 150) {
    throw new AppError('Full name cannot exceed 150 characters', 400);
  }

  // email validation
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError('Please provide a valid email address', 400);
  }
  if (normalizedEmail.length > 255) {
    throw new AppError('Email cannot exceed 255 characters', 400);
  }

  // password validation
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required', 400);
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  // role validation
  if (!role || typeof role !== 'string') {
    throw new AppError('Role is required', 400);
  }
  const trimmedRole = role.trim().toLowerCase() as UserRole;
  if (!ALLOWED_ROLES.includes(trimmedRole)) {
    throw new AppError(
      `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}`,
      400
    );
  }

  return {
    fullName: trimmedName,
    email: normalizedEmail,
    password,
    role: trimmedRole,
  };
};

export const validateLoginInput = (body: unknown): LoginDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { email, password } = body as Record<string, unknown>;

  // email validation
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  // password validation
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required', 400);
  }
  if (password.length === 0) {
    throw new AppError('Password cannot be empty', 400);
  }

  // Note: any 'role' field passed in the request body is intentionally ignored here.
  // The server strictly reads the role from the database.
  return {
    email: normalizedEmail,
    password,
  };
};
