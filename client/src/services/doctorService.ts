import { apiClient } from './apiClient';

// 1. Overview
export const getDoctorOverview = () => apiClient('/doctor/overview');

// 2. Appointments
export const getDoctorAppointments = (filters: { status?: string } = {}) => {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return apiClient(`/doctor/appointments${query ? '?' + query : ''}`);
};

export const updateAppointmentStatus = (id: number, status: string) => {
  return apiClient(`/doctor/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// 3. Patients
export const getDoctorPatients = (filters: { search?: string } = {}) => {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return apiClient(`/doctor/patients${query ? '?' + query : ''}`);
};

export const getDoctorPatientDetails = (id: number) => {
  return apiClient(`/doctor/patients/${id}`);
};

// 4. Clinical Notes
export const getClinicalNotes = (filters: { patientId?: number } = {}) => {
  const query = new URLSearchParams(filters as any).toString();
  return apiClient(`/doctor/clinical-notes${query ? '?' + query : ''}`);
};

export const createClinicalNote = (data: {
  patientId: number;
  diagnosis: string;
  treatment: string;
  followUp?: string | null;
}) => {
  return apiClient('/doctor/clinical-notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// 5. Profile
export const getDoctorProfile = () => apiClient('/doctor/profile');

export const updateDoctorProfile = (data: {
  fullName?: string;
  specialization?: string;
  status?: string;
}) => {
  return apiClient('/doctor/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};