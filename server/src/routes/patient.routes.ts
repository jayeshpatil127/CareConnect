import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';
import { PatientController } from '../controllers/patient.controller';

const router = Router();

// Protect all patient routes: require valid JWT and patient role
router.use(authenticateToken, authorizeRole('patient'));

// GET /api/patient/appointments
router.get('/appointments', PatientController.getAppointments);

// POST /api/patient/appointments
router.post('/appointments', PatientController.bookAppointment);

// PATCH /api/patient/appointments/:id/cancel
router.patch('/appointments/:id/cancel', PatientController.cancelAppointment);

// GET /api/patient/vitals
router.get('/vitals', PatientController.getVitals);

// POST /api/patient/vitals
router.post('/vitals', PatientController.logVital);

export default router;
