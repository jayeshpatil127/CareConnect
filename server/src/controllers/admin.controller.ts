import { Request, Response, NextFunction } from 'express';
import {
  validateAddDoctorInput,
  validateDoctorFilter,
  validateDoctorStatusUpdateInput,
  validateAddPatientInput,
  validatePatientFilter,
  validateAppointmentFilter,
  validateLogFilter,
  validateNumericId,
} from '../validators/admin.validator';
import { AdminService } from '../services/admin.service';

export class AdminController {
  /**
   * GET /api/admin/overview
   */
  public static async getOverview(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await AdminService.getOverview();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/doctors
   */
  public static async getDoctors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validateDoctorFilter(req.query);
      const doctors = await AdminService.getDoctors(filters);

      res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/doctors
   */
  public static async addDoctor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedInput = validateAddDoctorInput(req.body);
      const doctor = await AdminService.addDoctor(validatedInput, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Doctor account created successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/doctors/:id/status
   */
  public static async updateDoctorStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctorId = validateNumericId(req.params.id, 'Doctor ID');
      const { status } = validateDoctorStatusUpdateInput(req.body);
      const result = await AdminService.updateDoctorStatus(doctorId, status, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Doctor status updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/patients
   */
  public static async getPatients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validatePatientFilter(req.query);
      const patients = await AdminService.getPatients(filters);

      res.status(200).json({
        success: true,
        count: patients.length,
        data: patients,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/patients
   */
  public static async addPatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedInput = validateAddPatientInput(req.body);
      const patient = await AdminService.addPatient(validatedInput, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Patient account created successfully',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/appointments
   */
  public static async getAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validateAppointmentFilter(req.query);
      const appointments = await AdminService.getAppointments(filters);

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/logs
   */
  public static async getLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validateLogFilter(req.query);
      const logs = await AdminService.getLogs(filters);

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
