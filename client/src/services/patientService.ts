import { apiClient } from './apiClient';

export const getActiveDoctors = () => apiClient('/patient/doctors');

export const getAppointments = (filters: any = {}) => {
  const query = new URLSearchParams(filters).toString();
  return apiClient(`/patient/appointments${query ? '?' + query : ''}`);
};
export const bookAppointment = (data: any) => apiClient('/patient/appointments', { method: 'POST', body: JSON.stringify(data) });
export const cancelAppointment = (id: number) => apiClient(`/patient/appointments/${id}/cancel`, { method: 'PATCH' });

export const getVitals = () => apiClient('/patient/vitals');
export const logVital = (data: any) => apiClient('/patient/vitals', { method: 'POST', body: JSON.stringify(data) });

export const getMedicalHistory = (filters: any = {}) => {
  const query = new URLSearchParams(filters).toString();
  return apiClient(`/patient/medical-history${query ? '?' + query : ''}`);
};

export const getPrescriptions = () => apiClient('/patient/prescriptions');