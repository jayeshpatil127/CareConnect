"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// General protected test endpoint
router.get('/protected', auth_middleware_1.authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Protected route accessed successfully',
        data: {
            user: req.user,
        },
    });
});
// Admin-only protected test endpoint
router.get('/admin', auth_middleware_1.authenticateToken, (0, role_middleware_1.authorizeRole)('admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin route accessed successfully',
        data: {
            user: req.user,
        },
    });
});
// Doctor-only protected test endpoint
router.get('/doctor', auth_middleware_1.authenticateToken, (0, role_middleware_1.authorizeRole)('doctor'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Doctor route accessed successfully',
        data: {
            user: req.user,
        },
    });
});
// Patient-only protected test endpoint
router.get('/patient', auth_middleware_1.authenticateToken, (0, role_middleware_1.authorizeRole)('patient'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Patient route accessed successfully',
        data: {
            user: req.user,
        },
    });
});
exports.default = router;
