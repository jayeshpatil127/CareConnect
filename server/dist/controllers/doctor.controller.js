"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const doctor_validator_1 = require("../validators/doctor.validator");
const doctor_service_1 = require("../services/doctor.service");
class DoctorController {
    /**
     * GET /api/doctor/overview
     * Retrieves dashboard metrics (today's schedule, active patients, pending consultations).
     */
    static async getOverview(req, res, next) {
        try {
            const overviewData = await doctor_service_1.DoctorService.getOverview(req.user.userId);
            res.status(200).json({
                success: true,
                data: overviewData,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/doctor/appointments
     * Retrieves all appointments for the authenticated doctor with optional status filtering.
     */
    static async getAppointments(req, res, next) {
        try {
            const filters = (0, doctor_validator_1.validateDoctorAppointmentsFilter)(req.query);
            const appointments = await doctor_service_1.DoctorService.getAppointments(req.user.userId, filters);
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
     * PATCH /api/doctor/appointments/:id/status
     * Updates the status of an appointment belonging to the authenticated doctor.
     */
    static async updateAppointmentStatus(req, res, next) {
        try {
            const appointmentId = (0, doctor_validator_1.validateAppointmentId)(req.params.id);
            const { status } = (0, doctor_validator_1.validateUpdateAppointmentStatusInput)(req.body);
            const result = await doctor_service_1.DoctorService.updateAppointmentStatus(req.user.userId, appointmentId, status);
            res.status(200).json({
                success: true,
                message: 'Appointment status updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/doctor/patients
     * Retrieves patients assigned to/seen by the authenticated doctor with optional search.
     */
    static async getPatients(req, res, next) {
        try {
            const filters = (0, doctor_validator_1.validateDoctorPatientsFilter)(req.query);
            const patients = await doctor_service_1.DoctorService.getPatients(req.user.userId, filters);
            res.status(200).json({
                success: true,
                count: patients.length,
                data: patients,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/doctor/patients/:id
     * Retrieves detailed patient information, consultation history, and clinical notes.
     */
    static async getPatientDetails(req, res, next) {
        try {
            const patientId = (0, doctor_validator_1.validatePatientIdParam)(req.params.id);
            const patient = await doctor_service_1.DoctorService.getPatientDetails(req.user.userId, patientId);
            res.status(200).json({
                success: true,
                data: patient,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/doctor/clinical-notes
     * Retrieves clinical notes authored by the authenticated doctor.
     */
    static async getClinicalNotes(req, res, next) {
        try {
            const filters = (0, doctor_validator_1.validateClinicalNotesFilter)(req.query);
            const notes = await doctor_service_1.DoctorService.getClinicalNotes(req.user.userId, filters);
            res.status(200).json({
                success: true,
                count: notes.length,
                data: notes,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/doctor/clinical-notes
     * Creates a new clinical note with diagnosis, treatment, and follow-up.
     */
    static async createClinicalNote(req, res, next) {
        try {
            const validatedInput = (0, doctor_validator_1.validateCreateClinicalNoteInput)(req.body);
            const note = await doctor_service_1.DoctorService.createClinicalNote(req.user.userId, validatedInput);
            res.status(201).json({
                success: true,
                message: 'Clinical note created successfully',
                data: note,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/doctor/profile
     * Retrieves the authenticated doctor's profile.
     */
    static async getProfile(req, res, next) {
        try {
            const profile = await doctor_service_1.DoctorService.getProfile(req.user.userId);
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/doctor/profile
     * Updates the authenticated doctor's profile.
     */
    static async updateProfile(req, res, next) {
        try {
            const validatedInput = (0, doctor_validator_1.validateUpdateDoctorProfileInput)(req.body);
            const updatedProfile = await doctor_service_1.DoctorService.updateProfile(req.user.userId, validatedInput);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedProfile,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DoctorController = DoctorController;
