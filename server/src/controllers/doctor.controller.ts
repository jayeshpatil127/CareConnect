import { Request, Response, NextFunction } from 'express';
import {
  validateDoctorAppointmentsFilter,
  validateUpdateAppointmentStatusInput,
  validateAppointmentId,
  validateDoctorPatientsFilter,
  validatePatientIdParam,
  validateCreateClinicalNoteInput,
  validateClinicalNotesFilter,
  validateUpdateDoctorProfileInput,
} from '../validators/doctor.validator';
import { DoctorService } from '../services/doctor.service';

export class DoctorController {
  /**
   * GET /api/doctor/overview
   * Retrieves dashboard metrics (today's schedule, active patients, pending consultations).
   */
  public static async getOverview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const overviewData = await DoctorService.getOverview(req.user!.userId);

      res.status(200).json({
        success: true,
        data: overviewData,
      });
    } catch (error) {
      next(error);
    }
  }

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

  /**
   * GET /api/doctor/patients
   * Retrieves patients assigned to/seen by the authenticated doctor with optional search.
   */
  public static async getPatients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validateDoctorPatientsFilter(req.query);
      const patients = await DoctorService.getPatients(req.user!.userId, filters);

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
   * GET /api/doctor/patients/:id
   * Retrieves detailed patient information, consultation history, and clinical notes.
   */
  public static async getPatientDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId = validatePatientIdParam(req.params.id);
      const patient = await DoctorService.getPatientDetails(
        req.user!.userId,
        patientId
      );

      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/doctor/clinical-notes
   * Retrieves clinical notes authored by the authenticated doctor.
   */
  public static async getClinicalNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = validateClinicalNotesFilter(req.query);
      const notes = await DoctorService.getClinicalNotes(
        req.user!.userId,
        filters
      );

      res.status(200).json({
        success: true,
        count: notes.length,
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/doctor/clinical-notes
   * Creates a new clinical note with diagnosis, treatment, and follow-up.
   */
  public static async createClinicalNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedInput = validateCreateClinicalNoteInput(req.body);
      const note = await DoctorService.createClinicalNote(
        req.user!.userId,
        validatedInput
      );

      res.status(201).json({
        success: true,
        message: 'Clinical note created successfully',
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/doctor/profile
   * Retrieves the authenticated doctor's profile.
   */
  public static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await DoctorService.getProfile(req.user!.userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/doctor/profile
   * Updates the authenticated doctor's profile.
   */
  public static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedInput = validateUpdateDoctorProfileInput(req.body);
      const updatedProfile = await DoctorService.updateProfile(
        req.user!.userId,
        validatedInput
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
}
