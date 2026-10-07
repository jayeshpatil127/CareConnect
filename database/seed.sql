-- =============================================================================
-- CareConnect - Database Seed Data
-- =============================================================================
-- File    : database/seed.sql
-- Purpose : Inserts sample/test data for development and UI/API testing.
--           All credentials are TEST-ONLY and must never be used in production.
-- =============================================================================
-- Usage:
--   Run after schema.sql on a fresh careconnect database:
--     mysql -u <user> -p careconnect < database/seed.sql
-- =============================================================================
-- WARNING: This script uses TRUNCATE to reset tables before inserting.
--          Do NOT run this on a production database.
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Enforce strict foreign key checks throughout execution
SET FOREIGN_KEY_CHECKS = 1;

-- Clean existing data in strict reverse dependency order (child tables first)
DELETE FROM system_logs;
DELETE FROM clinical_notes;
DELETE FROM prescriptions;
DELETE FROM medical_history;
DELETE FROM vitals;
DELETE FROM appointments;
DELETE FROM doctors;
DELETE FROM patients;
DELETE FROM users;


-- =============================================================================
-- 1. USERS
-- =============================================================================
-- Passwords are valid bcrypt hashes (cost=10) of the demo credentials shown below:
-- Patient@123  → $2b$10$fJC/dslsgMrVtw9NVW1JIeqUuA9f9ZJ15XJXGx5bYP5MZq6WzpmGi
-- Doctor@123   → $2b$10$ED7fNJy7m85hG7EQj1znYufm5oXm7eqM9U65uksdoPojXYd4zOeg2
-- Admin@123    → $2b$10$u0XpxoaR/wFrWuk8s0pZieG0l2ueUvz5ri3.swLtQ/JcFzeTy0V4O

INSERT INTO users (id, full_name, email, password_hash, role, created_at, updated_at) VALUES
  (1, 'Aarav Sharma',       'patient@careconnect.test', '$2b$10$fJC/dslsgMrVtw9NVW1JIeqUuA9f9ZJ15XJXGx5bYP5MZq6WzpmGi', 'patient', '2025-01-10 09:00:00', '2025-01-10 09:00:00'),
  (2, 'Dr. Ananya Mehta',   'doctor@careconnect.test',  '$2b$10$ED7fNJy7m85hG7EQj1znYufm5oXm7eqM9U65uksdoPojXYd4zOeg2',  'doctor',  '2025-01-10 09:05:00', '2025-01-10 09:05:00'),
  (3, 'CareConnect Admin',  'admin@careconnect.test',   '$2b$10$u0XpxoaR/wFrWuk8s0pZieG0l2ueUvz5ri3.swLtQ/JcFzeTy0V4O',   'admin',   '2025-01-10 09:10:00', '2025-01-10 09:10:00');

-- =============================================================================
-- 2. PATIENTS
-- patient user_id = 1 (Aarav Sharma)
-- =============================================================================

INSERT INTO patients (id, user_id, blood_group, allergies, emergency_contact_name, emergency_contact_phone, created_at, updated_at) VALUES
  (1, 1, 'B+', 'Penicillin', 'Neha Sharma', '9000000001', '2025-01-10 09:01:00', '2025-01-10 09:01:00');

-- =============================================================================
-- 3. DOCTORS
-- doctor user_id = 2 (Dr. Ananya Mehta)
-- =============================================================================

INSERT INTO doctors (id, user_id, specialization, status, created_at, updated_at) VALUES
  (1, 2, 'Cardiology', 'active', '2025-01-10 09:06:00', '2025-01-10 09:06:00');

-- =============================================================================
-- 4. APPOINTMENTS
-- patient_id = 1 (Aarav Sharma), doctor_id = 1 (Dr. Ananya Mehta)
-- Covers all four status values: upcoming, in-progress, completed, cancelled
-- =============================================================================

INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, room, mode, notes, status, created_at, updated_at) VALUES
  (1, 1, 1, '2025-02-05', '10:00:00', 'Room 101', 'in-person', 'Routine cardiac checkup.',                                          'completed',   '2025-01-28 11:00:00', '2025-02-05 11:00:00'),
  (2, 1, 1, '2025-03-12', '14:30:00', NULL,        'video',     'Follow-up on echocardiogram results. Patient to join via portal.',  'completed',   '2025-03-05 09:00:00', '2025-03-12 15:30:00'),
  (3, 1, 1, '2025-05-20', '09:00:00', 'Room 203', 'in-person', 'Patient reported occasional chest discomfort.',                     'completed',   '2025-05-13 10:00:00', '2025-05-20 10:00:00'),
  (4, 1, 1, '2025-07-08', '11:00:00', NULL,        'video',     'Medication review and blood pressure monitoring update.',           'cancelled',   '2025-07-01 08:00:00', '2025-07-06 08:00:00'),
  (5, 1, 1, '2025-09-15', '10:30:00', 'Room 105', 'in-person', 'Quarterly review. Patient feels stable.',                           'completed',   '2025-09-08 09:00:00', '2025-09-15 11:30:00'),
  (6, 1, 1, '2026-10-07', '11:00:00', 'Room 101', 'in-person', 'Annual cardiac assessment scheduled.',                              'in-progress', '2026-09-30 10:00:00', '2026-10-07 11:00:00'),
  (7, 1, 1, '2026-10-20', '09:30:00', NULL,        'video',     'Post-assessment discussion and medication adjustment if needed.',   'upcoming',    '2026-10-07 12:00:00', '2026-10-07 12:00:00'),
  (8, 1, 1, '2026-11-10', '14:00:00', 'Room 202', 'in-person', 'Six-month follow-up with stress test.',                            'upcoming',    '2026-10-07 12:05:00', '2026-10-07 12:05:00');

-- =============================================================================
-- 5. VITALS
-- patient_id = 1 (Aarav Sharma)
-- Recorded across different dates to provide meaningful chart history.
-- All values are fictional test data and do NOT constitute medical advice.
-- =============================================================================

INSERT INTO vitals (id, patient_id, blood_pressure, heart_rate, blood_glucose, weight, spo2, recorded_at, created_at) VALUES
  (1,  1, '128/84', 78,  96.5,  72.50, 97, '2025-02-05 10:15:00', '2025-02-05 10:15:00'),
  (2,  1, '132/86', 82,  104.0, 72.80, 96, '2025-03-12 14:45:00', '2025-03-12 14:45:00'),
  (3,  1, '125/80', 75,  98.5,  73.10, 98, '2025-04-01 09:00:00', '2025-04-01 09:00:00'),
  (4,  1, '130/85', 80,  110.2, 72.60, 97, '2025-05-20 09:15:00', '2025-05-20 09:15:00'),
  (5,  1, '122/78', 74,  92.0,  72.00, 99, '2025-06-15 08:30:00', '2025-06-15 08:30:00'),
  (6,  1, '135/88', 86,  115.5, 73.50, 96, '2025-07-01 10:00:00', '2025-07-01 10:00:00'),
  (7,  1, '124/82', 77,  99.0,  72.30, 98, '2025-08-10 11:00:00', '2025-08-10 11:00:00'),
  (8,  1, '127/83', 79,  101.5, 71.90, 97, '2025-09-15 10:45:00', '2025-09-15 10:45:00'),
  (9,  1, '120/78', 72,  88.0,  71.50, 99, '2025-10-05 09:30:00', '2025-10-05 09:30:00'),
  (10, 1, '126/81', 76,  95.0,  71.80, 98, '2026-10-07 11:15:00', '2026-10-07 11:15:00');

-- =============================================================================
-- 6. MEDICAL HISTORY
-- patient_id = 1 (Aarav Sharma)
-- Covers all supported categories: consultation, prescription, lab, diagnosis, follow-up
-- =============================================================================

INSERT INTO medical_history (id, patient_id, category, title, description, recorded_at, created_at) VALUES
  (1,  1, 'consultation', 'Initial Cardiac Consultation',        'Patient presented with mild shortness of breath and fatigue. Initial assessment performed.',                                  '2025-02-05 10:00:00', '2025-02-05 10:00:00'),
  (2,  1, 'diagnosis',    'Mild Hypertension Detected',          'Blood pressure consistently above 125/80. Diagnosed with Stage 1 hypertension. Lifestyle changes advised.',                  '2025-02-05 10:30:00', '2025-02-05 10:30:00'),
  (3,  1, 'lab',          'Echocardiogram Report',               'Echocardiogram performed. Results show normal ejection fraction (~60%). No structural abnormalities detected.',              '2025-02-20 14:00:00', '2025-02-20 14:00:00'),
  (4,  1, 'prescription', 'Amlodipine Prescribed',               'Amlodipine 5mg OD prescribed for blood pressure management. Patient counselled on side effects.',                           '2025-03-12 15:00:00', '2025-03-12 15:00:00'),
  (5,  1, 'lab',          'Fasting Blood Glucose Test',          'FBG: 98.5 mg/dL. Within normal range. No signs of pre-diabetes.',                                                            '2025-04-01 09:00:00', '2025-04-01 09:00:00'),
  (6,  1, 'follow-up',    'Three-Month Hypertension Follow-Up',  'BP improved to 122/78. Patient compliant with medication. Continue Amlodipine 5mg. Next review in 3 months.',               '2025-05-20 09:30:00', '2025-05-20 09:30:00'),
  (7,  1, 'lab',          'Lipid Profile Test',                  'Total Cholesterol: 195 mg/dL. LDL: 115 mg/dL. HDL: 52 mg/dL. Triglycerides: 140 mg/dL. Borderline LDL advised.',          '2025-06-15 08:30:00', '2025-06-15 08:30:00'),
  (8,  1, 'prescription', 'Atorvastatin Added to Regimen',       'Atorvastatin 10mg OD added for borderline LDL management. Dietary guidance provided.',                                      '2025-07-01 10:30:00', '2025-07-01 10:30:00'),
  (9,  1, 'follow-up',    'Six-Month Cardiac Review',            'Patient stable. BP 124/82. Heart rate 77 bpm. SpO2 98%. Continue current medications. Annual stress test recommended.',     '2025-09-15 11:00:00', '2025-09-15 11:00:00'),
  (10, 1, 'consultation', 'Annual Cardiac Assessment (2026)',     'Comprehensive assessment. Patient reports improved energy levels. No chest discomfort reported. All vitals within range.',  '2026-10-07 11:00:00', '2026-10-07 11:00:00');

-- =============================================================================
-- 7. PRESCRIPTIONS
-- patient_id = 1, doctor_id = 1
-- Covers all status values: active, completed, discontinued
-- =============================================================================

INSERT INTO prescriptions (id, patient_id, doctor_id, medicine, dosage, frequency, refills, status, prescribed_at, created_at, updated_at) VALUES
  (1, 1, 1, 'Amlodipine',    '5mg',  'Once daily (morning)',            3, 'active',       '2025-03-12 15:00:00', '2025-03-12 15:00:00', '2026-10-07 11:30:00'),
  (2, 1, 1, 'Atorvastatin',  '10mg', 'Once daily (bedtime)',            2, 'active',       '2025-07-01 10:30:00', '2025-07-01 10:30:00', '2026-10-07 11:30:00'),
  (3, 1, 1, 'Aspirin',       '75mg', 'Once daily (after breakfast)',    1, 'active',       '2025-09-15 11:00:00', '2025-09-15 11:00:00', '2026-10-07 11:30:00'),
  (4, 1, 1, 'Metoprolol',    '25mg', 'Twice daily (morning & evening)', 0, 'discontinued', '2025-02-05 10:30:00', '2025-02-05 10:30:00', '2025-05-20 09:30:00'),
  (5, 1, 1, 'Pantoprazole',  '40mg', 'Once daily (before breakfast)',   0, 'completed',    '2025-02-05 10:45:00', '2025-02-05 10:45:00', '2025-04-01 09:30:00');

-- =============================================================================
-- 8. CLINICAL NOTES
-- patient_id = 1, doctor_id = 1
-- =============================================================================

INSERT INTO clinical_notes (id, patient_id, doctor_id, diagnosis, treatment, follow_up, created_at, updated_at) VALUES
  (1, 1, 1,
    'Stage 1 Hypertension with mild exertional dyspnoea.',
    'Initiated Amlodipine 5mg OD. Advised low-sodium diet, daily 30-minute walks, and alcohol reduction. Metoprolol 25mg BD added as adjunct.',
    'Review in 6 weeks. Repeat BP monitoring at home. Return earlier if BP exceeds 140/90.',
    '2025-02-05 10:30:00', '2025-02-05 10:30:00'),

  (2, 1, 1,
    'Hypertension - Stable. Echocardiogram within normal limits (EF ~60%).',
    'Continue Amlodipine 5mg OD. Metoprolol tapered and discontinued due to bradycardia risk. Patient educated on home BP monitoring.',
    'Next appointment in 3 months. Repeat echocardiogram in 12 months if clinically indicated.',
    '2025-03-12 15:00:00', '2025-03-12 15:00:00'),

  (3, 1, 1,
    'Borderline dyslipidaemia. LDL 115 mg/dL. Hypertension improving on current regimen.',
    'Added Atorvastatin 10mg OD at bedtime. Reinforced heart-healthy diet. Advised Mediterranean diet guidelines. Aspirin 75mg OD added for cardiovascular risk reduction.',
    'Lipid profile repeat in 3 months. Continue BP monitoring. Stress test at annual review.',
    '2025-07-01 10:30:00', '2025-07-01 10:30:00'),

  (4, 1, 1,
    'Hypertension - Well Controlled. Dyslipidaemia - Improving. SpO2 and HR within normal range.',
    'Continue Amlodipine 5mg, Atorvastatin 10mg, Aspirin 75mg. No medication changes required. Patient adherence noted as excellent.',
    'Annual cardiac assessment in October 2026. Treadmill stress test recommended. Repeat lipid profile and FBG.',
    '2025-09-15 11:00:00', '2025-09-15 11:00:00'),

  (5, 1, 1,
    'Annual assessment 2026: Hypertension and dyslipidaemia remain controlled. Patient clinically stable.',
    'No changes to current medications. Stress test scheduled. Weight management continued. Patient advised to maintain current lifestyle improvements.',
    'Stress test results review in 2 weeks via video consultation. Next in-person visit in 6 months.',
    '2026-10-07 11:30:00', '2026-10-07 11:30:00');

-- =============================================================================
-- 9. SYSTEM LOGS
-- Covers all three levels: info, warning, error
-- user_id 3 = admin, user_id 2 = doctor, user_id 1 = patient
-- =============================================================================

INSERT INTO system_logs (id, user_id, level, action, message, created_at) VALUES
  (1,  3, 'info',    'USER_CREATED',          'Admin created patient account for Aarav Sharma (patient@careconnect.test).',                  '2025-01-10 09:01:00'),
  (2,  3, 'info',    'USER_CREATED',          'Admin created doctor account for Dr. Ananya Mehta (doctor@careconnect.test). Role: doctor.', '2025-01-10 09:06:00'),
  (3,  3, 'info',    'DOCTOR_PROFILE_SETUP',  'Doctor profile created. Specialization: Cardiology. Status: active.',                        '2025-01-10 09:07:00'),
  (4,  1, 'info',    'LOGIN_SUCCESS',          'Patient Aarav Sharma logged in successfully.',                                               '2025-01-15 08:45:00'),
  (5,  2, 'info',    'LOGIN_SUCCESS',          'Doctor Dr. Ananya Mehta logged in successfully.',                                            '2025-01-15 09:00:00'),
  (6,  2, 'info',    'APPOINTMENT_CREATED',   'New appointment created for patient ID 1 with doctor ID 1 on 2025-02-05.',                   '2025-01-28 11:00:00'),
  (7,  1, 'info',    'APPOINTMENT_VIEWED',    'Patient viewed upcoming appointment details for 2025-02-05.',                                 '2025-02-01 10:00:00'),
  (8,  2, 'info',    'VITALS_RECORDED',       'Vitals recorded for patient ID 1 during appointment on 2025-02-05.',                         '2025-02-05 10:15:00'),
  (9,  2, 'info',    'PRESCRIPTION_ISSUED',   'Prescription issued: Amlodipine 5mg OD for patient ID 1.',                                   '2025-03-12 15:00:00'),
  (10, 1, 'warning', 'LOGIN_FAILED',          'Failed login attempt for patient@careconnect.test. Incorrect password.',                      '2025-04-20 07:15:00'),
  (11, 1, 'warning', 'LOGIN_FAILED',          'Second failed login attempt for patient@careconnect.test.',                                   '2025-04-20 07:16:00'),
  (12, 1, 'info',    'LOGIN_SUCCESS',          'Patient Aarav Sharma successfully logged in after failed attempts.',                          '2025-04-20 07:20:00'),
  (13, 3, 'warning', 'APPOINTMENT_CANCELLED', 'Appointment ID 4 on 2025-07-08 was cancelled. Reason: doctor unavailable.',                  '2025-07-06 08:00:00'),
  (14, NULL, 'error','APPOINTMENT_FAILED',    'Appointment creation failed: missing doctor_id. Submitted by unknown session.',               '2025-08-03 14:22:00'),
  (15, 3, 'error',   'DB_QUERY_ERROR',        'Database query failed when generating monthly report. Query timeout after 30s.',              '2025-09-01 02:00:00'),
  (16, 2, 'info',    'CLINICAL_NOTE_ADDED',   'Clinical note added for patient ID 1 by doctor ID 1 on 2025-09-15.',                         '2025-09-15 11:30:00'),
  (17, 3, 'info',    'SEED_DATA_LOADED',      'Sample seed data successfully loaded into the careconnect development database.',             '2025-01-10 09:15:00');

-- =============================================================================
-- Seed Summary
-- =============================================================================
-- Users            : 3  (1 patient, 1 doctor, 1 admin)
-- Patient profiles : 1
-- Doctor profiles  : 1
-- Appointments     : 8  (3 upcoming/in-progress + 3 completed + 1 cancelled)
-- Vital records    : 10
-- Medical history  : 10
-- Prescriptions    : 5  (3 active, 1 completed, 1 discontinued)
-- Clinical notes   : 5
-- System logs      : 17 (12 info, 3 warning, 2 error)
-- =============================================================================
