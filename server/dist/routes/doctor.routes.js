"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const doctor_controller_1 = require("../controllers/doctor.controller");
const router = (0, express_1.Router)();
// Protect all doctor routes: require valid JWT and doctor role
router.use(auth_middleware_1.authenticateToken, (0, role_middleware_1.authorizeRole)('doctor'));
// 1. Overview
router.get('/overview', doctor_controller_1.DoctorController.getOverview);
// 2. Appointments
router.get('/appointments', doctor_controller_1.DoctorController.getAppointments);
router.patch('/appointments/:id/status', doctor_controller_1.DoctorController.updateAppointmentStatus);
// 3. Patients
router.get('/patients', doctor_controller_1.DoctorController.getPatients);
router.get('/patients/:id', doctor_controller_1.DoctorController.getPatientDetails);
// 4. Clinical Notes
router.get('/clinical-notes', doctor_controller_1.DoctorController.getClinicalNotes);
router.post('/clinical-notes', doctor_controller_1.DoctorController.createClinicalNote);
// 5. Profile
router.get('/profile', doctor_controller_1.DoctorController.getProfile);
router.patch('/profile', doctor_controller_1.DoctorController.updateProfile);
exports.default = router;
