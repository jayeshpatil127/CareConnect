"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const patient_controller_1 = require("../controllers/patient.controller");
const router = (0, express_1.Router)();
// Protect all patient routes: require valid JWT and patient role
router.use(auth_middleware_1.authenticateToken, (0, role_middleware_1.authorizeRole)('patient'));
// GET /api/patient/doctors  — returns active doctors for appointment booking
router.get('/doctors', patient_controller_1.PatientController.getActiveDoctors);
// GET /api/patient/appointments
router.get('/appointments', patient_controller_1.PatientController.getAppointments);
// POST /api/patient/appointments
router.post('/appointments', patient_controller_1.PatientController.bookAppointment);
// PATCH /api/patient/appointments/:id/cancel
router.patch('/appointments/:id/cancel', patient_controller_1.PatientController.cancelAppointment);
// GET /api/patient/vitals
router.get('/vitals', patient_controller_1.PatientController.getVitals);
// POST /api/patient/vitals
router.post('/vitals', patient_controller_1.PatientController.logVital);
// GET /api/patient/medical-history
router.get('/medical-history', patient_controller_1.PatientController.getMedicalHistory);
// GET /api/patient/prescriptions
router.get('/prescriptions', patient_controller_1.PatientController.getPrescriptions);
exports.default = router;
