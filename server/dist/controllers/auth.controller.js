"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_validator_1 = require("../validators/auth.validator");
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res, next) {
        try {
            // 1. Strictly validate and sanitize input fields
            const validatedData = (0, auth_validator_1.validateRegisterInput)(req.body);
            // 2. Delegate to service for business logic and database persistence
            const user = await auth_service_1.AuthService.register(validatedData);
            // 3. Return standardized 201 Created response
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            // 1. Strictly validate login input fields (email format, password present)
            const validatedData = (0, auth_validator_1.validateLoginInput)(req.body);
            // 2. Delegate to service for credential verification and JWT generation
            const result = await auth_service_1.AuthService.login(validatedData);
            // 3. Return standardized 200 OK response
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            const user = await auth_service_1.AuthService.getMe(req.user.userId);
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
