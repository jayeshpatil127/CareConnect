import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { AppError } from '../utils/errors';
import {
  GetDoctorAppointmentsFilterDTO,
  DoctorAppointmentUpdateStatus,
} from '../validators/doctor.validator';

export interface DoctorAppointmentItem {
  id: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  room: string | null;
  mode: string;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: number;
    fullName: string;
  };
}

export interface UpdatedAppointmentResult {
  id: number;
  status: DoctorAppointmentUpdateStatus;
}

export class DoctorService {
  /**
   * Resolves the doctor's record ID from the authenticated user's ID.
   * Ensures doctor_id is NEVER trusted from client inputs.
   */
  public static async resolveDoctorId(userId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      throw new AppError('Doctor profile not found for this user', 404);
    }

    return rows[0].id;
  }

  /**
   * Retrieves appointments belonging exclusively to the authenticated doctor,
   * supporting optional status filtering.
   */
  public static async getAppointments(
    userId: number,
    filters: GetDoctorAppointmentsFilterDTO
  ): Promise<DoctorAppointmentItem[]> {
    const doctorId = await this.resolveDoctorId(userId);

    let sql = `
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.room,
        a.mode,
        a.notes,
        a.status,
        a.created_at,
        a.updated_at,
        p.id AS patient_id,
        u.full_name AS patient_name
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users u ON p.user_id = u.id
      WHERE a.doctor_id = ?
    `;

    const params: (string | number)[] = [doctorId];

    if (filters.status) {
      sql += ' AND a.status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

      return rows.map((row) => ({
        id: row.id,
        patientName: row.patient_name,
        appointmentDate: row.appointment_date,
        appointmentTime: row.appointment_time,
        room: row.room,
        mode: row.mode,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        patient: {
          id: row.patient_id,
          fullName: row.patient_name,
        },
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to retrieve doctor appointments:', error.message || error);
      throw new AppError('Failed to retrieve appointments', 500);
    }
  }

  /**
   * Updates an appointment status for an appointment belonging strictly to the authenticated doctor.
   */
  public static async updateAppointmentStatus(
    userId: number,
    appointmentId: number,
    newStatus: DoctorAppointmentUpdateStatus
  ): Promise<UpdatedAppointmentResult> {
    const doctorId = await this.resolveDoctorId(userId);

    // Verify appointment exists and belongs to that doctor
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, doctor_id, status FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (rows.length === 0) {
      throw new AppError('Appointment not found', 404);
    }

    const appointment = rows[0];

    // Enforce ownership: appointment must belong to the authenticated doctor
    if (appointment.doctor_id !== doctorId) {
      throw new AppError('Appointment not found or inaccessible', 404);
    }

    try {
      await pool.execute<ResultSetHeader>(
        'UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?',
        [newStatus, appointmentId, doctorId]
      );

      return {
        id: appointmentId,
        status: newStatus,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to update appointment status:', error.message || error);
      throw new AppError('Failed to update appointment status', 500);
    }
  }
}
