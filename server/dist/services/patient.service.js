"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class PatientService {
    /**
     * Resolves the patient's record ID from the authenticated user's ID.
     * Ensures patientId is NEVER trusted from request body.
     */
    static async resolvePatientId(userId) {
        const [rows] = await db_1.pool.execute('SELECT id FROM patients WHERE user_id = ?', [userId]);
        if (rows.length === 0) {
            throw new errors_1.AppError('Patient profile not found for this user', 404);
        }
        return rows[0].id;
    }
    /**
     * Retrieves appointments belonging exclusively to the authenticated patient,
     * supporting optional search by doctor name/specialty and status filtering.
     */
    static async getAppointments(userId, filters) {
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
        const params = [patientId];
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
            const [rows] = await db_1.pool.execute(sql, params);
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
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to retrieve patient appointments:', error.message || error);
            throw new errors_1.AppError('Failed to retrieve appointments', 500);
        }
    }
    /**
     * Books a new appointment for the authenticated patient.
     */
    static async bookAppointment(userId, data) {
        const patientId = await this.resolvePatientId(userId);
        // Verify doctor exists
        const [doctors] = await db_1.pool.execute('SELECT id, status FROM doctors WHERE id = ?', [data.doctorId]);
        if (doctors.length === 0) {
            throw new errors_1.AppError('Doctor not found', 404);
        }
        const insertSql = `
      INSERT INTO appointments 
        (patient_id, doctor_id, appointment_date, appointment_time, room, mode, notes, status)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, 'upcoming')
    `;
        try {
            const [result] = await db_1.pool.execute(insertSql, [
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
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to book appointment:', error.message || error);
            throw new errors_1.AppError('Failed to book appointment', 500);
        }
    }
    /**
     * Cancels an appointment belonging strictly to the authenticated patient.
     */
    static async cancelAppointment(userId, appointmentId) {
        const patientId = await this.resolvePatientId(userId);
        // Fetch existing appointment to check ownership and current status
        const [rows] = await db_1.pool.execute('SELECT id, patient_id, status FROM appointments WHERE id = ?', [appointmentId]);
        if (rows.length === 0) {
            throw new errors_1.AppError('Appointment not found', 404);
        }
        const appointment = rows[0];
        // Enforce ownership: patient can only cancel their own appointment
        if (appointment.patient_id !== patientId) {
            throw new errors_1.AppError('Access denied. You can only cancel your own appointments', 403);
        }
        // Check if already cancelled
        if (appointment.status === 'cancelled') {
            throw new errors_1.AppError('Appointment is already cancelled', 400);
        }
        // Check if already completed
        if (appointment.status === 'completed') {
            throw new errors_1.AppError('Cannot cancel an appointment that has already been completed', 400);
        }
        try {
            await db_1.pool.execute("UPDATE appointments SET status = 'cancelled' WHERE id = ? AND patient_id = ?", [appointmentId, patientId]);
            return {
                id: appointmentId,
                status: 'cancelled',
            };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to cancel appointment:', error.message || error);
            throw new errors_1.AppError('Failed to cancel appointment', 500);
        }
    }
    /**
     * Retrieves all vitals records belonging to the authenticated patient,
     * ordered by most recent first.
     */
    static async getVitals(userId) {
        const patientId = await this.resolvePatientId(userId);
        try {
            const [rows] = await db_1.pool.execute(`SELECT id, blood_pressure, heart_rate, blood_glucose, weight, spo2, recorded_at, created_at
         FROM vitals
         WHERE patient_id = ?
         ORDER BY recorded_at DESC`, [patientId]);
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
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to retrieve vitals:', error.message || error);
            throw new errors_1.AppError('Failed to retrieve vitals', 500);
        }
    }
    /**
     * Creates a new vital record for the authenticated patient.
     * patient_id is ALWAYS resolved from the JWT-authenticated user,
     * never from the request body.
     */
    static async logVital(userId, data) {
        const patientId = await this.resolvePatientId(userId);
        try {
            const [result] = await db_1.pool.execute(`INSERT INTO vitals
           (patient_id, blood_pressure, heart_rate, blood_glucose, weight, spo2, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                patientId,
                data.bloodPressure,
                data.heartRate,
                data.bloodGlucose,
                data.weight,
                data.spo2,
                data.recordedAt,
            ]);
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
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to log vital:', error.message || error);
            throw new errors_1.AppError('Failed to save vital record', 500);
        }
    }
    /**
     * Retrieves medical history belonging exclusively to the authenticated patient.
     * Supports optional category filtering. Ordered chronologically.
     */
    static async getMedicalHistory(userId, filters) {
        const patientId = await this.resolvePatientId(userId);
        let sql = `
      SELECT id, patient_id, category, title, description, recorded_at, created_at
      FROM medical_history
      WHERE patient_id = ?
    `;
        const params = [patientId];
        if (filters.category) {
            sql += ' AND category = ?';
            params.push(filters.category);
        }
        sql += ' ORDER BY recorded_at DESC';
        try {
            const [rows] = await db_1.pool.execute(sql, params);
            return rows.map((row) => ({
                id: row.id,
                patientId: row.patient_id,
                category: row.category,
                title: row.title,
                description: row.description,
                recordedAt: row.recorded_at,
                createdAt: row.created_at,
            }));
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to retrieve medical history:', error.message || error);
            throw new errors_1.AppError('Failed to retrieve medical history', 500);
        }
    }
    /**
     * Retrieves prescriptions belonging exclusively to the authenticated patient.
     * Ordered by prescribed date (newest first).
     */
    static async getPrescriptions(userId) {
        const patientId = await this.resolvePatientId(userId);
        const sql = `
      SELECT 
        p.id,
        p.medicine,
        p.dosage,
        p.frequency,
        p.refills,
        p.status,
        p.prescribed_at,
        u.full_name AS doctor_name
      FROM prescriptions p
      INNER JOIN doctors d ON p.doctor_id = d.id
      INNER JOIN users u ON d.user_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.prescribed_at DESC
    `;
        try {
            const [rows] = await db_1.pool.execute(sql, [patientId]);
            return rows.map((row) => ({
                id: row.id,
                medicine: row.medicine,
                dosage: row.dosage,
                frequency: row.frequency,
                doctorName: row.doctor_name,
                refills: row.refills,
                status: row.status,
                prescribedAt: row.prescribed_at,
            }));
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to retrieve prescriptions:', error.message || error);
            throw new errors_1.AppError('Failed to retrieve prescriptions', 500);
        }
    }
}
exports.PatientService = PatientService;
