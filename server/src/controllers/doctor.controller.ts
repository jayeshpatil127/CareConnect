import { Request, Response, NextFunction } from 'express';
import {
  validateDoctorAppointmentsFilter,
  validateUpdateAppointmentStatusInput,
  validateAppointmentId,
} from '../validators/doctor.validator';
import { DoctorService } from '../services/doctor.service';

export class DoctorController {
  /**
   * GET /api/doctor/appointments
   * Retrieves all appointments for the authenticated doctor with optional status filtering.
   */
  public static async getAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validateDoctorAppointmentsFilter(req.query);
      const appointments = await DoctorService.getAppointments(
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
   * PATCH /api/doctor/appointments/:id/status
   * Updates the status of an appointment belonging to the authenticated doctor.
   */
  public static async updateAppointmentStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointmentId = validateAppointmentId(req.params.id);
      const { status } = validateUpdateAppointmentStatusInput(req.body);

      const result = await DoctorService.updateAppointmentStatus(
        req.user!.userId,
        appointmentId,
        status
      );

      res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
