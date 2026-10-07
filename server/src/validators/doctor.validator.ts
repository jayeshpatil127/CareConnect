import { AppError } from '../utils/errors';

export type DoctorAppointmentFilterStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
export type DoctorAppointmentUpdateStatus = 'upcoming' | 'in-progress' | 'completed';

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

export interface GetDoctorAppointmentsFilterDTO {
  status?: DoctorAppointmentFilterStatus;
}

export interface UpdateAppointmentStatusDTO {
  status: DoctorAppointmentUpdateStatus;
}

/**
 * Validates query parameters for GET /api/doctor/appointments.
 * Ensures status filter (if provided) is one of the allowed appointment statuses.
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
 * Only allows 'upcoming', 'in-progress', 'completed'.
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
 * Validates appointment ID URL parameter.
 */
export const validateAppointmentId = (idParam: string): number => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Appointment ID must be a positive integer', 400);
  }
  return id;
};
