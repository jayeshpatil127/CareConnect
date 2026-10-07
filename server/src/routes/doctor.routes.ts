import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';
import { DoctorController } from '../controllers/doctor.controller';

const router = Router();

// Protect all doctor routes: require valid JWT and doctor role
router.use(authenticateToken, authorizeRole('doctor'));

// GET /api/doctor/appointments
router.get('/appointments', DoctorController.getAppointments);

// PATCH /api/doctor/appointments/:id/status
router.patch('/appointments/:id/status', DoctorController.updateAppointmentStatus);

export default router;
