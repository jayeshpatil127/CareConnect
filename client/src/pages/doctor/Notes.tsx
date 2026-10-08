import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import {
  getClinicalNotes,
  createClinicalNote,
  getDoctorPatients,
} from '../../services/doctorService';
import {
  ClipboardList,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Clock,
} from 'lucide-react';

export default function DoctorNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatment: '',
    followUp: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [notesRes, patientsRes] = await Promise.all([
        getClinicalNotes(),
        getDoctorPatients(),
      ]);
      setNotes(notesRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clinical notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!formData.patientId) {
      setFormError('Please select a patient');
      return;
    }
    if (!formData.diagnosis.trim()) {
      setFormError('Diagnosis is required');
      return;
    }
    if (!formData.treatment.trim()) {
      setFormError('Treatment is required');
      return;
    }

    setFormLoading(true);
    try {
      const res = await createClinicalNote({
        patientId: Number(formData.patientId),
        diagnosis: formData.diagnosis.trim(),
        treatment: formData.treatment.trim(),
        followUp: formData.followUp.trim() || null,
      });

      if (res.success) {
        setSuccessMessage('Clinical note successfully recorded.');
        setFormData({
          patientId: '',
          diagnosis: '',
          treatment: '',
          followUp: '',
        });
        setShowAddForm(false);
        // Refresh notes list
        const refreshedNotes = await getClinicalNotes();
        setNotes(refreshedNotes.data || []);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create clinical note');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600" />
            Clinical Notes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Record and view diagnoses, treatments, and follow-up plans for your patients.
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Clinical Note'}
        </Button>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Add Clinical Note Form */}
      {showAddForm && (
        <Card className="p-6 border-blue-200 bg-blue-50/20 shadow-md transition-all">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            New Clinical Note
          </h2>

          <form onSubmit={handleAddNote} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <Select
                label="Select Patient"
                required
                value={formData.patientId}
                onChange={(e: any) =>
                  setFormData({ ...formData, patientId: e.target.value })
                }
                options={patients.map((p) => ({
                  value: p.id,
                  label: `${p.fullName} (${p.email})`,
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Enter patient diagnosis and clinical assessment..."
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Enter prescribed treatment, medication regimen, or procedures..."
                value={formData.treatment}
                onChange={(e) =>
                  setFormData({ ...formData, treatment: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-Up Plan
              </label>
              <input
                type="text"
                placeholder="e.g. Schedule follow-up visit in 2 weeks, repeat blood test"
                value={formData.followUp}
                onChange={(e) =>
                  setFormData({ ...formData, followUp: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Saving note...' : 'Save Clinical Note'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Notes List */}
      {loading ? (
        <Card className="p-8">
          <LoadingState message="Fetching clinical records..." />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : notes.length === 0 ? (
        <EmptyState
          title="No clinical notes recorded"
          message="You have not created any clinical notes yet. Use the button above to record your first consultation note."
          action={
            <Button onClick={() => setShowAddForm(true)} className="mt-3">
              Add First Clinical Note
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {notes.map((n) => (
            <Card
              key={n.id}
              className="p-5 flex flex-col justify-between hover:border-blue-200 transition-colors shadow-sm"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {n.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {n.patientName}
                      </p>
                      <p className="text-xs text-gray-400">Patient ID: #{n.patientId}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3 mt-4 text-sm">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-0.5">
                      Diagnosis
                    </span>
                    <p className="font-semibold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {n.diagnosis}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-0.5">
                      Treatment
                    </span>
                    <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {n.treatment}
                    </p>
                  </div>

                  {n.followUp && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
                        Follow-Up
                      </span>
                      <p className="text-blue-900 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 font-medium">
                        {n.followUp}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
                <span>Note #{n.id}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(n.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
