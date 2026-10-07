import { apiClient } from './apiClient';

export const getDoctorAppointments = (filters: any = {}) => {
  const query = new URLSearchParams(filters).toString();
  return apiClient(`/doctor/appointments${query ? '?' + query : ''}`);
};

export const updateAppointmentStatus = (id: number, status: string) => {
  return apiClient(`/doctor/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};