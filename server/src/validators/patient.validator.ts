import { AppError } from '../utils/errors';

export type AppointmentMode = 'in-person' | 'video';
export type AppointmentStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';

export interface BookAppointmentDTO {
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  room?: string | null;
  mode: AppointmentMode;
  notes?: string | null;
}

export interface GetAppointmentsFilterDTO {
  status?: AppointmentStatus;
  search?: string;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const ALLOWED_MODES: readonly AppointmentMode[] = ['in-person', 'video'] as const;
const ALLOWED_STATUSES: readonly AppointmentStatus[] = [
  'upcoming',
  'in-progress',
  'completed',
  'cancelled',
] as const;

export const validateBookAppointmentInput = (body: unknown): BookAppointmentDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { doctorId, appointmentDate, appointmentTime, room, mode, notes } = body as Record<
    string,
    unknown
  >;

  // doctorId validation
  if (doctorId === undefined || doctorId === null) {
    throw new AppError('doctorId is required', 400);
  }
  const parsedDoctorId = Number(doctorId);
  if (!Number.isInteger(parsedDoctorId) || parsedDoctorId <= 0) {
    throw new AppError('doctorId must be a positive integer', 400);
  }

  // appointmentDate validation
  if (!appointmentDate || typeof appointmentDate !== 'string') {
    throw new AppError('appointmentDate is required in YYYY-MM-DD format', 400);
  }
  const trimmedDate = appointmentDate.trim();
  if (!DATE_REGEX.test(trimmedDate) || isNaN(Date.parse(trimmedDate))) {
    throw new AppError('appointmentDate must be a valid date in YYYY-MM-DD format', 400);
  }

  // appointmentTime validation
  if (!appointmentTime || typeof appointmentTime !== 'string') {
    throw new AppError('appointmentTime is required in HH:MM or HH:MM:SS format', 400);
  }
  const trimmedTime = appointmentTime.trim();
  if (!TIME_REGEX.test(trimmedTime)) {
    throw new AppError('appointmentTime must be in HH:MM or HH:MM:SS format', 400);
  }

  // mode validation
  let validatedMode: AppointmentMode = 'in-person';
  if (mode !== undefined && mode !== null) {
    if (typeof mode !== 'string') {
      throw new AppError("mode must be 'in-person' or 'video'", 400);
    }
    const trimmedMode = mode.trim().toLowerCase() as AppointmentMode;
    if (!ALLOWED_MODES.includes(trimmedMode)) {
      throw new AppError("mode must be either 'in-person' or 'video'", 400);
    }
    validatedMode = trimmedMode;
  }

  // room validation
  let validatedRoom: string | null = null;
  if (room !== undefined && room !== null) {
    if (typeof room !== 'string') {
      throw new AppError('room must be a string', 400);
    }
    const trimmedRoom = room.trim();
    if (trimmedRoom.length > 50) {
      throw new AppError('room cannot exceed 50 characters', 400);
    }
    validatedRoom = trimmedRoom.length > 0 ? trimmedRoom : null;
  }

  // notes validation
  let validatedNotes: string | null = null;
  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string') {
      throw new AppError('notes must be a string', 400);
    }
    const trimmedNotes = notes.trim();
    validatedNotes = trimmedNotes.length > 0 ? trimmedNotes : null;
  }

  return {
    doctorId: parsedDoctorId,
    appointmentDate: trimmedDate,
    appointmentTime: trimmedTime.length === 5 ? `${trimmedTime}:00` : trimmedTime,
    room: validatedRoom,
    mode: validatedMode,
    notes: validatedNotes,
  };
};

export const validateGetAppointmentsFilter = (
  query: Record<string, unknown>
): GetAppointmentsFilterDTO => {
  const result: GetAppointmentsFilterDTO = {};

  if (query.status !== undefined && query.status !== null) {
    if (typeof query.status !== 'string') {
      throw new AppError('status filter must be a string', 400);
    }
    const trimmedStatus = query.status.trim().toLowerCase() as AppointmentStatus;
    if (!ALLOWED_STATUSES.includes(trimmedStatus)) {
      throw new AppError(
        `Invalid status filter. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
        400
      );
    }
    result.status = trimmedStatus;
  }

  if (query.search !== undefined && query.search !== null) {
    if (typeof query.search !== 'string') {
      throw new AppError('search query must be a string', 400);
    }
    const trimmedSearch = query.search.trim();
    if (trimmedSearch.length > 0) {
      result.search = trimmedSearch;
    }
  }

  return result;
};

export const validateAppointmentId = (idParam: string): number => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Appointment ID must be a positive integer', 400);
  }
  return id;
};
