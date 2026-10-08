"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
require("../types/auth");
/**
 * Authentication middleware that verifies JWT bearer tokens.
 *
 * Extraction:
 * Expects header format: "Authorization: Bearer <token>"
 *
 * Behavior:
 * - Missing or malformed header -> HTTP 401 "Authentication required"
 * - Invalid, expired, or tampered token -> HTTP 401 "Invalid or expired token"
 * - Valid token -> populates req.user with { userId, role } and calls next()
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }
    // Header must strictly match format: Bearer <token>
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }
    const token = parts[1].trim();
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
exports.authenticateToken = authenticateToken;
