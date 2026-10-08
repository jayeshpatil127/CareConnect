"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLoginInput = exports.validateRegisterInput = void 0;
const errors_1 = require("../utils/errors");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ['patient', 'doctor', 'admin'];
const validateRegisterInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { fullName, email, password, role } = body;
    // fullName validation
    if (!fullName || typeof fullName !== 'string') {
        throw new errors_1.AppError('Full name is required', 400);
    }
    const trimmedName = fullName.trim();
    if (trimmedName.length === 0) {
        throw new errors_1.AppError('Full name cannot be empty', 400);
    }
    if (trimmedName.length > 150) {
        throw new errors_1.AppError('Full name cannot exceed 150 characters', 400);
    }
    // email validation
    if (!email || typeof email !== 'string') {
        throw new errors_1.AppError('Email is required', 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
        throw new errors_1.AppError('Please provide a valid email address', 400);
    }
    if (normalizedEmail.length > 255) {
        throw new errors_1.AppError('Email cannot exceed 255 characters', 400);
    }
    // password validation
    if (!password || typeof password !== 'string') {
        throw new errors_1.AppError('Password is required', 400);
    }
    if (password.length < 8) {
        throw new errors_1.AppError('Password must be at least 8 characters long', 400);
    }
    // role validation
    if (!role || typeof role !== 'string') {
        throw new errors_1.AppError('Role is required', 400);
    }
    const trimmedRole = role.trim().toLowerCase();
    if (!ALLOWED_ROLES.includes(trimmedRole)) {
        throw new errors_1.AppError(`Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}`, 400);
    }
    return {
        fullName: trimmedName,
        email: normalizedEmail,
        password,
        role: trimmedRole,
    };
};
exports.validateRegisterInput = validateRegisterInput;
const validateLoginInput = (body) => {
    if (!body || typeof body !== 'object') {
        throw new errors_1.AppError('Request body is required and must be an object', 400);
    }
    const { email, password } = body;
    // email validation
    if (!email || typeof email !== 'string') {
        throw new errors_1.AppError('Email is required', 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
        throw new errors_1.AppError('Please provide a valid email address', 400);
    }
    // password validation
    if (!password || typeof password !== 'string') {
        throw new errors_1.AppError('Password is required', 400);
    }
    if (password.length === 0) {
        throw new errors_1.AppError('Password cannot be empty', 400);
    }
    // Note: any 'role' field passed in the request body is intentionally ignored here.
    // The server strictly reads the role from the database.
    return {
        email: normalizedEmail,
        password,
    };
};
exports.validateLoginInput = validateLoginInput;
