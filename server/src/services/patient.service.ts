import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { AppError } from '../utils/errors';
import {
  BookAppointmentDTO,
  GetAppointmentsFilterDTO,
  LogVitalsDTO,
} from '../validators/patient.validator';

export interface DoctorDetails {
  id: number;
  fullName: string;
  specialization: string;
  status: string;
}

export interface AppointmentItem {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  room: string | null;
  mode: string;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  doctor: DoctorDetails;
}

export interface BookedAppointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  room: string | null;
  mode: string;
  notes: string | null;
  status: string;
}

export interface VitalRecord {
  id: number;
  bloodPressure: string | null;
  heartRate: number | null;
  bloodGlucose: number | null;
  weight: number | null;
  spo2: number | null;
  recordedAt: string;
  createdAt: string;
}

export class PatientService {
  /**
   * Resolves the patient's record ID from the authenticated user's ID.
   * Ensures patientId is NEVER trusted from request body.
   */
  public static async resolvePatientId(userId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      throw new AppError('Patient profile not found for this user', 404);
    }

    return rows[0].id;
  }

  /**
   * Retrieves appointments belonging exclusively to the authenticated patient,
   * supporting optional search by doctor name/specialty and status filtering.
   */
  public static async getAppointments(
    userId: number,
    filters: GetAppointmentsFilterDTO
  ): Promise<AppointmentItem[]> {
    const patientId = await this.resolvePatientId(userId);

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
        d.id AS doctor_id,
        d.specialization,
        d.status AS doctor_status,
        u.full_name AS doctor_name
      FROM appointments a
      INNER JOIN doctors d ON a.doctor_id = d.id
      INNER JOIN users u ON d.user_id = u.id
      WHERE a.patient_id = ?
    `;

    const params: (string | number)[] = [patientId];

    // Status filter
    if (filters.status) {
      sql += ' AND a.status = ?';
      params.push(filters.status);
    }

    // Search by doctor name or specialty
    if (filters.search) {
      sql += ' AND (u.full_name LIKE ? OR d.specialization LIKE ?)';
      const searchWildcard = `%${filters.search}%`;
      params.push(searchWildcard, searchWildcard);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

      return rows.map((row) => ({
        id: row.id,
        appointmentDate: row.appointment_date,
        appointmentTime: row.appointment_time,
        room: row.room,
        mode: row.mode,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        doctor: {
          id: row.doctor_id,
          fullName: row.doctor_name,
          specialization: row.specialization,
          status: row.doctor_status,
        },
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to retrieve patient appointments:', error.message || error);
      throw new AppError('Failed to retrieve appointments', 500);
    }
  }

  /**
   * Books a new appointment for the authenticated patient.
   */
  public static async bookAppointment(
    userId: number,
    data: BookAppointmentDTO
  ): Promise<BookedAppointment> {
    const patientId = await this.resolvePatientId(userId);

    // Verify doctor exists
    const [doctors] = await pool.execute<RowDataPacket[]>(
      'SELECT id, status FROM doctors WHERE id = ?',
      [data.doctorId]
    );

    if (doctors.length === 0) {
      throw new AppError('Doctor not found', 404);
    }

    const insertSql = `
      INSERT INTO appointments 
        (patient_id, doctor_id, appointment_date, appointment_time, room, mode, notes, status)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, 'upcoming')
    `;

    try {
      const [result] = await pool.execute<ResultSetHeader>(insertSql, [
        patientId,
        data.doctorId,
        data.appointmentDate,
        data.appointmentTime,
        data.room ?? null,
        data.mode,
        data.notes ?? null,
      ]);

      return {
        id: result.insertId,
        patientId,
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        room: data.room ?? null,
        mode: data.mode,
        notes: data.notes ?? null,
        status: 'upcoming',
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to book appointment:', error.message || error);
      throw new AppError('Failed to book appointment', 500);
    }
  }

  /**
   * Cancels an appointment belonging strictly to the authenticated patient.
   */
  public static async cancelAppointment(
    userId: number,
    appointmentId: number
  ): Promise<{ id: number; status: string }> {
    const patientId = await this.resolvePatientId(userId);

    // Fetch existing appointment to check ownership and current status
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, patient_id, status FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (rows.length === 0) {
      throw new AppError('Appointment not found', 404);
    }

    const appointment = rows[0];

    // Enforce ownership: patient can only cancel their own appointment
    if (appointment.patient_id !== patientId) {
      throw new AppError('Access denied. You can only cancel your own appointments', 403);
    }

    // Check if already cancelled
    if (appointment.status === 'cancelled') {
      throw new AppError('Appointment is already cancelled', 400);
    }

    // Check if already completed
    if (appointment.status === 'completed') {
      throw new AppError('Cannot cancel an appointment that has already been completed', 400);
    }

    try {
      await pool.execute<ResultSetHeader>(
        "UPDATE appointments SET status = 'cancelled' WHERE id = ? AND patient_id = ?",
        [appointmentId, patientId]
      );

      return {
        id: appointmentId,
        status: 'cancelled',
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to cancel appointment:', error.message || error);
      throw new AppError('Failed to cancel appointment', 500);
    }
  }

  /**
   * Retrieves all vitals records belonging to the authenticated patient,
   * ordered by most recent first.
   */
  public static async getVitals(userId: number): Promise<VitalRecord[]> {
    const patientId = await this.resolvePatientId(userId);

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id, blood_pressure, heart_rate, blood_glucose, weight, spo2, recorded_at, created_at
         FROM vitals
         WHERE patient_id = ?
         ORDER BY recorded_at DESC`,
        [patientId]
      );

      return rows.map((row) => ({
        id: row.id,
        bloodPressure: row.blood_pressure,
        heartRate: row.heart_rate,
        bloodGlucose: row.blood_glucose !== null ? Number(row.blood_glucose) : null,
        weight: row.weight !== null ? Number(row.weight) : null,
        spo2: row.spo2,
        recordedAt: row.recorded_at,
        createdAt: row.created_at,
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to retrieve vitals:', error.message || error);
      throw new AppError('Failed to retrieve vitals', 500);
    }
  }

  /**
   * Creates a new vital record for the authenticated patient.
   * patient_id is ALWAYS resolved from the JWT-authenticated user,
   * never from the request body.
   */
  public static async logVital(userId: number, data: LogVitalsDTO): Promise<VitalRecord> {
    const patientId = await this.resolvePatientId(userId);

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO vitals
           (patient_id, blood_pressure, heart_rate, blood_glucose, weight, spo2, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          patientId,
          data.bloodPressure,
          data.heartRate,
          data.bloodGlucose,
          data.weight,
          data.spo2,
          data.recordedAt,
        ]
      );

      return {
        id: result.insertId,
        bloodPressure: data.bloodPressure,
        heartRate: data.heartRate,
        bloodGlucose: data.bloodGlucose,
        weight: data.weight,
        spo2: data.spo2,
        recordedAt: data.recordedAt,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to log vital:', error.message || error);
      throw new AppError('Failed to save vital record', 500);
    }
  }
}
