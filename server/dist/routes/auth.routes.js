"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', auth_controller_1.AuthController.register);
// POST /api/auth/login
router.post('/login', auth_controller_1.AuthController.login);
// GET /api/auth/me - Verify JWT and return current user profile
router.get('/me', auth_middleware_1.authenticateToken, auth_controller_1.AuthController.getMe);
exports.default = router;
