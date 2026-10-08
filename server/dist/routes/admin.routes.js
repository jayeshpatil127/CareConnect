"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Protect all admin routes: require valid JWT and admin role
router.use(auth_middleware_1.authenticateToken, (0, role_middleware_1.authorizeRole)('admin'));
// 1. Overview
router.get('/overview', admin_controller_1.AdminController.getOverview);
// 2. Doctors
router.get('/doctors', admin_controller_1.AdminController.getDoctors);
router.post('/doctors', admin_controller_1.AdminController.addDoctor);
router.patch('/doctors/:id/status', admin_controller_1.AdminController.updateDoctorStatus);
// 3. Patients
router.get('/patients', admin_controller_1.AdminController.getPatients);
router.post('/patients', admin_controller_1.AdminController.addPatient);
// 4. Appointments
router.get('/appointments', admin_controller_1.AdminController.getAppointments);
// 5. System Logs
router.get('/logs', admin_controller_1.AdminController.getLogs);
exports.default = router;
