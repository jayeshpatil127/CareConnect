"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const patient_validator_1 = require("../validators/patient.validator");
const patient_service_1 = require("../services/patient.service");
class PatientController {
    /**
     * GET /api/patient/appointments
     * Retrieves all appointments for the authenticated patient with optional search & filter.
     */
    static async getAppointments(req, res, next) {
        try {
            const filters = (0, patient_validator_1.validateGetAppointmentsFilter)(req.query);
            const appointments = await patient_service_1.PatientService.getAppointments(req.user.userId, filters);
            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/patient/appointments
     * Books a new appointment for the authenticated patient.
     */
    static async bookAppointment(req, res, next) {
        try {
            const validatedInput = (0, patient_validator_1.validateBookAppointmentInput)(req.body);
            const appointment = await patient_service_1.PatientService.bookAppointment(req.user.userId, validatedInput);
            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully',
                data: appointment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/patient/appointments/:id/cancel
     * Cancels an appointment belonging to the authenticated patient.
     */
    static async cancelAppointment(req, res, next) {
        try {
            const appointmentId = (0, patient_validator_1.validateAppointmentId)(req.params.id);
            const result = await patient_service_1.PatientService.cancelAppointment(req.user.userId, appointmentId);
            res.status(200).json({
                success: true,
                message: 'Appointment cancelled successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/patient/vitals
     * Returns the authenticated patient's full vitals history.
     */
    static async getVitals(req, res, next) {
        try {
            const vitals = await patient_service_1.PatientService.getVitals(req.user.userId);
            res.status(200).json({
                success: true,
                count: vitals.length,
                data: vitals,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/patient/vitals
     * Logs a new vital record for the authenticated patient.
     * patient_id is derived from the JWT, never from the request body.
     */
    static async logVital(req, res, next) {
        try {
            const validatedInput = (0, patient_validator_1.validateLogVitalsInput)(req.body);
            const vital = await patient_service_1.PatientService.logVital(req.user.userId, validatedInput);
            res.status(201).json({
                success: true,
                message: 'Vital record saved successfully',
                data: vital,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/patient/medical-history
     * Retrieves the authenticated patient's medical history.
     * Supports optional filtering by category.
     */
    static async getMedicalHistory(req, res, next) {
        try {
            const filters = (0, patient_validator_1.validateGetMedicalHistoryFilter)(req.query);
            const history = await patient_service_1.PatientService.getMedicalHistory(req.user.userId, filters);
            res.status(200).json({
                success: true,
                count: history.length,
                data: history,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/patient/prescriptions
     * Retrieves the authenticated patient's prescriptions.
     */
    static async getPrescriptions(req, res, next) {
        try {
            const prescriptions = await patient_service_1.PatientService.getPrescriptions(req.user.userId);
            res.status(200).json({
                success: true,
                count: prescriptions.length,
                data: prescriptions,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PatientController = PatientController;
