import { AppError } from '../utils/errors';

export type DoctorStatus = 'active' | 'on-leave' | 'inactive';
export type AppointmentStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
export type LogLevel = 'info' | 'warning' | 'error';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_DOCTOR_STATUSES: readonly DoctorStatus[] = ['active', 'on-leave', 'inactive'] as const;
const ALLOWED_APPOINTMENT_STATUSES: readonly AppointmentStatus[] = ['upcoming', 'in-progress', 'completed', 'cancelled'] as const;
const ALLOWED_LOG_LEVELS: readonly LogLevel[] = ['info', 'warning', 'error'] as const;
const ALLOWED_BLOOD_GROUPS: readonly BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export interface AddDoctorDTO {
  fullName: string;
  email: string;
  password: string;
  specialization: string;
  status: DoctorStatus;
}

export interface DoctorFilterDTO {
  search?: string;
  status?: DoctorStatus;
}

export interface UpdateDoctorStatusDTO {
  status: DoctorStatus;
}

export interface AddPatientDTO {
  fullName: string;
  email: string;
  password: string;
  bloodGroup?: BloodGroup | null;
  allergies?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export interface PatientFilterDTO {
  search?: string;
}

export interface AppointmentFilterDTO {
  search?: string;
  status?: AppointmentStatus;
}

export interface LogFilterDTO {
  level?: LogLevel;
}

export const validateAddDoctorInput = (body: unknown): AddDoctorDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { fullName, email, password, specialization, status } = body as Record<string, unknown>;

  // fullName
  if (!fullName || typeof fullName !== 'string') {
    throw new AppError('Full name is required', 400);
  }
  const trimmedName = fullName.trim();
  if (trimmedName.length === 0 || trimmedName.length > 150) {
    throw new AppError('Full name must be between 1 and 150 characters', 400);
  }

  // email
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 255) {
    throw new AppError('Please provide a valid email address', 400);
  }

  // password
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required', 400);
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  // specialization
  if (!specialization || typeof specialization !== 'string') {
    throw new AppError('Specialization is required', 400);
  }
  const trimmedSpec = specialization.trim();
  if (trimmedSpec.length === 0 || trimmedSpec.length > 150) {
    throw new AppError('Specialization must be between 1 and 150 characters', 400);
  }

  // status (optional, default active)
  let resolvedStatus: DoctorStatus = 'active';
  if (status !== undefined && status !== null) {
    if (typeof status !== 'string') {
      throw new AppError('Status must be a string', 400);
    }
    const trimmedStatus = status.trim().toLowerCase() as DoctorStatus;
    if (!ALLOWED_DOCTOR_STATUSES.includes(trimmedStatus)) {
      throw new AppError(`Invalid status. Allowed values: ${ALLOWED_DOCTOR_STATUSES.join(', ')}`, 400);
    }
    resolvedStatus = trimmedStatus;
  }

  return {
    fullName: trimmedName,
    email: normalizedEmail,
    password,
    specialization: trimmedSpec,
    status: resolvedStatus,
  };
};

export const validateDoctorFilter = (query: Record<string, unknown>): DoctorFilterDTO => {
  const result: DoctorFilterDTO = {};

  if (query.search !== undefined && query.search !== null) {
    if (typeof query.search !== 'string') throw new AppError('Search query must be a string', 400);
    const trimmed = query.search.trim();
    if (trimmed.length > 0) result.search = trimmed;
  }

  if (query.status !== undefined && query.status !== null) {
    if (typeof query.status !== 'string') throw new AppError('Status must be a string', 400);
    const trimmedStatus = query.status.trim().toLowerCase() as DoctorStatus;
    if (!ALLOWED_DOCTOR_STATUSES.includes(trimmedStatus)) {
      throw new AppError(`Invalid status filter. Allowed values: ${ALLOWED_DOCTOR_STATUSES.join(', ')}`, 400);
    }
    result.status = trimmedStatus;
  }

  return result;
};

export const validateDoctorStatusUpdateInput = (body: unknown): UpdateDoctorStatusDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { status } = body as Record<string, unknown>;

  if (status === undefined || status === null) {
    throw new AppError('Status is required', 400);
  }

  if (typeof status !== 'string') {
    throw new AppError('Status must be a string', 400);
  }

  const trimmedStatus = status.trim().toLowerCase() as DoctorStatus;
  if (!ALLOWED_DOCTOR_STATUSES.includes(trimmedStatus)) {
    throw new AppError(`Invalid status. Allowed values: ${ALLOWED_DOCTOR_STATUSES.join(', ')}`, 400);
  }

  return { status: trimmedStatus };
};

export const validateAddPatientInput = (body: unknown): AddPatientDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { fullName, email, password, bloodGroup, allergies, emergencyContactName, emergencyContactPhone } = body as Record<string, unknown>;

  // fullName
  if (!fullName || typeof fullName !== 'string') {
    throw new AppError('Full name is required', 400);
  }
  const trimmedName = fullName.trim();
  if (trimmedName.length === 0 || trimmedName.length > 150) {
    throw new AppError('Full name must be between 1 and 150 characters', 400);
  }

  // email
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 255) {
    throw new AppError('Please provide a valid email address', 400);
  }

  // password
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required', 400);
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  // optional bloodGroup
  let resolvedBloodGroup: BloodGroup | null = null;
  if (bloodGroup !== undefined && bloodGroup !== null && bloodGroup !== '') {
    if (typeof bloodGroup !== 'string') throw new AppError('Blood group must be a string', 400);
    const bg = bloodGroup.trim().toUpperCase() as BloodGroup;
    if (!ALLOWED_BLOOD_GROUPS.includes(bg)) {
      throw new AppError(`Invalid blood group. Allowed: ${ALLOWED_BLOOD_GROUPS.join(', ')}`, 400);
    }
    resolvedBloodGroup = bg;
  }

  // optional text fields
  const allergiesStr = typeof allergies === 'string' && allergies.trim() ? allergies.trim() : null;
  const contactNameStr = typeof emergencyContactName === 'string' && emergencyContactName.trim() ? emergencyContactName.trim() : null;
  const contactPhoneStr = typeof emergencyContactPhone === 'string' && emergencyContactPhone.trim() ? emergencyContactPhone.trim() : null;

  return {
    fullName: trimmedName,
    email: normalizedEmail,
    password,
    bloodGroup: resolvedBloodGroup,
    allergies: allergiesStr,
    emergencyContactName: contactNameStr,
    emergencyContactPhone: contactPhoneStr,
  };
};

export const validatePatientFilter = (query: Record<string, unknown>): PatientFilterDTO => {
  const result: PatientFilterDTO = {};

  if (query.search !== undefined && query.search !== null) {
    if (typeof query.search !== 'string') throw new AppError('Search query must be a string', 400);
    const trimmed = query.search.trim();
    if (trimmed.length > 0) result.search = trimmed;
  }

  return result;
};

export const validateAppointmentFilter = (query: Record<string, unknown>): AppointmentFilterDTO => {
  const result: AppointmentFilterDTO = {};

  if (query.search !== undefined && query.search !== null) {
    if (typeof query.search !== 'string') throw new AppError('Search query must be a string', 400);
    const trimmed = query.search.trim();
    if (trimmed.length > 0) result.search = trimmed;
  }

  if (query.status !== undefined && query.status !== null) {
    if (typeof query.status !== 'string') throw new AppError('Status must be a string', 400);
    const trimmedStatus = query.status.trim().toLowerCase() as AppointmentStatus;
    if (!ALLOWED_APPOINTMENT_STATUSES.includes(trimmedStatus)) {
      throw new AppError(`Invalid status filter. Allowed values: ${ALLOWED_APPOINTMENT_STATUSES.join(', ')}`, 400);
    }
    result.status = trimmedStatus;
  }

  return result;
};

export const validateLogFilter = (query: Record<string, unknown>): LogFilterDTO => {
  const result: LogFilterDTO = {};

  if (query.level !== undefined && query.level !== null) {
    if (typeof query.level !== 'string') throw new AppError('Level filter must be a string', 400);
    const trimmedLevel = query.level.trim().toLowerCase() as LogLevel;
    if (!ALLOWED_LOG_LEVELS.includes(trimmedLevel)) {
      throw new AppError(`Invalid log level. Allowed values: ${ALLOWED_LOG_LEVELS.join(', ')}`, 400);
    }
    result.level = trimmedLevel;
  }

  return result;
};

export const validateNumericId = (idParam: string, name = 'ID'): number => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`${name} must be a positive integer`, 400);
  }
  return id;
};
