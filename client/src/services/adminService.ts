import { apiClient } from './apiClient';

// 1. Overview
export const getAdminOverview = () => apiClient('/admin/overview');

// 2. Doctors
export const getAdminDoctors = (filters: { search?: string; status?: string } = {}) => {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return apiClient(`/admin/doctors${query ? '?' + query : ''}`);
};

export const addDoctor = (data: {
  fullName: string;
  email: string;
  password: string;
  specialization: string;
  status?: string;
}) => {
  return apiClient('/admin/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateDoctorStatus = (id: number, status: string) => {
  return apiClient(`/admin/doctors/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// 3. Patients
export const getAdminPatients = (filters: { search?: string } = {}) => {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return apiClient(`/admin/patients${query ? '?' + query : ''}`);
};

export const addPatient = (data: {
  fullName: string;
  email: string;
  password: string;
  bloodGroup?: string | null;
  allergies?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}) => {
  return apiClient('/admin/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// 4. Appointments
export const getAdminAppointments = (filters: { search?: string; status?: string } = {}) => {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return apiClient(`/admin/appointments${query ? '?' + query : ''}`);
};

// 5. System Logs
export const getAdminLogs = (filters: { level?: string } = {}) => {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return apiClient(`/admin/logs${query ? '?' + query : ''}`);
};