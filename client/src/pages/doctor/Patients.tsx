import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import {
  getDoctorPatients,
  getDoctorPatientDetails,
} from '../../services/doctorService';
import {
  Users,
  Search,
  Phone,
  Mail,
  AlertTriangle,
  Calendar,
  FileText,
  Clock,
  X,
  HeartPulse,
} from 'lucide-react';

export default function DoctorPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Patient detail modal state
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientDetails, setPatientDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const fetchPatients = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await getDoctorPatients(query ? { search: query } : {});
      setPatients(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectPatient = async (id: number) => {
    setSelectedPatientId(id);
    setDetailsLoading(true);
    setDetailsError('');
    try {
      const res = await getDoctorPatientDetails(id);
      setPatientDetails(res.data);
    } catch (err: any) {
      setDetailsError(err.message || 'Failed to load patient details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedPatientId(null);
    setPatientDetails(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            My Patients
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Search and view clinical profiles of patients under your care.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Patient List Table */}
      {loading ? (
        <Card className="p-8">
          <LoadingState message="Fetching patient directory..." />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchPatients(searchTerm)} />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          message={
            searchTerm
              ? `No patients match the search "${searchTerm}".`
              : 'You do not have any active patients in your directory.'
          }
          action={
            searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Clear search
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
                  <th scope="col" className="px-6 py-3.5">Patient Name</th>
                  <th scope="col" className="px-6 py-3.5">Email</th>
                  <th scope="col" className="px-6 py-3.5">Blood Group</th>
                  <th scope="col" className="px-6 py-3.5">Total Visits</th>
                  <th scope="col" className="px-6 py-3.5">Last Visit</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs flex-shrink-0">
                          {p.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{p.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.email}</td>
                    <td className="px-6 py-4">
                      {p.bloodGroup ? (
                        <Badge variant="info">{p.bloodGroup}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{p.totalVisits}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {p.lastVisitDate ? new Date(p.lastVisitDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSelectPatient(p.id)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  {patientDetails?.fullName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {patientDetails?.fullName || 'Patient Details'}
                  </h3>
                  <p className="text-xs text-gray-500">{patientDetails?.email}</p>
                </div>
              </div>
              <button
                onClick={closeDetails}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {detailsLoading ? (
                <LoadingState message="Loading patient clinical history..." />
              ) : detailsError ? (
                <ErrorState message={detailsError} />
              ) : patientDetails ? (
                <>
                  {/* Medical Information Cards */}
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Blood Group</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {patientDetails.bloodGroup || 'Not recorded'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Emergency Contact</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                        {patientDetails.emergencyContactName || 'None'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Emergency Phone</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                        {patientDetails.emergencyContactPhone || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Allergies Alert */}
                  {patientDetails.allergies && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900">Known Allergies</p>
                        <p className="text-sm text-amber-800 mt-0.5">{patientDetails.allergies}</p>
                      </div>
                    </div>
                  )}

                  {/* Consultations History */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Consultation History ({patientDetails.appointments?.length || 0})
                    </h4>
                    {patientDetails.appointments?.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No past appointments recorded.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {patientDetails.appointments?.map((a: any) => (
                          <div
                            key={a.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-gray-800">
                                {new Date(a.appointmentDate).toLocaleDateString()} at{' '}
                                {a.appointmentTime?.substring(0, 5)}
                              </span>
                              <p className="text-gray-500 mt-0.5 capitalize">
                                Mode: {a.mode} {a.room ? `• Room: ${a.room}` : ''}
                              </p>
                            </div>
                            <Badge variant={a.status === 'completed' ? 'success' : 'neutral'}>
                              {a.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Clinical Notes */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Recorded Clinical Notes ({patientDetails.clinicalNotes?.length || 0})
                    </h4>
                    {patientDetails.clinicalNotes?.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No clinical notes recorded for this patient yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {patientDetails.clinicalNotes?.map((n: any) => (
                          <div
                            key={n.id}
                            className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 text-xs space-y-1.5"
                          >
                            <div className="flex justify-between items-center text-gray-400">
                              <span className="font-medium text-blue-900">Diagnosis</span>
                              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-800 font-semibold">{n.diagnosis}</p>
                            <p className="text-gray-600">
                              <span className="font-medium text-gray-700">Treatment:</span> {n.treatment}
                            </p>
                            {n.followUp && (
                              <p className="text-blue-700">
                                <span className="font-medium">Follow-up:</span> {n.followUp}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeDetails}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
