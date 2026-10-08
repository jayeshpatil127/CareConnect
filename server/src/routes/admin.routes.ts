import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

// Protect all admin routes: require valid JWT and admin role
router.use(authenticateToken, authorizeRole('admin'));

// 1. Overview
router.get('/overview', AdminController.getOverview);

// 2. Doctors
router.get('/doctors', AdminController.getDoctors);
router.post('/doctors', AdminController.addDoctor);
router.patch('/doctors/:id/status', AdminController.updateDoctorStatus);

// 3. Patients
router.get('/patients', AdminController.getPatients);
router.post('/patients', AdminController.addPatient);

// 4. Appointments
router.get('/appointments', AdminController.getAppointments);

// 5. System Logs
router.get('/logs', AdminController.getLogs);

export default router;
