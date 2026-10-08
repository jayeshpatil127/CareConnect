import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { getAppointments, bookAppointment, cancelAppointment, getActiveDoctors } from '../../services/patientService';
import { Appointment } from '../../types';
import { Calendar as CalendarIcon, Video, MapPin, X } from 'lucide-react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  // Booking Modal
  const [isBooking, setIsBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    mode: 'in-person',
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Active doctors loaded from API
  const [activeDoctors, setActiveDoctors] = useState<{ id: number; fullName: string; specialization: string }[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (status) filters.status = status;
      if (search) filters.search = search;
      const res = await getAppointments(filters);
      setAppointments(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await getActiveDoctors();
      setActiveDoctors(res.data || []);
      // Pre-select first doctor if available
      if (res.data && res.data.length > 0) {
        setBookingData(prev => ({ ...prev, doctorId: String(res.data[0].id) }));
      }
    } catch {
      // Non-critical: leave list empty; user will see "No active doctors"
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [status, search]);

  const openBookingModal = () => {
    setBookingData({ doctorId: '', appointmentDate: '', appointmentTime: '', mode: 'in-person', notes: '' });
    setBookingError('');
    setIsBooking(true);
    fetchActiveDoctors();
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      fetchAppointments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.doctorId) {
      setBookingError('Please select a doctor.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      await bookAppointment({
        ...bookingData,
        doctorId: parseInt(bookingData.doctorId)
      });
      setIsBooking(false);
      fetchAppointments();
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'upcoming': return <Badge variant="info">Upcoming</Badge>;
      case 'in-progress': return <Badge variant="warning">In Progress</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge>{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <Button onClick={openBookingModal}>Book Appointment</Button>
      </div>

      <Card className="p-4 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search doctor or specialty..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />
        </div>
      </Card>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={fetchAppointments} /> :
        appointments.length === 0 ? <EmptyState title="No appointments found" message="Try adjusting your filters or book a new appointment." /> :
          (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map(appt => (
                <Card key={appt.id} className="flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      {getStatusBadge(appt.status)}
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600 flex items-center gap-1">
                        {appt.mode === 'video' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        <span className="capitalize">{appt.mode}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-1">{appt.doctor?.fullName}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-4">{appt.doctor?.specialization}</p>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime.substring(0, 5)}</span>
                      </div>
                      {appt.notes && (
                        <p className="mt-3 text-gray-500 italic text-xs bg-gray-50 p-2 rounded border border-gray-100">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  {appt.status === 'upcoming' && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                      <Button variant="danger" className="text-xs py-1.5 px-3" onClick={() => handleCancel(appt.id)}>Cancel</Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )
      }

      {/* Book Appointment Modal */}
      {isBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold">Book Appointment</h2>
              <button onClick={() => setIsBooking(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleBook} className="p-6 space-y-4">
              {bookingError && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{bookingError}</div>}

              {doctorsLoading ? (
                <div className="text-sm text-gray-500 text-center py-4">Loading available doctors...</div>
              ) : activeDoctors.length === 0 ? (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded">
                  No active doctors are available for booking at this time.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Doctor <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={bookingData.doctorId}
                    onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">— Select a doctor —</option>
                    {activeDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.fullName} ({doc.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date" type="date" required
                  value={bookingData.appointmentDate} onChange={(e: any) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                />
                <Input
                  label="Time" type="time" required
                  value={bookingData.appointmentTime} onChange={(e: any) => setBookingData({ ...bookingData, appointmentTime: e.target.value })}
                />
              </div>
              <Select
                label="Mode" required
                value={bookingData.mode} onChange={(e: any) => setBookingData({ ...bookingData, mode: e.target.value })}
                options={[{ value: 'in-person', label: 'In Person' }, { value: 'video', label: 'Video Call' }]}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  className="border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  rows={3}
                  value={bookingData.notes} onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setIsBooking(false)}>Cancel</Button>
                <Button type="submit" disabled={bookingLoading || activeDoctors.length === 0}>
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}