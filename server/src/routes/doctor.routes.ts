import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';
import { DoctorController } from '../controllers/doctor.controller';

const router = Router();

// Protect all doctor routes: require valid JWT and doctor role
router.use(authenticateToken, authorizeRole('doctor'));

// 1. Overview
router.get('/overview', DoctorController.getOverview);

// 2. Appointments
router.get('/appointments', DoctorController.getAppointments);
router.patch('/appointments/:id/status', DoctorController.updateAppointmentStatus);

// 3. Patients
router.get('/patients', DoctorController.getPatients);
router.get('/patients/:id', DoctorController.getPatientDetails);

// 4. Clinical Notes
router.get('/clinical-notes', DoctorController.getClinicalNotes);
router.post('/clinical-notes', DoctorController.createClinicalNote);

// 5. Profile
router.get('/profile', DoctorController.getProfile);
router.patch('/profile', DoctorController.updateProfile);

export default router;
