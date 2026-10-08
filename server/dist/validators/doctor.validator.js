"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePatientIdParam = exports.validateAppointmentId = exports.validateNumericId = exports.validateUpdateDoctorProfileInput = exports.validateClinicalNotesFilter = exports.validateCreateClinicalNoteInput = exports.validateDoctorPatientsFilter = exports.validateUpdateAppointmentStatusInput = exports.validateDoctorAppointmentsFilter = void 0;
const errors_1 = require("../utils/errors");
const ALLOWED_FILTER_STATUSES = [
    'upcoming',
    'in-progress',
    'completed',
    'cancelled',
];
const ALLOWED_UPDATE_STATUSES = [
    'upcoming',
    'in-progress',
    'completed',
];
const ALLOWED_DOCTOR_STATUSES = [
    'active',
    'on-leave',
    'inactive',
];
/**
 * Validates query parameters for GET /api/doctor/appointments.
 */
const validateDoctorAppointmentsFilter = (query) => {
    const result = {};
    if (query.status !== undefined && query.status !== null) {
        if (typeof query.status !== 'string') {
            throw new errors_1.AppError('Status filter must be a string', 400);
        }
        const trimmedStatus = query.status.trim().toLowerCase();
        if (!ALLOWED_FILTER_STATUSES.includes(trimmedStatus)) {
            throw new errors_1.AppError(`Invalid status filter. Allowed values: ${ALLOWED_FILTER_STATUSES.join(', ')}`, 400);
        }
        result.status = trimmedStatus;
    }
    return result;
};
exports.validateDoctorAppointmentsFilter = validateDoctorAppointmentsFilter;
/**
 * Validates request body for PATCH /api/doctor/appointments/:id/status.
 */
const validateUpdateAppointmentStatusInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { status } = body;
    if (status === undefined || status === null) {
        throw new errors_1.AppError('status is required', 400);
    }
    if (typeof status !== 'string') {
        throw new errors_1.AppError('status must be a string', 400);
    }
    const trimmedStatus = status.trim().toLowerCase();
    if (!ALLOWED_UPDATE_STATUSES.includes(trimmedStatus)) {
        throw new errors_1.AppError(`Invalid status. Allowed values: ${ALLOWED_UPDATE_STATUSES.join(', ')}`, 400);
    }
    return {
        status: trimmedStatus,
    };
};
exports.validateUpdateAppointmentStatusInput = validateUpdateAppointmentStatusInput;
/**
 * Validates query parameters for GET /api/doctor/patients.
 */
const validateDoctorPatientsFilter = (query) => {
    const result = {};
    if (query.search !== undefined && query.search !== null) {
        if (typeof query.search !== 'string') {
            throw new errors_1.AppError('Search query must be a string', 400);
        }
        const trimmedSearch = query.search.trim();
        if (trimmedSearch.length > 0) {
            result.search = trimmedSearch;
        }
    }
    return result;
};
exports.validateDoctorPatientsFilter = validateDoctorPatientsFilter;
/**
 * Validates body for POST /api/doctor/clinical-notes.
 */
const validateCreateClinicalNoteInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { patientId, diagnosis, treatment, followUp } = body;
    // patientId validation
    if (patientId === undefined || patientId === null) {
        throw new errors_1.AppError('patientId is required', 400);
    }
    const parsedPatientId = Number(patientId);
    if (!Number.isInteger(parsedPatientId) || parsedPatientId <= 0) {
        throw new errors_1.AppError('patientId must be a positive integer', 400);
    }
    // diagnosis validation
    if (!diagnosis || typeof diagnosis !== 'string') {
        throw new errors_1.AppError('diagnosis is required', 400);
    }
    const trimmedDiagnosis = diagnosis.trim();
    if (trimmedDiagnosis.length === 0) {
        throw new errors_1.AppError('diagnosis cannot be empty', 400);
    }
    // treatment validation
    if (!treatment || typeof treatment !== 'string') {
        throw new errors_1.AppError('treatment is required', 400);
    }
    const trimmedTreatment = treatment.trim();
    if (trimmedTreatment.length === 0) {
        throw new errors_1.AppError('treatment cannot be empty', 400);
    }
    // followUp validation (optional)
    let cleanedFollowUp = null;
    if (followUp !== undefined && followUp !== null) {
        if (typeof followUp !== 'string') {
            throw new errors_1.AppError('followUp must be a string', 400);
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
exports.validateCreateClinicalNoteInput = validateCreateClinicalNoteInput;
/**
 * Validates query parameters for GET /api/doctor/clinical-notes.
 */
const validateClinicalNotesFilter = (query) => {
    const result = {};
    if (query.patientId !== undefined && query.patientId !== null) {
        const parsed = Number(query.patientId);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            throw new errors_1.AppError('patientId query parameter must be a positive integer', 400);
        }
        result.patientId = parsed;
    }
    return result;
};
exports.validateClinicalNotesFilter = validateClinicalNotesFilter;
/**
 * Validates body for PATCH /api/doctor/profile.
 */
const validateUpdateDoctorProfileInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { fullName, specialization, status } = body;
    const result = {};
    if (fullName !== undefined && fullName !== null) {
        if (typeof fullName !== 'string') {
            throw new errors_1.AppError('fullName must be a string', 400);
        }
        const trimmed = fullName.trim();
        if (trimmed.length === 0 || trimmed.length > 150) {
            throw new errors_1.AppError('fullName must be between 1 and 150 characters', 400);
        }
        result.fullName = trimmed;
    }
    if (specialization !== undefined && specialization !== null) {
        if (typeof specialization !== 'string') {
            throw new errors_1.AppError('specialization must be a string', 400);
        }
        const trimmed = specialization.trim();
        if (trimmed.length === 0 || trimmed.length > 150) {
            throw new errors_1.AppError('specialization must be between 1 and 150 characters', 400);
        }
        result.specialization = trimmed;
    }
    if (status !== undefined && status !== null) {
        if (typeof status !== 'string') {
            throw new errors_1.AppError('status must be a string', 400);
        }
        const trimmedStatus = status.trim().toLowerCase();
        if (!ALLOWED_DOCTOR_STATUSES.includes(trimmedStatus)) {
            throw new errors_1.AppError(`Invalid status. Allowed values: ${ALLOWED_DOCTOR_STATUSES.join(', ')}`, 400);
        }
        result.status = trimmedStatus;
    }
    if (Object.keys(result).length === 0) {
        throw new errors_1.AppError('At least one field (fullName, specialization, status) must be provided to update', 400);
    }
    return result;
};
exports.validateUpdateDoctorProfileInput = validateUpdateDoctorProfileInput;
/**
 * Validates numeric ID parameters.
 */
const validateNumericId = (idParam, entityName = 'ID') => {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
        throw new errors_1.AppError(`${entityName} must be a positive integer`, 400);
    }
    return id;
};
exports.validateNumericId = validateNumericId;
const validateAppointmentId = (idParam) => {
    return (0, exports.validateNumericId)(idParam, 'Appointment ID');
};
exports.validateAppointmentId = validateAppointmentId;
const validatePatientIdParam = (idParam) => {
    return (0, exports.validateNumericId)(idParam, 'Patient ID');
};
exports.validatePatientIdParam = validatePatientIdParam;
