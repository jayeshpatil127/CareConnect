import { Request, Response, NextFunction } from 'express';
import {
  validateBookAppointmentInput,
  validateGetAppointmentsFilter,
  validateAppointmentId,
  validateLogVitalsInput,
  validateGetMedicalHistoryFilter,
} from '../validators/patient.validator';
import { PatientService } from '../services/patient.service';

export class PatientController {
  /**
   * GET /api/patient/appointments
   * Retrieves all appointments for the authenticated patient with optional search & filter.
   */
  public static async getAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validateGetAppointmentsFilter(req.query);
      const appointments = await PatientService.getAppointments(
        req.user!.userId,
        filters
      );

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
   * POST /api/patient/appointments
   * Books a new appointment for the authenticated patient.
   */
  public static async bookAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedInput = validateBookAppointmentInput(req.body);
      const appointment = await PatientService.bookAppointment(
        req.user!.userId,
        validatedInput
      );

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/patient/appointments/:id/cancel
   * Cancels an appointment belonging to the authenticated patient.
   */
  public static async cancelAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointmentId = validateAppointmentId(req.params.id);
      const result = await PatientService.cancelAppointment(
        req.user!.userId,
        appointmentId
      );

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patient/vitals
   * Returns the authenticated patient's full vitals history.
   */
  public static async getVitals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const vitals = await PatientService.getVitals(req.user!.userId);

      res.status(200).json({
        success: true,
        count: vitals.length,
        data: vitals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/patient/vitals
   * Logs a new vital record for the authenticated patient.
   * patient_id is derived from the JWT, never from the request body.
   */
  public static async logVital(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedInput = validateLogVitalsInput(req.body);
      const vital = await PatientService.logVital(req.user!.userId, validatedInput);

      res.status(201).json({
        success: true,
        message: 'Vital record saved successfully',
        data: vital,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patient/medical-history
   * Retrieves the authenticated patient's medical history.
   * Supports optional filtering by category.
   */
  public static async getMedicalHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validateGetMedicalHistoryFilter(req.query);
      const history = await PatientService.getMedicalHistory(
        req.user!.userId,
        filters
      );

      res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}
