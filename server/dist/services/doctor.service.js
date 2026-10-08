"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class DoctorService {
    /**
     * Resolves the doctor's record ID from the authenticated user's ID.
     * Ensures doctor_id is ALWAYS derived from JWT identity.
     */
    static async resolveDoctorId(userId) {
        const [rows] = await db_1.pool.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
        if (rows.length === 0) {
            throw new errors_1.AppError('Doctor profile not found for this user', 404);
        }
        return rows[0].id;
    }
    /**
     * Retrieves aggregated metrics and today's schedule for the authenticated doctor.
     */
    static async getOverview(userId) {
        const doctorId = await this.resolveDoctorId(userId);
        // 1. Today's appointments count
        const [todayCountRows] = await db_1.pool.execute('SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()', [doctorId]);
        const todaySchedule = Number(todayCountRows[0]?.count || 0);
        // 2. Active patients count (distinct patients seen by or assigned to this doctor)
        const [activePatientsRows] = await db_1.pool.execute('SELECT COUNT(DISTINCT patient_id) AS count FROM appointments WHERE doctor_id = ?', [doctorId]);
        const activePatients = Number(activePatientsRows[0]?.count || 0);
        // 3. Pending consultations count (status is upcoming or in-progress)
        const [pendingRows] = await db_1.pool.execute("SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status IN ('upcoming', 'in-progress')", [doctorId]);
        const pendingConsultations = Number(pendingRows[0]?.count || 0);
        // 4. Today's schedule items
        const [todayApptRows] = await db_1.pool.execute(`SELECT 
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
      WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
      ORDER BY a.appointment_time ASC`, [doctorId]);
        const todayAppointments = todayApptRows.map((row) => ({
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
        return {
            metrics: {
                todaySchedule,
                activePatients,
                pendingConsultations,
            },
            todayAppointments,
        };
    }
    /**
     * Retrieves appointments belonging exclusively to the authenticated doctor.
     */
    static async getAppointments(userId, filters) {
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
        const params = [doctorId];
        if (filters.status) {
            sql += ' AND a.status = ?';
            params.push(filters.status);
        }
        sql += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';
        try {
            const [rows] = await db_1.pool.execute(sql, params);
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
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to retrieve doctor appointments:', error.message || error);
            throw new errors_1.AppError('Failed to retrieve appointments', 500);
        }
    }
    /**
     * Updates an appointment status for an appointment belonging strictly to the authenticated doctor.
     */
    static async updateAppointmentStatus(userId, appointmentId, newStatus) {
        const doctorId = await this.resolveDoctorId(userId);
        // Verify appointment exists and belongs to this doctor
        const [rows] = await db_1.pool.execute('SELECT id, doctor_id, status FROM appointments WHERE id = ?', [appointmentId]);
        if (rows.length === 0) {
            throw new errors_1.AppError('Appointment not found', 404);
        }
        const appointment = rows[0];
        // Enforce doctor ownership
        if (appointment.doctor_id !== doctorId) {
            throw new errors_1.AppError('Appointment not found or inaccessible', 404);
        }
        try {
            await db_1.pool.execute('UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?', [newStatus, appointmentId, doctorId]);
            return {
                id: appointmentId,
                status: newStatus,
            };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to update appointment status:', error.message || error);
            throw new errors_1.AppError('Failed to update appointment status', 500);
        }
    }
    /**
     * Retrieves patients relevant to the logged-in doctor with optional search.
     */
    static async getPatients(userId, filters) {
        const doctorId = await this.resolveDoctorId(userId);
        let sql = `
      SELECT DISTINCT 
        p.id,
        u.full_name AS fullName,
        u.email,
        p.blood_group AS bloodGroup,
        p.allergies,
        p.emergency_contact_name AS emergencyContactName,
        p.emergency_contact_phone AS emergencyContactPhone,
        (SELECT MAX(a.appointment_date) FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = ?) AS lastVisitDate,
        (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = ?) AS totalVisits
      FROM patients p
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN appointments appt ON appt.patient_id = p.id
      WHERE appt.doctor_id = ?
    `;
        const params = [doctorId, doctorId, doctorId];
        if (filters.search) {
            sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
            const wildcard = `%${filters.search}%`;
            params.push(wildcard, wildcard);
        }
        sql += ' ORDER BY u.full_name ASC';
        try {
            const [rows] = await db_1.pool.execute(sql, params);
            return rows.map((row) => ({
                id: row.id,
                fullName: row.fullName,
                email: row.email,
                bloodGroup: row.bloodGroup,
                allergies: row.allergies,
                emergencyContactName: row.emergencyContactName,
                emergencyContactPhone: row.emergencyContactPhone,
                lastVisitDate: row.lastVisitDate,
                totalVisits: Number(row.totalVisits || 0),
            }));
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to retrieve doctor patients:', error.message || error);
            throw new errors_1.AppError('Failed to retrieve patients', 500);
        }
    }
    /**
     * Retrieves detailed profile and history for a specific patient.
     */
    static async getPatientDetails(userId, patientId) {
        const doctorId = await this.resolveDoctorId(userId);
        // Verify patient exists and has had relationship with this doctor
        const [patientRows] = await db_1.pool.execute(`SELECT 
        p.id,
        u.full_name AS fullName,
        u.email,
        p.blood_group AS bloodGroup,
        p.allergies,
        p.emergency_contact_name AS emergencyContactName,
        p.emergency_contact_phone AS emergencyContactPhone,
        (SELECT MAX(a.appointment_date) FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = ?) AS lastVisitDate,
        (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = ?) AS totalVisits
      FROM patients p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`, [doctorId, doctorId, patientId]);
        if (patientRows.length === 0) {
            throw new errors_1.AppError('Patient not found', 404);
        }
        const patient = patientRows[0];
        // Fetch appointments with this doctor
        const [apptRows] = await db_1.pool.execute(`SELECT id, appointment_date, appointment_time, room, mode, notes, status
       FROM appointments
       WHERE patient_id = ? AND doctor_id = ?
       ORDER BY appointment_date DESC, appointment_time DESC`, [patientId, doctorId]);
        // Fetch clinical notes written by this doctor
        const [noteRows] = await db_1.pool.execute(`SELECT id, diagnosis, treatment, follow_up, created_at, updated_at
       FROM clinical_notes
       WHERE patient_id = ? AND doctor_id = ?
       ORDER BY created_at DESC`, [patientId, doctorId]);
        return {
            id: patient.id,
            fullName: patient.fullName,
            email: patient.email,
            bloodGroup: patient.bloodGroup,
            allergies: patient.allergies,
            emergencyContactName: patient.emergencyContactName,
            emergencyContactPhone: patient.emergencyContactPhone,
            lastVisitDate: patient.lastVisitDate,
            totalVisits: Number(patient.totalVisits || 0),
            appointments: apptRows.map((r) => ({
                id: r.id,
                appointmentDate: r.appointment_date,
                appointmentTime: r.appointment_time,
                room: r.room,
                mode: r.mode,
                notes: r.notes,
                status: r.status,
            })),
            clinicalNotes: noteRows.map((n) => ({
                id: n.id,
                diagnosis: n.diagnosis,
                treatment: n.treatment,
                followUp: n.follow_up,
                createdAt: n.created_at,
                updatedAt: n.updated_at,
            })),
        };
    }
    /**
     * Retrieves clinical notes authored by the authenticated doctor.
     */
    static async getClinicalNotes(userId, filters) {
        const doctorId = await this.resolveDoctorId(userId);
        let sql = `
      SELECT 
        cn.id,
        cn.patient_id AS patientId,
        cn.doctor_id AS doctorId,
        cn.diagnosis,
        cn.treatment,
        cn.follow_up AS followUp,
        cn.created_at AS createdAt,
        cn.updated_at AS updatedAt,
        u.full_name AS patientName
      FROM clinical_notes cn
      INNER JOIN patients p ON cn.patient_id = p.id
      INNER JOIN users u ON p.user_id = u.id
      WHERE cn.doctor_id = ?
    `;
        const params = [doctorId];
        if (filters.patientId) {
            sql += ' AND cn.patient_id = ?';
            params.push(filters.patientId);
        }
        sql += ' ORDER BY cn.created_at DESC';
        try {
            const [rows] = await db_1.pool.execute(sql, params);
            return rows.map((row) => ({
                id: row.id,
                patientId: row.patientId,
                doctorId: row.doctorId,
                patientName: row.patientName,
                diagnosis: row.diagnosis,
                treatment: row.treatment,
                followUp: row.followUp,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            }));
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to retrieve clinical notes:', error.message || error);
            throw new errors_1.AppError('Failed to retrieve clinical notes', 500);
        }
    }
    /**
     * Creates a new clinical note authored by the authenticated doctor.
     */
    static async createClinicalNote(userId, data) {
        const doctorId = await this.resolveDoctorId(userId);
        // Validate that the patient exists
        const [patientRows] = await db_1.pool.execute('SELECT p.id, u.full_name AS patientName FROM patients p INNER JOIN users u ON p.user_id = u.id WHERE p.id = ?', [data.patientId]);
        if (patientRows.length === 0) {
            throw new errors_1.AppError('Patient not found', 404);
        }
        const patientName = patientRows[0].patientName;
        try {
            const [result] = await db_1.pool.execute('INSERT INTO clinical_notes (patient_id, doctor_id, diagnosis, treatment, follow_up) VALUES (?, ?, ?, ?, ?)', [data.patientId, doctorId, data.diagnosis, data.treatment, data.followUp ?? null]);
            const noteId = result.insertId;
            return {
                id: noteId,
                patientId: data.patientId,
                doctorId,
                patientName,
                diagnosis: data.diagnosis,
                treatment: data.treatment,
                followUp: data.followUp ?? null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to create clinical note:', error.message || error);
            throw new errors_1.AppError('Failed to create clinical note', 500);
        }
    }
    /**
     * Retrieves the authenticated doctor's profile.
     */
    static async getProfile(userId) {
        const [rows] = await db_1.pool.execute(`SELECT 
        u.id AS userId,
        d.id AS doctorId,
        u.full_name AS fullName,
        u.email,
        u.role,
        d.specialization,
        d.status,
        d.created_at AS createdAt
      FROM doctors d
      INNER JOIN users u ON d.user_id = u.id
      WHERE d.user_id = ?`, [userId]);
        if (rows.length === 0) {
            throw new errors_1.AppError('Doctor profile not found for this user', 404);
        }
        const row = rows[0];
        return {
            userId: row.userId,
            doctorId: row.doctorId,
            fullName: row.fullName,
            email: row.email,
            role: row.role,
            specialization: row.specialization,
            status: row.status,
            createdAt: row.createdAt,
        };
    }
    /**
     * Updates allowed doctor profile fields (fullName, specialization, status).
     */
    static async updateProfile(userId, data) {
        const connection = await db_1.pool.getConnection();
        try {
            await connection.beginTransaction();
            if (data.fullName) {
                await connection.execute('UPDATE users SET full_name = ? WHERE id = ?', [data.fullName, userId]);
            }
            if (data.specialization || data.status) {
                const updateParts = [];
                const params = [];
                if (data.specialization) {
                    updateParts.push('specialization = ?');
                    params.push(data.specialization);
                }
                if (data.status) {
                    updateParts.push('status = ?');
                    params.push(data.status);
                }
                params.push(userId);
                await connection.execute(`UPDATE doctors SET ${updateParts.join(', ')} WHERE user_id = ?`, params);
            }
            await connection.commit();
            return await this.getProfile(userId);
        }
        catch (error) {
            try {
                await connection.rollback();
            }
            catch (rbErr) {
                console.error('Rollback error on doctor profile update:', rbErr);
            }
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Failed to update doctor profile:', error.message || error);
            throw new errors_1.AppError('Failed to update profile', 500);
        }
        finally {
            connection.release();
        }
    }
}
exports.DoctorService = DoctorService;
