import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { getDoctorOverview } from '../../services/doctorService';
import { Calendar, Users, Clock, Video, MapPin, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_BADGE_VARIANTS: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  upcoming: 'info',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export default function DoctorOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overviewData, setOverviewData] = useState<{
    metrics: {
      todaySchedule: number;
      activePatients: number;
      pendingConsultations: number;
    };
    todayAppointments: any[];
  } | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDoctorOverview();
      setOverviewData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <Card className="p-8">
        <LoadingState message="Loading doctor dashboard..." />
      </Card>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchOverview} />;
  }

  const metrics = overviewData?.metrics || {
    todaySchedule: 0,
    activePatients: 0,
    pendingConsultations: 0,
  };

  const todayAppointments = overviewData?.todayAppointments || [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back. Here is your practice summary for today.
        </p>
      </div>

      {/* Required 3 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Today's Schedule */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Today's Schedule
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.todaySchedule}
              </p>
              <p className="text-xs text-gray-500 mt-1">Consultation{metrics.todaySchedule === 1 ? '' : 's'} today</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* 2. Active Patients */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Active Patients
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.activePatients}
              </p>
              <p className="text-xs text-gray-500 mt-1">Unique assigned patients</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* 3. Pending Consultations */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Pending Consultations
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.pendingConsultations}
              </p>
              <p className="text-xs text-gray-500 mt-1">Upcoming or in-progress</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Schedule List */}
      <Card>
        <CardHeader
          title="Today's Appointments"
          action={
            <Link
              to="/doctor/appointments"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all &rarr;
            </Link>
          }
        />
        <CardContent>
          {todayAppointments.length === 0 ? (
            <EmptyState
              title="No appointments today"
              message="You have no patient consultations scheduled for today."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {todayAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                      {appt.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {appt.patientName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {appt.appointmentTime?.substring(0, 5)}
                        </span>
                        {appt.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {appt.room}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          {appt.mode === 'video' ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-indigo-500" />
                              Video
                            </>
                          ) : (
                            <>
                              <Activity className="w-3.5 h-3.5 text-slate-500" />
                              In-Person
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge
                      variant={
                        STATUS_BADGE_VARIANTS[appt.status?.toLowerCase()] || 'neutral'
                      }
                    >
                      {appt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}