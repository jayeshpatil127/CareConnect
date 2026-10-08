"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const notFound_1 = require("./middleware/notFound");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Lightweight request logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'CareConnect API is running',
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/patient', patient_routes_1.default);
app.use('/api/doctor', doctor_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/test', test_routes_1.default);
// 404 handler
app.use(notFound_1.notFoundHandler);
// Centralized error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
