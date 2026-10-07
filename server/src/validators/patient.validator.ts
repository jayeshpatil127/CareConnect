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

export type MedicalHistoryCategory = 'consultation' | 'prescription' | 'lab' | 'diagnosis' | 'follow-up';

const ALLOWED_CATEGORIES: readonly MedicalHistoryCategory[] = [
  'consultation',
  'prescription',
  'lab',
  'diagnosis',
  'follow-up',
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

// =============================================================================
// VITALS VALIDATION
// =============================================================================

export interface LogVitalsDTO {
  bloodPressure: string | null;
  heartRate: number | null;
  bloodGlucose: number | null;
  weight: number | null;
  spo2: number | null;
  recordedAt: string;
}

const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?|T\d{2}:\d{2}(:\d{2})?)?$/;

export const validateLogVitalsInput = (body: unknown): LogVitalsDTO => {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required and must be an object', 400);
  }

  const { bloodPressure, heartRate, bloodGlucose, weight, spo2, recordedAt } = body as Record<
    string,
    unknown
  >;

  // At least one vital field must be provided
  const anyProvided = [bloodPressure, heartRate, bloodGlucose, weight, spo2].some(
    (v) => v !== undefined && v !== null && v !== ''
  );
  if (!anyProvided) {
    throw new AppError(
      'At least one vital field (bloodPressure, heartRate, bloodGlucose, weight, spo2) must be provided',
      400
    );
  }

  // bloodPressure: optional, VARCHAR(20), format like "120/80"
  let validatedBP: string | null = null;
  if (bloodPressure !== undefined && bloodPressure !== null && bloodPressure !== '') {
    if (typeof bloodPressure !== 'string') {
      throw new AppError('bloodPressure must be a string (e.g. "120/80")', 400);
    }
    const trimmedBP = bloodPressure.trim();
    if (trimmedBP.length > 20) {
      throw new AppError('bloodPressure cannot exceed 20 characters', 400);
    }
    validatedBP = trimmedBP.length > 0 ? trimmedBP : null;
  }

  // heartRate: optional, SMALLINT UNSIGNED (0-65535, realistically 0-300)
  let validatedHR: number | null = null;
  if (heartRate !== undefined && heartRate !== null && heartRate !== '') {
    const hrNum = Number(heartRate);
    if (isNaN(hrNum) || !Number.isInteger(hrNum) || hrNum < 0 || hrNum > 300) {
      throw new AppError('heartRate must be an integer between 0 and 300', 400);
    }
    validatedHR = hrNum;
  }

  // bloodGlucose: optional, DECIMAL(6,1)
  let validatedBG: number | null = null;
  if (bloodGlucose !== undefined && bloodGlucose !== null && bloodGlucose !== '') {
    const bgNum = Number(bloodGlucose);
    if (isNaN(bgNum) || bgNum < 0 || bgNum > 99999.9) {
      throw new AppError('bloodGlucose must be a non-negative number (mg/dL)', 400);
    }
    validatedBG = Math.round(bgNum * 10) / 10;
  }

  // weight: optional, DECIMAL(6,2)
  let validatedWeight: number | null = null;
  if (weight !== undefined && weight !== null && weight !== '') {
    const wNum = Number(weight);
    if (isNaN(wNum) || wNum < 0 || wNum > 9999.99) {
      throw new AppError('weight must be a non-negative number (kg)', 400);
    }
    validatedWeight = Math.round(wNum * 100) / 100;
  }

  // spo2: optional, TINYINT UNSIGNED, must be 0-100
  let validatedSpo2: number | null = null;
  if (spo2 !== undefined && spo2 !== null && spo2 !== '') {
    const spo2Num = Number(spo2);
    if (isNaN(spo2Num) || !Number.isInteger(spo2Num) || spo2Num < 0 || spo2Num > 100) {
      throw new AppError('spo2 must be an integer between 0 and 100 (percentage)', 400);
    }
    validatedSpo2 = spo2Num;
  }

  // recordedAt: optional, defaults to current UTC datetime if not provided
  let validatedRecordedAt: string;
  if (recordedAt !== undefined && recordedAt !== null && recordedAt !== '') {
    if (typeof recordedAt !== 'string') {
      throw new AppError('recordedAt must be a valid datetime string', 400);
    }
    const trimmedDT = recordedAt.trim();
    if (!DATETIME_REGEX.test(trimmedDT) || isNaN(Date.parse(trimmedDT))) {
      throw new AppError(
        'recordedAt must be a valid datetime in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format',
        400
      );
    }
    validatedRecordedAt = trimmedDT.replace('T', ' ');
  } else {
    // Default to current UTC datetime formatted as MySQL DATETIME
    validatedRecordedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  return {
    bloodPressure: validatedBP,
    heartRate: validatedHR,
    bloodGlucose: validatedBG,
    weight: validatedWeight,
    spo2: validatedSpo2,
    recordedAt: validatedRecordedAt,
  };
};

// =============================================================================
// MEDICAL HISTORY VALIDATION
// =============================================================================

export interface GetMedicalHistoryFilterDTO {
  category?: MedicalHistoryCategory;
}

export const validateGetMedicalHistoryFilter = (
  query: Record<string, unknown>
): GetMedicalHistoryFilterDTO => {
  const result: GetMedicalHistoryFilterDTO = {};

  if (query.category !== undefined && query.category !== null) {
    if (typeof query.category !== 'string') {
      throw new AppError('category filter must be a string', 400);
    }
    const trimmedCategory = query.category.trim().toLowerCase() as MedicalHistoryCategory;
    if (!ALLOWED_CATEGORIES.includes(trimmedCategory)) {
      throw new AppError(
        `Invalid category filter. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`,
        400
      );
    }
    result.category = trimmedCategory;
  }

  return result;
};
