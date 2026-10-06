-- =============================================================================
-- CareConnect - MySQL Database Schema
-- =============================================================================
-- File    : database/schema.sql
-- Purpose : Defines all relational tables, constraints, indexes and foreign
--           keys for the CareConnect clinic management portal.
-- Engine  : InnoDB (for full referential integrity support)
-- Charset : utf8mb4 (full Unicode, supports emoji and multi-byte characters)
-- =============================================================================
-- Usage:
--   1. Create your database:
--        CREATE DATABASE careconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--        USE careconnect;
--   2. Execute this file:
--        mysql -u <user> -p careconnect < database/schema.sql
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =============================================================================
-- 1. USERS
-- Central identity table shared by patients, doctors, and admins.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(150)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('patient', 'doctor', 'admin') NOT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. PATIENTS
-- One-to-one extension of users for patient-specific data.
-- =============================================================================

CREATE TABLE IF NOT EXISTS patients (
  id                      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id                 INT UNSIGNED  NOT NULL,
  blood_group             ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') DEFAULT NULL,
  allergies               TEXT          DEFAULT NULL,
  emergency_contact_name  VARCHAR(150)  DEFAULT NULL,
  emergency_contact_phone VARCHAR(20)   DEFAULT NULL,
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_patients_user_id (user_id),

  CONSTRAINT fk_patients_user_id
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. DOCTORS
-- One-to-one extension of users for doctor-specific data.
-- =============================================================================

CREATE TABLE IF NOT EXISTS doctors (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED NOT NULL,
  specialization VARCHAR(150) NOT NULL,
  status         ENUM('active', 'on-leave', 'inactive') NOT NULL DEFAULT 'active',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_doctors_user_id (user_id),

  CONSTRAINT fk_doctors_user_id
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. APPOINTMENTS
-- Links a patient to a doctor for a scheduled visit.
-- =============================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id       INT UNSIGNED NOT NULL,
  doctor_id        INT UNSIGNED NOT NULL,
  appointment_date DATE         NOT NULL,
  appointment_time TIME         NOT NULL,
  room             VARCHAR(50)  DEFAULT NULL,
  mode             ENUM('in-person', 'video') NOT NULL DEFAULT 'in-person',
  notes            TEXT         DEFAULT NULL,
  status           ENUM('upcoming', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- Lookups by patient, doctor, date, and status are all common query patterns
  INDEX idx_appointments_patient_id       (patient_id),
  INDEX idx_appointments_doctor_id        (doctor_id),
  INDEX idx_appointments_appointment_date (appointment_date),
  INDEX idx_appointments_status           (status),

  CONSTRAINT fk_appointments_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_appointments_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. VITALS
-- Immutable historical records of patient measurements.
-- Each row is a timestamped snapshot; rows are never edited after recording.
-- =============================================================================

CREATE TABLE IF NOT EXISTS vitals (
  id             INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  patient_id     INT UNSIGNED   NOT NULL,

  -- Stored as VARCHAR to accommodate range strings like "120/80 mmHg"
  blood_pressure VARCHAR(20)    DEFAULT NULL,

  -- beats per minute (integer)
  heart_rate     SMALLINT UNSIGNED DEFAULT NULL,

  -- mg/dL, one decimal is sufficient
  blood_glucose  DECIMAL(6, 1)  DEFAULT NULL,

  -- kg, two decimal places
  weight         DECIMAL(6, 2)  DEFAULT NULL,

  -- percentage 0-100
  spo2           TINYINT UNSIGNED DEFAULT NULL CHECK (spo2 BETWEEN 0 AND 100),

  recorded_at    DATETIME       NOT NULL,
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_vitals_patient_id  (patient_id),
  INDEX idx_vitals_recorded_at (recorded_at),

  CONSTRAINT fk_vitals_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. MEDICAL HISTORY
-- Timeline of significant medical events for a patient.
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical_history (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id  INT UNSIGNED NOT NULL,
  category    ENUM('consultation', 'prescription', 'lab', 'diagnosis', 'follow-up') NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT         DEFAULT NULL,
  recorded_at DATETIME     NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_medical_history_patient_id  (patient_id),
  INDEX idx_medical_history_category    (category),
  INDEX idx_medical_history_recorded_at (recorded_at),

  CONSTRAINT fk_medical_history_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. PRESCRIPTIONS
-- Links a doctor's medication order to a patient.
-- =============================================================================

CREATE TABLE IF NOT EXISTS prescriptions (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id   INT UNSIGNED NOT NULL,
  doctor_id    INT UNSIGNED NOT NULL,
  medicine     VARCHAR(255) NOT NULL,
  dosage       VARCHAR(100) NOT NULL,
  frequency    VARCHAR(100) NOT NULL,
  refills      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  status       ENUM('active', 'completed', 'discontinued') NOT NULL DEFAULT 'active',
  prescribed_at DATETIME    NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_prescriptions_patient_id (patient_id),
  INDEX idx_prescriptions_doctor_id  (doctor_id),
  INDEX idx_prescriptions_status     (status),

  -- Preserving prescription history even if the doctor profile is removed
  CONSTRAINT fk_prescriptions_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_prescriptions_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. CLINICAL NOTES
-- Doctors' observations, diagnoses, and treatment plans per patient visit.
-- =============================================================================

CREATE TABLE IF NOT EXISTS clinical_notes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id  INT UNSIGNED NOT NULL,
  doctor_id   INT UNSIGNED NOT NULL,
  diagnosis   TEXT         NOT NULL,
  treatment   TEXT         NOT NULL,
  follow_up   TEXT         DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_clinical_notes_patient_id (patient_id),
  INDEX idx_clinical_notes_doctor_id  (doctor_id),

  CONSTRAINT fk_clinical_notes_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_clinical_notes_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 9. SYSTEM LOGS
-- Audit trail for admin visibility. Retain logs even if the user is deleted
-- (user_id becomes NULL via SET NULL rather than cascading deletion).
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_logs (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED DEFAULT NULL,  -- nullable: SET NULL on user delete
  level      ENUM('info', 'warning', 'error') NOT NULL DEFAULT 'info',
  action     VARCHAR(150) NOT NULL,
  message    TEXT         NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_system_logs_user_id    (user_id),
  INDEX idx_system_logs_level      (level),
  INDEX idx_system_logs_created_at (created_at),

  -- Logs are preserved if a user account is deleted; only the FK reference is cleared
  CONSTRAINT fk_system_logs_user_id
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Re-enable foreign key checks
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- Schema Summary
-- =============================================================================
-- Tables  : users, patients, doctors, appointments, vitals,
--           medical_history, prescriptions, clinical_notes, system_logs
-- Total   : 9 tables
-- Engine  : InnoDB
-- Charset : utf8mb4_unicode_ci
-- =============================================================================
