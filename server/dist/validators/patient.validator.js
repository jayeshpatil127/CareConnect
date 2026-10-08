"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGetMedicalHistoryFilter = exports.validateLogVitalsInput = exports.validateAppointmentId = exports.validateGetAppointmentsFilter = exports.validateBookAppointmentInput = void 0;
const errors_1 = require("../utils/errors");
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const ALLOWED_MODES = ['in-person', 'video'];
const ALLOWED_STATUSES = [
    'upcoming',
    'in-progress',
    'completed',
    'cancelled',
];
const ALLOWED_CATEGORIES = [
    'consultation',
    'prescription',
    'lab',
    'diagnosis',
    'follow-up',
];
const validateBookAppointmentInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { doctorId, appointmentDate, appointmentTime, room, mode, notes } = body;
    // doctorId validation
    if (doctorId === undefined || doctorId === null) {
        throw new errors_1.AppError('doctorId is required', 400);
    }
    const parsedDoctorId = Number(doctorId);
    if (!Number.isInteger(parsedDoctorId) || parsedDoctorId <= 0) {
        throw new errors_1.AppError('doctorId must be a positive integer', 400);
    }
    // appointmentDate validation
    if (!appointmentDate || typeof appointmentDate !== 'string') {
        throw new errors_1.AppError('appointmentDate is required in YYYY-MM-DD format', 400);
    }
    const trimmedDate = appointmentDate.trim();
    if (!DATE_REGEX.test(trimmedDate) || isNaN(Date.parse(trimmedDate))) {
        throw new errors_1.AppError('appointmentDate must be a valid date in YYYY-MM-DD format', 400);
    }
    // appointmentTime validation
    if (!appointmentTime || typeof appointmentTime !== 'string') {
        throw new errors_1.AppError('appointmentTime is required in HH:MM or HH:MM:SS format', 400);
    }
    const trimmedTime = appointmentTime.trim();
    if (!TIME_REGEX.test(trimmedTime)) {
        throw new errors_1.AppError('appointmentTime must be in HH:MM or HH:MM:SS format', 400);
    }
    // mode validation
    let validatedMode = 'in-person';
    if (mode !== undefined && mode !== null) {
        if (typeof mode !== 'string') {
            throw new errors_1.AppError("mode must be 'in-person' or 'video'", 400);
        }
        const trimmedMode = mode.trim().toLowerCase();
        if (!ALLOWED_MODES.includes(trimmedMode)) {
            throw new errors_1.AppError("mode must be either 'in-person' or 'video'", 400);
        }
        validatedMode = trimmedMode;
    }
    // room validation
    let validatedRoom = null;
    if (room !== undefined && room !== null) {
        if (typeof room !== 'string') {
            throw new errors_1.AppError('room must be a string', 400);
        }
        const trimmedRoom = room.trim();
        if (trimmedRoom.length > 50) {
            throw new errors_1.AppError('room cannot exceed 50 characters', 400);
        }
        validatedRoom = trimmedRoom.length > 0 ? trimmedRoom : null;
    }
    // notes validation
    let validatedNotes = null;
    if (notes !== undefined && notes !== null) {
        if (typeof notes !== 'string') {
            throw new errors_1.AppError('notes must be a string', 400);
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
exports.validateBookAppointmentInput = validateBookAppointmentInput;
const validateGetAppointmentsFilter = (query) => {
    const result = {};
    if (query.status !== undefined && query.status !== null) {
        if (typeof query.status !== 'string') {
            throw new errors_1.AppError('status filter must be a string', 400);
        }
        const trimmedStatus = query.status.trim().toLowerCase();
        if (!ALLOWED_STATUSES.includes(trimmedStatus)) {
            throw new errors_1.AppError(`Invalid status filter. Allowed values: ${ALLOWED_STATUSES.join(', ')}`, 400);
        }
        result.status = trimmedStatus;
    }
    if (query.search !== undefined && query.search !== null) {
        if (typeof query.search !== 'string') {
            throw new errors_1.AppError('search query must be a string', 400);
        }
        const trimmedSearch = query.search.trim();
        if (trimmedSearch.length > 0) {
            result.search = trimmedSearch;
        }
    }
    return result;
};
exports.validateGetAppointmentsFilter = validateGetAppointmentsFilter;
const validateAppointmentId = (idParam) => {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
        throw new errors_1.AppError('Appointment ID must be a positive integer', 400);
    }
    return id;
};
exports.validateAppointmentId = validateAppointmentId;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?|T\d{2}:\d{2}(:\d{2})?)?$/;
const validateLogVitalsInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { bloodPressure, heartRate, bloodGlucose, weight, spo2, recordedAt } = body;
    // At least one vital field must be provided
    const anyProvided = [bloodPressure, heartRate, bloodGlucose, weight, spo2].some((v) => v !== undefined && v !== null && v !== '');
    if (!anyProvided) {
        throw new errors_1.AppError('At least one vital field (bloodPressure, heartRate, bloodGlucose, weight, spo2) must be provided', 400);
    }
    // bloodPressure: optional, VARCHAR(20), format like "120/80"
    let validatedBP = null;
    if (bloodPressure !== undefined && bloodPressure !== null && bloodPressure !== '') {
        if (typeof bloodPressure !== 'string') {
            throw new errors_1.AppError('bloodPressure must be a string (e.g. "120/80")', 400);
        }
        const trimmedBP = bloodPressure.trim();
        if (trimmedBP.length > 20) {
            throw new errors_1.AppError('bloodPressure cannot exceed 20 characters', 400);
        }
        validatedBP = trimmedBP.length > 0 ? trimmedBP : null;
    }
    // heartRate: optional, SMALLINT UNSIGNED (0-65535, realistically 0-300)
    let validatedHR = null;
    if (heartRate !== undefined && heartRate !== null && heartRate !== '') {
        const hrNum = Number(heartRate);
        if (isNaN(hrNum) || !Number.isInteger(hrNum) || hrNum < 0 || hrNum > 300) {
            throw new errors_1.AppError('heartRate must be an integer between 0 and 300', 400);
        }
        validatedHR = hrNum;
    }
    // bloodGlucose: optional, DECIMAL(6,1)
    let validatedBG = null;
    if (bloodGlucose !== undefined && bloodGlucose !== null && bloodGlucose !== '') {
        const bgNum = Number(bloodGlucose);
        if (isNaN(bgNum) || bgNum < 0 || bgNum > 99999.9) {
            throw new errors_1.AppError('bloodGlucose must be a non-negative number (mg/dL)', 400);
        }
        validatedBG = Math.round(bgNum * 10) / 10;
    }
    // weight: optional, DECIMAL(6,2)
    let validatedWeight = null;
    if (weight !== undefined && weight !== null && weight !== '') {
        const wNum = Number(weight);
        if (isNaN(wNum) || wNum < 0 || wNum > 9999.99) {
            throw new errors_1.AppError('weight must be a non-negative number (kg)', 400);
        }
        validatedWeight = Math.round(wNum * 100) / 100;
    }
    // spo2: optional, TINYINT UNSIGNED, must be 0-100
    let validatedSpo2 = null;
    if (spo2 !== undefined && spo2 !== null && spo2 !== '') {
        const spo2Num = Number(spo2);
        if (isNaN(spo2Num) || !Number.isInteger(spo2Num) || spo2Num < 0 || spo2Num > 100) {
            throw new errors_1.AppError('spo2 must be an integer between 0 and 100 (percentage)', 400);
        }
        validatedSpo2 = spo2Num;
    }
    // recordedAt: optional, defaults to current UTC datetime if not provided
    let validatedRecordedAt;
    if (recordedAt !== undefined && recordedAt !== null && recordedAt !== '') {
        if (typeof recordedAt !== 'string') {
            throw new errors_1.AppError('recordedAt must be a valid datetime string', 400);
        }
        const trimmedDT = recordedAt.trim();
        if (!DATETIME_REGEX.test(trimmedDT) || isNaN(Date.parse(trimmedDT))) {
            throw new errors_1.AppError('recordedAt must be a valid datetime in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format', 400);
        }
        validatedRecordedAt = trimmedDT.replace('T', ' ');
    }
    else {
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
exports.validateLogVitalsInput = validateLogVitalsInput;
const validateGetMedicalHistoryFilter = (query) => {
    const result = {};
    if (query.category !== undefined && query.category !== null) {
        if (typeof query.category !== 'string') {
            throw new errors_1.AppError('category filter must be a string', 400);
        }
        const trimmedCategory = query.category.trim().toLowerCase();
        if (!ALLOWED_CATEGORIES.includes(trimmedCategory)) {
            throw new errors_1.AppError(`Invalid category filter. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`, 400);
        }
        result.category = trimmedCategory;
    }
    return result;
};
exports.validateGetMedicalHistoryFilter = validateGetMedicalHistoryFilter;
