import { AppError } from '../utils/errors';

export type DoctorAppointmentFilterStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
export type DoctorAppointmentUpdateStatus = 'upcoming' | 'in-progress' | 'completed';
export type DoctorProfileStatus = 'active' | 'on-leave' | 'inactive';

const ALLOWED_FILTER_STATUSES: readonly DoctorAppointmentFilterStatus[] = [
  'upcoming',
  'in-progress',
  'completed',
  'cancelled',
] as const;

const ALLOWED_UPDATE_STATUSES: readonly DoctorAppointmentUpdateStatus[] = [
  'upcoming',
  'in-progress',
  'completed',
] as const;

const ALLOWED_DOCTOR_STATUSES: readonly DoctorProfileStatus[] = [
  'active',
  'on-leave',
  'inactive',
] as const;

export interface GetDoctorAppointmentsFilterDTO {
  status?: DoctorAppointmentFilterStatus;
}

export interface UpdateAppointmentStatusDTO {
  status: DoctorAppointmentUpdateStatus;
}

export interface GetDoctorPatientsFilterDTO {
  search?: string;
}

export interface CreateClinicalNoteDTO {
  patientId: number;
  diagnosis: string;
  treatment: string;
  followUp?: string | null;
}

export interface GetClinicalNotesFilterDTO {
  patientId?: number;
}

export interface UpdateDoctorProfileDTO {
  fullName?: string;
  specialization?: string;
  status?: DoctorProfileStatus;
}

/**
 * Validates query parameters for GET /api/doctor/appointments.
 */
export const validateDoctorAppointmentsFilter = (
  query: Record<string, unknown>
): GetDoctorAppointmentsFilterDTO => {
  const result: GetDoctorAppointmentsFilterDTO = {};

  if (query.status !== undefined && query.status !== null) {
    if (typeof query.status !== 'string') {
      throw new AppError('Status filter must be a string', 400);
    }
    const trimmedStatus = query.status.trim().toLowerCase() as DoctorAppointmentFilterStatus;
    if (!ALLOWED_FILTER_STATUSES.includes(trimmedStatus)) {
      throw new AppError(
        `Invalid status filter. Allowed values: ${ALLOWED_FILTER_STATUSES.join(', ')}`,
        400
      );
    }
    result.status = trimmedStatus;
  }

  return result;
};

/**
 * Validates request body for PATCH /api/doctor/appointments/:id/status.
 */
export const validateUpdateAppointmentStatusInput = (
  body: unknown
): UpdateAppointmentStatusDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { status } = body as Record<string, unknown>;

  if (status === undefined || status === null) {
    throw new AppError('status is required', 400);
  }

  if (typeof status !== 'string') {
    throw new AppError('status must be a string', 400);
  }

  const trimmedStatus = status.trim().toLowerCase() as DoctorAppointmentUpdateStatus;

  if (!ALLOWED_UPDATE_STATUSES.includes(trimmedStatus)) {
    throw new AppError(
      `Invalid status. Allowed values: ${ALLOWED_UPDATE_STATUSES.join(', ')}`,
      400
    );
  }

  return {
    status: trimmedStatus,
  };
};

/**
 * Validates query parameters for GET /api/doctor/patients.
 */
export const validateDoctorPatientsFilter = (
  query: Record<string, unknown>
): GetDoctorPatientsFilterDTO => {
  const result: GetDoctorPatientsFilterDTO = {};

  if (query.search !== undefined && query.search !== null) {
    if (typeof query.search !== 'string') {
      throw new AppError('Search query must be a string', 400);
    }
    const trimmedSearch = query.search.trim();
    if (trimmedSearch.length > 0) {
      result.search = trimmedSearch;
    }
  }

  return result;
};

/**
 * Validates body for POST /api/doctor/clinical-notes.
 */
export const validateCreateClinicalNoteInput = (
  body: unknown
): CreateClinicalNoteDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { patientId, diagnosis, treatment, followUp } = body as Record<
    string,
    unknown
  >;

  // patientId validation
  if (patientId === undefined || patientId === null) {
    throw new AppError('patientId is required', 400);
  }
  const parsedPatientId = Number(patientId);
  if (!Number.isInteger(parsedPatientId) || parsedPatientId <= 0) {
    throw new AppError('patientId must be a positive integer', 400);
  }

  // diagnosis validation
  if (!diagnosis || typeof diagnosis !== 'string') {
    throw new AppError('diagnosis is required', 400);
  }
  const trimmedDiagnosis = diagnosis.trim();
  if (trimmedDiagnosis.length === 0) {
    throw new AppError('diagnosis cannot be empty', 400);
  }

  // treatment validation
  if (!treatment || typeof treatment !== 'string') {
    throw new AppError('treatment is required', 400);
  }
  const trimmedTreatment = treatment.trim();
  if (trimmedTreatment.length === 0) {
    throw new AppError('treatment cannot be empty', 400);
  }

  // followUp validation (optional)
  let cleanedFollowUp: string | null = null;
  if (followUp !== undefined && followUp !== null) {
    if (typeof followUp !== 'string') {
      throw new AppError('followUp must be a string', 400);
    }
    const trimmed = followUp.trim();
    if (trimmed.length > 0) {
      cleanedFollowUp = trimmed;
    }
  }

  return {
    patientId: parsedPatientId,
    diagnosis: trimmedDiagnosis,
    treatment: trimmedTreatment,
    followUp: cleanedFollowUp,
  };
};

/**
 * Validates query parameters for GET /api/doctor/clinical-notes.
 */
export const validateClinicalNotesFilter = (
  query: Record<string, unknown>
): GetClinicalNotesFilterDTO => {
  const result: GetClinicalNotesFilterDTO = {};

  if (query.patientId !== undefined && query.patientId !== null) {
    const parsed = Number(query.patientId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new AppError('patientId query parameter must be a positive integer', 400);
    }
    result.patientId = parsed;
  }

  return result;
};

/**
 * Validates body for PATCH /api/doctor/profile.
 */
export const validateUpdateDoctorProfileInput = (
  body: unknown
): UpdateDoctorProfileDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { fullName, specialization, status } = body as Record<string, unknown>;
  const result: UpdateDoctorProfileDTO = {};

  if (fullName !== undefined && fullName !== null) {
    if (typeof fullName !== 'string') {
      throw new AppError('fullName must be a string', 400);
    }
    const trimmed = fullName.trim();
    if (trimmed.length === 0 || trimmed.length > 150) {
      throw new AppError('fullName must be between 1 and 150 characters', 400);
    }
    result.fullName = trimmed;
  }

  if (specialization !== undefined && specialization !== null) {
    if (typeof specialization !== 'string') {
      throw new AppError('specialization must be a string', 400);
    }
    const trimmed = specialization.trim();
    if (trimmed.length === 0 || trimmed.length > 150) {
      throw new AppError('specialization must be between 1 and 150 characters', 400);
    }
    result.specialization = trimmed;
  }

  if (status !== undefined && status !== null) {
    if (typeof status !== 'string') {
      throw new AppError('status must be a string', 400);
    }
    const trimmedStatus = status.trim().toLowerCase() as DoctorProfileStatus;
    if (!ALLOWED_DOCTOR_STATUSES.includes(trimmedStatus)) {
      throw new AppError(
        `Invalid status. Allowed values: ${ALLOWED_DOCTOR_STATUSES.join(', ')}`,
        400
      );
    }
    result.status = trimmedStatus;
  }

  if (Object.keys(result).length === 0) {
    throw new AppError('At least one field (fullName, specialization, status) must be provided to update', 400);
  }

  return result;
};

/**
 * Validates numeric ID parameters.
 */
export const validateNumericId = (idParam: string, entityName: string = 'ID'): number => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`${entityName} must be a positive integer`, 400);
  }
  return id;
};

export const validateAppointmentId = (idParam: string): number => {
  return validateNumericId(idParam, 'Appointment ID');
};

export const validatePatientIdParam = (idParam: string): number => {
  return validateNumericId(idParam, 'Patient ID');
};
