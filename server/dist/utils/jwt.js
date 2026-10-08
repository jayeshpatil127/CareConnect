"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errors_1 = require("./errors");
/**
 * Signs a JWT token with the provided identity payload.
 *
 * @param payload - Minimal identity payload containing userId and role
 * @returns signed JWT string
 */
const signToken = (payload) => {
    const secret = config_1.config.jwt.secret;
    if (!secret) {
        throw new errors_1.AppError('Server configuration error: JWT_SECRET is not configured', 500);
    }
    try {
        const options = {
            expiresIn: config_1.config.jwt.expiresIn,
        };
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    catch (error) {
        console.error('JWT sign error:', error.message || error);
        throw new errors_1.AppError('Failed to generate authentication token', 500);
    }
};
exports.signToken = signToken;
/**
 * Verifies a JWT token and returns the decoded payload.
 * Validates token signature, expiration, and required payload fields.
 *
 * @param token - JWT token string
 * @returns Decoded token payload
 */
const verifyToken = (token) => {
    const secret = config_1.config.jwt.secret;
    if (!secret) {
        throw new errors_1.AppError('Server configuration error: JWT_SECRET is not configured', 500);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded.userId || !decoded.role) {
            throw new errors_1.AppError('Invalid or expired token', 401);
        }
        return {
            userId: decoded.userId,
            role: decoded.role,
        };
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            throw error;
        }
        throw new errors_1.AppError('Invalid or expired token', 401);
    }
};
exports.verifyToken = verifyToken;
