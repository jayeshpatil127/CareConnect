import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { getDoctorAppointments, updateAppointmentStatus } from '../../services/doctorService';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Filter,
  Loader2,
  CalendarCheck,
} from 'lucide-react';

const STATUS_BADGE_VARIANTS: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  upcoming: 'info',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status update state tracking
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    setUpdateError(null);
    try {
      const filters: { status?: string } = {};
      if (statusFilter) {
        filters.status = statusFilter;
      }
      const res = await getDoctorAppointments(filters);
      setAppointments(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleStatusChange = async (appointmentId: number, currentStatus: string, newStatus: string) => {
    if (newStatus === currentStatus) return;

    setUpdatingId(appointmentId);
    setUpdateError(null);
    setSuccessMessage(null);

    try {
      const res = await updateAppointmentStatus(appointmentId, newStatus);
      if (res.success) {
        // Update local state with the returned status from server
        const updatedStatus = res.data?.status || newStatus;
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId ? { ...appt, status: updatedStatus } : appt
          )
        );
        setSuccessMessage(`Appointment #${appointmentId} status changed to ${updatedStatus}.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setUpdateError(res.message || 'Failed to update appointment status');
      }
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-blue-600" />
            Appointments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your patient schedule and update consultation statuses.
          </p>
        </div>

        {/* Filter Area */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <label htmlFor="status-filter" className="text-xs font-medium text-gray-600">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In-Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm transition-all animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {updateError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm transition-all">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{updateError}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <Card className="p-8">
          <LoadingState message="Fetching doctor appointments..." />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAppointments} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          message={
            statusFilter
              ? `No appointments found matching the "${statusFilter}" status filter.`
              : 'You do not have any appointments scheduled.'
          }
          action={
            statusFilter ? (
              <button
                onClick={() => setStatusFilter('')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Clear filter
              </button>
            ) : null
          }
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Room
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Mode
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Update Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt) => {
                  const patientDisplayName =
                    appt.patientName || appt.patient?.fullName || 'Patient';
                  const isUpdating = updatingId === appt.id;

                  return (
                    <tr
                      key={appt.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Patient */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs flex-shrink-0">
                            {patientDisplayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 leading-snug">
                              {patientDisplayName}
                            </p>
                            <p className="text-xs text-gray-400">ID: #{appt.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 font-medium text-gray-900 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(appt.appointmentDate)}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {formatTime(appt.appointmentTime)}
                          </span>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appt.room ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700 font-medium bg-gray-100 px-2 py-0.5 rounded">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {appt.room}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Mode */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appt.mode === 'video' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            <Video className="w-3 h-3" />
                            Video
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                            <User className="w-3 h-3 text-gray-500" />
                            In-Person
                          </span>
                        )}
                      </td>

                      {/* Current Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            STATUS_BADGE_VARIANTS[appt.status.toLowerCase()] || 'neutral'
                          }
                        >
                          {appt.status}
                        </Badge>
                      </td>

                      {/* Action: Update Status Dropdown */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {appt.status === 'cancelled' ? (
                          <span className="text-xs text-gray-400 italic">
                            Cancelled (No updates)
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            {isUpdating ? (
                              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium px-2 py-1">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                              </div>
                            ) : (
                              <select
                                value={appt.status}
                                onChange={(e) =>
                                  handleStatusChange(appt.id, appt.status, e.target.value)
                                }
                                disabled={isUpdating}
                                className="text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-md px-2.5 py-1.5 outline-none hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors shadow-sm"
                                aria-label={`Update status for appointment ${appt.id}`}
                              >
                                <option value="upcoming">Upcoming</option>
                                <option value="in-progress">In-Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span>
              Showing <span className="font-semibold text-gray-700">{appointments.length}</span> appointment
              {appointments.length === 1 ? '' : 's'}
            </span>
            <span className="text-gray-400">Doctor Portal &bull; Live MySQL Sync</span>
          </div>
        </div>
      )}
    </div>
  );
}
