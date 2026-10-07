import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Badge } from '../../components/ui/Badge';
import { getAppointments, getVitals, getMedicalHistory } from '../../services/patientService';
import { Appointment, Vital, MedicalHistory } from '../../types';
import { Calendar, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  const [latestVital, setLatestVital] = useState<Vital | null>(null);
  const [recentHistory, setRecentHistory] = useState<MedicalHistory[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch upcoming appointments
      const apptRes = await getAppointments({ status: 'upcoming' });
      if (apptRes.data && apptRes.data.length > 0) {
        setNextAppt(apptRes.data[0]);
      }

      // Fetch vitals
      const vitalsRes = await getVitals();
      if (vitalsRes.data && vitalsRes.data.length > 0) {
        setLatestVital(vitalsRes.data[0]);
      }

      // Fetch medical history
      const historyRes = await getMedicalHistory();
      if (historyRes.data) {
        setRecentHistory(historyRes.data.slice(0, 3));
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Patient Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Appointment Card */}
        <Card>
          <CardHeader title="Next Appointment" action={<Calendar className="w-5 h-5 text-gray-400" />} />
          <CardContent>
            {nextAppt ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg text-gray-900">{new Date(nextAppt.appointmentDate).toLocaleDateString()} at {nextAppt.appointmentTime.substring(0, 5)}</p>
                    <p className="text-gray-600">with {nextAppt.doctor?.fullName}</p>
                  </div>
                  <Badge variant="info">{nextAppt.mode}</Badge>
                </div>
                <div className="pt-3 border-t border-gray-100 flex gap-2">
                   <Link to="/patient/appointments" className="text-sm font-medium text-blue-600 hover:underline">View all appointments &rarr;</Link>
                </div>
              </div>
            ) : (
              <EmptyState title="No upcoming appointments" message="You don't have any appointments scheduled." />
            )}
          </CardContent>
        </Card>

        {/* Latest Vitals Card */}
        <Card>
          <CardHeader title="Latest Vitals" action={<Activity className="w-5 h-5 text-gray-400" />} />
          <CardContent>
            {latestVital ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-medium">Blood Pressure</p>
                    <p className="text-xl font-bold text-gray-900">{latestVital.bloodPressure || '--'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-medium">Heart Rate</p>
                    <p className="text-xl font-bold text-gray-900">{latestVital.heartRate ? `${latestVital.heartRate} bpm` : '--'}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  Recorded: {new Date(latestVital.recordedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <EmptyState title="No vitals recorded" message="You haven't logged any vitals yet." />
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Recent Medical History</h2>
      {recentHistory.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <ul className="divide-y divide-gray-100">
            {recentHistory.map((item) => (
              <li key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-full text-blue-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    <Badge variant="neutral">{item.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(item.recordedAt).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState title="No medical history" message="No records found in your medical history." />
      )}
    </div>
  );
}