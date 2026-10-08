export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  room: string | null;
  mode: string;
  notes: string | null;
  status: string;
  patientName?: string;
  doctor?: { fullName: string; specialization: string; };
  patient?: { id?: number; fullName: string; };
}

export interface Vital {
  id: number;
  bloodPressure: string | null;
  heartRate: number | null;
  bloodGlucose: number | null;
  weight: number | null;
  spo2: number | null;
  recordedAt: string;
}

export interface MedicalHistory {
  id: number;
  category: string;
  title: string;
  description: string | null;
  recordedAt: string;
}

export interface Prescription {
  id: number;
  medicine: string;
  dosage: string;
  frequency: string;
  doctorName: string;
  refills: number;
  status: string;
  prescribedAt: string;
}