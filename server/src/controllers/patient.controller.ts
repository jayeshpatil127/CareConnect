import { Request, Response, NextFunction } from 'express';
import {
  validateBookAppointmentInput,
  validateGetAppointmentsFilter,
  validateAppointmentId,
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
}
