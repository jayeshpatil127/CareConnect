"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_validator_1 = require("../validators/admin.validator");
const admin_service_1 = require("../services/admin.service");
class AdminController {
    /**
     * GET /api/admin/overview
     */
    static async getOverview(_req, res, next) {
        try {
            const stats = await admin_service_1.AdminService.getOverview();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/doctors
     */
    static async getDoctors(req, res, next) {
        try {
            const filters = (0, admin_validator_1.validateDoctorFilter)(req.query);
            const doctors = await admin_service_1.AdminService.getDoctors(filters);
            res.status(200).json({
                success: true,
                count: doctors.length,
                data: doctors,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/admin/doctors
     */
    static async addDoctor(req, res, next) {
        try {
            const validatedInput = (0, admin_validator_1.validateAddDoctorInput)(req.body);
            const doctor = await admin_service_1.AdminService.addDoctor(validatedInput, req.user.userId);
            res.status(201).json({
                success: true,
                message: 'Doctor account created successfully',
                data: doctor,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/admin/doctors/:id/status
     */
    static async updateDoctorStatus(req, res, next) {
        try {
            const doctorId = (0, admin_validator_1.validateNumericId)(req.params.id, 'Doctor ID');
            const { status } = (0, admin_validator_1.validateDoctorStatusUpdateInput)(req.body);
            const result = await admin_service_1.AdminService.updateDoctorStatus(doctorId, status, req.user.userId);
            res.status(200).json({
                success: true,
                message: 'Doctor status updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/patients
     */
    static async getPatients(req, res, next) {
        try {
            const filters = (0, admin_validator_1.validatePatientFilter)(req.query);
            const patients = await admin_service_1.AdminService.getPatients(filters);
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
     * POST /api/admin/patients
     */
    static async addPatient(req, res, next) {
        try {
            const validatedInput = (0, admin_validator_1.validateAddPatientInput)(req.body);
            const patient = await admin_service_1.AdminService.addPatient(validatedInput, req.user.userId);
            res.status(201).json({
                success: true,
                message: 'Patient account created successfully',
                data: patient,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/appointments
     */
    static async getAppointments(req, res, next) {
        try {
            const filters = (0, admin_validator_1.validateAppointmentFilter)(req.query);
            const appointments = await admin_service_1.AdminService.getAppointments(filters);
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
     * GET /api/admin/logs
     */
    static async getLogs(req, res, next) {
        try {
            const filters = (0, admin_validator_1.validateLogFilter)(req.query);
            const logs = await admin_service_1.AdminService.getLogs(filters);
            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
