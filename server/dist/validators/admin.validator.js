"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNumericId = exports.validateLogFilter = exports.validateAppointmentFilter = exports.validatePatientFilter = exports.validateAddPatientInput = exports.validateDoctorStatusUpdateInput = exports.validateDoctorFilter = exports.validateAddDoctorInput = void 0;
const errors_1 = require("../utils/errors");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_DOCTOR_STATUSES = ['active', 'on-leave', 'inactive'];
const ALLOWED_APPOINTMENT_STATUSES = ['upcoming', 'in-progress', 'completed', 'cancelled'];
const ALLOWED_LOG_LEVELS = ['info', 'warning', 'error'];
const ALLOWED_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const validateAddDoctorInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { fullName, email, password, specialization, status } = body;
    // fullName
    if (!fullName || typeof fullName !== 'string') {
        throw new errors_1.AppError('Full name is required', 400);
    }
    const trimmedName = fullName.trim();
    if (trimmedName.length === 0 || trimmedName.length > 150) {
        throw new errors_1.AppError('Full name must be between 1 and 150 characters', 400);
    }
    // email
    if (!email || typeof email !== 'string') {
        throw new errors_1.AppError('Email is required', 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 255) {
        throw new errors_1.AppError('Please provide a valid email address', 400);
    }
    // password
    if (!password || typeof password !== 'string') {
        throw new errors_1.AppError('Password is required', 400);
    }
    if (password.length < 8) {
        throw new errors_1.AppError('Password must be at least 8 characters long', 400);
    }
    // specialization
    if (!specialization || typeof specialization !== 'string') {
        throw new errors_1.AppError('Specialization is required', 400);
    }
    const trimmedSpec = specialization.trim();
    if (trimmedSpec.length === 0 || trimmedSpec.length > 150) {
        throw new errors_1.AppError('Specialization must be between 1 and 150 characters', 400);
    }
    // status (optional, default active)
    let resolvedStatus = 'active';
    if (status !== undefined && status !== null) {
        if (typeof status !== 'string') {
            throw new errors_1.AppError('Status must be a string', 400);
        }
        const trimmedStatus = status.trim().toLowerCase();
        if (!ALLOWED_DOCTOR_STATUSES.includes(trimmedStatus)) {
            throw new errors_1.AppError(`Invalid status. Allowed values: ${ALLOWED_DOCTOR_STATUSES.join(', ')}`, 400);
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
exports.validateAddDoctorInput = validateAddDoctorInput;
const validateDoctorFilter = (query) => {
    const result = {};
    if (query.search !== undefined && query.search !== null) {
        if (typeof query.search !== 'string')
            throw new errors_1.AppError('Search query must be a string', 400);
        const trimmed = query.search.trim();
        if (trimmed.length > 0)
            result.search = trimmed;
    }
    if (query.status !== undefined && query.status !== null) {
        if (typeof query.status !== 'string')
            throw new errors_1.AppError('Status must be a string', 400);
        const trimmedStatus = query.status.trim().toLowerCase();
        if (!ALLOWED_DOCTOR_STATUSES.includes(trimmedStatus)) {
            throw new errors_1.AppError(`Invalid status filter. Allowed values: ${ALLOWED_DOCTOR_STATUSES.join(', ')}`, 400);
        }
        result.status = trimmedStatus;
    }
    return result;
};
exports.validateDoctorFilter = validateDoctorFilter;
const validateDoctorStatusUpdateInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { status } = body;
    if (status === undefined || status === null) {
        throw new errors_1.AppError('Status is required', 400);
    }
    if (typeof status !== 'string') {
        throw new errors_1.AppError('Status must be a string', 400);
    }
    const trimmedStatus = status.trim().toLowerCase();
    if (!ALLOWED_DOCTOR_STATUSES.includes(trimmedStatus)) {
        throw new errors_1.AppError(`Invalid status. Allowed values: ${ALLOWED_DOCTOR_STATUSES.join(', ')}`, 400);
    }
    return { status: trimmedStatus };
};
exports.validateDoctorStatusUpdateInput = validateDoctorStatusUpdateInput;
const validateAddPatientInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { fullName, email, password, bloodGroup, allergies, emergencyContactName, emergencyContactPhone } = body;
    // fullName
    if (!fullName || typeof fullName !== 'string') {
        throw new errors_1.AppError('Full name is required', 400);
    }
    const trimmedName = fullName.trim();
    if (trimmedName.length === 0 || trimmedName.length > 150) {
        throw new errors_1.AppError('Full name must be between 1 and 150 characters', 400);
    }
    // email
    if (!email || typeof email !== 'string') {
        throw new errors_1.AppError('Email is required', 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 255) {
        throw new errors_1.AppError('Please provide a valid email address', 400);
    }
    // password
    if (!password || typeof password !== 'string') {
        throw new errors_1.AppError('Password is required', 400);
    }
    if (password.length < 8) {
        throw new errors_1.AppError('Password must be at least 8 characters long', 400);
    }
    // optional bloodGroup
    let resolvedBloodGroup = null;
    if (bloodGroup !== undefined && bloodGroup !== null && bloodGroup !== '') {
        if (typeof bloodGroup !== 'string')
            throw new errors_1.AppError('Blood group must be a string', 400);
        const bg = bloodGroup.trim().toUpperCase();
        if (!ALLOWED_BLOOD_GROUPS.includes(bg)) {
            throw new errors_1.AppError(`Invalid blood group. Allowed: ${ALLOWED_BLOOD_GROUPS.join(', ')}`, 400);
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
exports.validateAddPatientInput = validateAddPatientInput;
const validatePatientFilter = (query) => {
    const result = {};
    if (query.search !== undefined && query.search !== null) {
        if (typeof query.search !== 'string')
            throw new errors_1.AppError('Search query must be a string', 400);
        const trimmed = query.search.trim();
        if (trimmed.length > 0)
            result.search = trimmed;
    }
    return result;
};
exports.validatePatientFilter = validatePatientFilter;
const validateAppointmentFilter = (query) => {
    const result = {};
    if (query.search !== undefined && query.search !== null) {
        if (typeof query.search !== 'string')
            throw new errors_1.AppError('Search query must be a string', 400);
        const trimmed = query.search.trim();
        if (trimmed.length > 0)
            result.search = trimmed;
    }
    if (query.status !== undefined && query.status !== null) {
        if (typeof query.status !== 'string')
            throw new errors_1.AppError('Status must be a string', 400);
        const trimmedStatus = query.status.trim().toLowerCase();
        if (!ALLOWED_APPOINTMENT_STATUSES.includes(trimmedStatus)) {
            throw new errors_1.AppError(`Invalid status filter. Allowed values: ${ALLOWED_APPOINTMENT_STATUSES.join(', ')}`, 400);
        }
        result.status = trimmedStatus;
    }
    return result;
};
exports.validateAppointmentFilter = validateAppointmentFilter;
const validateLogFilter = (query) => {
    const result = {};
    if (query.level !== undefined && query.level !== null) {
        if (typeof query.level !== 'string')
            throw new errors_1.AppError('Level filter must be a string', 400);
        const trimmedLevel = query.level.trim().toLowerCase();
        if (!ALLOWED_LOG_LEVELS.includes(trimmedLevel)) {
            throw new errors_1.AppError(`Invalid log level. Allowed values: ${ALLOWED_LOG_LEVELS.join(', ')}`, 400);
        }
        result.level = trimmedLevel;
    }
    return result;
};
exports.validateLogFilter = validateLogFilter;
const validateNumericId = (idParam, name = 'ID') => {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
        throw new errors_1.AppError(`${name} must be a positive integer`, 400);
    }
    return id;
};
exports.validateNumericId = validateNumericId;
