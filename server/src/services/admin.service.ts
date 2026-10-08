import bcrypt from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { AppError } from '../utils/errors';
import {
  AddDoctorDTO,
  DoctorFilterDTO,
  AddPatientDTO,
  PatientFilterDTO,
  AppointmentFilterDTO,
  LogFilterDTO,
} from '../validators/admin.validator';

export interface AdminOverviewMetrics {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
}

export interface AdminDoctorItem {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  specialization: string;
  status: string;
  createdAt: string;
  appointmentCount: number;
}

export interface AdminPatientItem {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  bloodGroup: string | null;
  allergies: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  appointmentCount: number;
}

export interface AdminAppointmentItem {
  id: number;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  appointmentTime: string;
  room: string | null;
  mode: string;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLogItem {
  id: number;
  userId: number | null;
  userName: string | null;
  userRole: string | null;
  level: string;
  action: string;
  message: string;
  createdAt: string;
}

export class AdminService {
  /**
   * Retrieves overall clinic stats: Total Doctors, Total Patients, Total Appointments.
   */
  public static async getOverview(): Promise<AdminOverviewMetrics> {
    const [doctorRows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS count FROM doctors');
    const [patientRows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS count FROM patients');
    const [appointmentRows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS count FROM appointments');

    return {
      totalDoctors: Number(doctorRows[0]?.count || 0),
      totalPatients: Number(patientRows[0]?.count || 0),
      totalAppointments: Number(appointmentRows[0]?.count || 0),
    };
  }

  /**
   * Retrieves all doctors with optional search and status filter.
   */
  public static async getDoctors(filters: DoctorFilterDTO): Promise<AdminDoctorItem[]> {
    let sql = `
      SELECT 
        d.id AS id,
        d.user_id AS userId,
        u.full_name AS fullName,
        u.email,
        d.specialization,
        d.status,
        d.created_at AS createdAt,
        (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = d.id) AS appointmentCount
      FROM doctors d
      INNER JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (filters.status) {
      sql += ' AND d.status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR d.specialization LIKE ?)';
      const wildcard = `%${filters.search}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    sql += ' ORDER BY u.full_name ASC';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

      return rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        fullName: row.fullName,
        email: row.email,
        specialization: row.specialization,
        status: row.status,
        createdAt: row.createdAt,
        appointmentCount: Number(row.appointmentCount || 0),
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to retrieve doctors list:', error.message || error);
      throw new AppError('Failed to retrieve doctors', 500);
    }
  }

  /**
   * Adds a new doctor account and profile.
   */
  public static async addDoctor(data: AddDoctorDTO, adminUserId: number): Promise<AdminDoctorItem> {
    const connection = await pool.getConnection();

    try {
      // 1. Check duplicate email
      const [existing] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [data.email]
      );
      if (existing.length > 0) {
        throw new AppError('A user with this email already exists', 409);
      }

      // 2. Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      await connection.beginTransaction();

      // 3. Insert into users
      const [userResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, "doctor")',
        [data.fullName, data.email, passwordHash]
      );
      const userId = userResult.insertId;

      // 4. Insert into doctors
      const [docResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO doctors (user_id, specialization, status) VALUES (?, ?, ?)',
        [userId, data.specialization, data.status]
      );
      const doctorId = docResult.insertId;

      // 5. System audit log
      try {
        await connection.execute<ResultSetHeader>(
          'INSERT INTO system_logs (user_id, level, action, message) VALUES (?, "info", "DOCTOR_CREATED", ?)',
          [adminUserId, `Admin created doctor account for ${data.fullName} (${data.email})`]
        );
      } catch (logErr) {
        console.warn('Failed to write audit log:', logErr);
      }

      await connection.commit();

      return {
        id: doctorId,
        userId,
        fullName: data.fullName,
        email: data.email,
        specialization: data.specialization,
        status: data.status,
        createdAt: new Date().toISOString(),
        appointmentCount: 0,
      };
    } catch (error: any) {
      try {
        await connection.rollback();
      } catch (rbErr) {
        console.error('Rollback error on add doctor:', rbErr);
      }
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new AppError('A user with this email already exists', 409);
      }
      if (error instanceof AppError) throw error;
      console.error('Failed to add doctor:', error.message || error);
      throw new AppError('Failed to create doctor account', 500);
    } finally {
      connection.release();
    }
  }

  /**
   * Updates a doctor's availability status.
   */
  public static async updateDoctorStatus(
    doctorId: number,
    status: string,
    adminUserId: number
  ): Promise<{ id: number; status: string }> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT d.id, u.full_name, d.status FROM doctors d INNER JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [doctorId]
    );

    if (rows.length === 0) {
      throw new AppError('Doctor not found', 404);
    }

    const doctor = rows[0];

    try {
      await pool.execute<ResultSetHeader>(
        'UPDATE doctors SET status = ? WHERE id = ?',
        [status, doctorId]
      );

      try {
        await pool.execute<ResultSetHeader>(
          'INSERT INTO system_logs (user_id, level, action, message) VALUES (?, "info", "DOCTOR_STATUS_UPDATED", ?)',
          [adminUserId, `Admin updated status for Dr. ${doctor.full_name} from '${doctor.status}' to '${status}'`]
        );
      } catch (logErr) {
        console.warn('Failed to write audit log:', logErr);
      }

      return {
        id: doctorId,
        status,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to update doctor status:', error.message || error);
      throw new AppError('Failed to update doctor status', 500);
    }
  }

  /**
   * Retrieves all patients with optional search.
   */
  public static async getPatients(filters: PatientFilterDTO): Promise<AdminPatientItem[]> {
    let sql = `
      SELECT 
        p.id AS id,
        p.user_id AS userId,
        u.full_name AS fullName,
        u.email,
        p.blood_group AS bloodGroup,
        p.allergies,
        p.emergency_contact_name AS emergencyContactName,
        p.emergency_contact_phone AS emergencyContactPhone,
        p.created_at AS createdAt,
        (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id) AS appointmentCount
      FROM patients p
      INNER JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (filters.search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      const wildcard = `%${filters.search}%`;
      params.push(wildcard, wildcard);
    }

    sql += ' ORDER BY u.full_name ASC';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

      return rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        fullName: row.fullName,
        email: row.email,
        bloodGroup: row.bloodGroup,
        allergies: row.allergies,
        emergencyContactName: row.emergencyContactName,
        emergencyContactPhone: row.emergencyContactPhone,
        createdAt: row.createdAt,
        appointmentCount: Number(row.appointmentCount || 0),
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to retrieve patients list:', error.message || error);
      throw new AppError('Failed to retrieve patients', 500);
    }
  }

  /**
   * Adds a new patient account and profile.
   */
  public static async addPatient(data: AddPatientDTO, adminUserId: number): Promise<AdminPatientItem> {
    const connection = await pool.getConnection();

    try {
      // 1. Check duplicate email
      const [existing] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [data.email]
      );
      if (existing.length > 0) {
        throw new AppError('A user with this email already exists', 409);
      }

      // 2. Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      await connection.beginTransaction();

      // 3. Insert into users
      const [userResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, "patient")',
        [data.fullName, data.email, passwordHash]
      );
      const userId = userResult.insertId;

      // 4. Insert into patients
      const [patResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO patients (user_id, blood_group, allergies, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?, ?)',
        [userId, data.bloodGroup ?? null, data.allergies ?? null, data.emergencyContactName ?? null, data.emergencyContactPhone ?? null]
      );
      const patientId = patResult.insertId;

      // 5. System audit log
      try {
        await connection.execute<ResultSetHeader>(
          'INSERT INTO system_logs (user_id, level, action, message) VALUES (?, "info", "PATIENT_CREATED", ?)',
          [adminUserId, `Admin created patient account for ${data.fullName} (${data.email})`]
        );
      } catch (logErr) {
        console.warn('Failed to write audit log:', logErr);
      }

      await connection.commit();

      return {
        id: patientId,
        userId,
        fullName: data.fullName,
        email: data.email,
        bloodGroup: data.bloodGroup ?? null,
        allergies: data.allergies ?? null,
        emergencyContactName: data.emergencyContactName ?? null,
        emergencyContactPhone: data.emergencyContactPhone ?? null,
        createdAt: new Date().toISOString(),
        appointmentCount: 0,
      };
    } catch (error: any) {
      try {
        await connection.rollback();
      } catch (rbErr) {
        console.error('Rollback error on add patient:', rbErr);
      }
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new AppError('A user with this email already exists', 409);
      }
      if (error instanceof AppError) throw error;
      console.error('Failed to add patient:', error.message || error);
      throw new AppError('Failed to create patient account', 500);
    } finally {
      connection.release();
    }
  }

  /**
   * Retrieves all clinic appointments with optional search and status filter.
   */
  public static async getAppointments(filters: AppointmentFilterDTO): Promise<AdminAppointmentItem[]> {
    let sql = `
      SELECT 
        a.id,
        a.appointment_date AS appointmentDate,
        a.appointment_time AS appointmentTime,
        a.room,
        a.mode,
        a.notes,
        a.status,
        a.created_at AS createdAt,
        a.updated_at AS updatedAt,
        pu.full_name AS patientName,
        du.full_name AS doctorName,
        d.specialization AS doctorSpecialization
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users pu ON p.user_id = pu.id
      INNER JOIN doctors d ON a.doctor_id = d.id
      INNER JOIN users du ON d.user_id = du.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (filters.status) {
      sql += ' AND a.status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      sql += ' AND (pu.full_name LIKE ? OR du.full_name LIKE ? OR d.specialization LIKE ?)';
      const wildcard = `%${filters.search}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

      return rows.map((row) => ({
        id: row.id,
        patientName: row.patientName,
        doctorName: row.doctorName,
        doctorSpecialization: row.doctorSpecialization,
        appointmentDate: row.appointmentDate,
        appointmentTime: row.appointmentTime,
        room: row.room,
        mode: row.mode,
        notes: row.notes,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to retrieve appointments:', error.message || error);
      throw new AppError('Failed to retrieve appointments', 500);
    }
  }

  /**
   * Retrieves system audit logs from MySQL.
   */
  public static async getLogs(filters: LogFilterDTO): Promise<AdminLogItem[]> {
    let sql = `
      SELECT 
        l.id,
        l.user_id AS userId,
        l.level,
        l.action,
        l.message,
        l.created_at AS createdAt,
        u.full_name AS userName,
        u.role AS userRole
      FROM system_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;

    const params: string[] = [];

    if (filters.level) {
      sql += ' AND l.level = ?';
      params.push(filters.level);
    }

    sql += ' ORDER BY l.created_at DESC LIMIT 150';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

      return rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userName: row.userName,
        userRole: row.userRole,
        level: row.level,
        action: row.action,
        message: row.message,
        createdAt: row.createdAt,
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Failed to retrieve system logs:', error.message || error);
      throw new AppError('Failed to retrieve system logs', 500);
    }
  }
}
