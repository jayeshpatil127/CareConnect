import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { getMedicalHistory } from '../../services/patientService';
import { MedicalHistory } from '../../types';

export default function PatientMedicalHistory() {
  const [history, setHistory] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (category) filters.category = category;
      const res = await getMedicalHistory(filters);
      setHistory(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [category]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'consultation': return 'info';
      case 'prescription': return 'success';
      case 'lab': return 'warning';
      case 'diagnosis': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
        <div className="w-full sm:w-64">
          <Select 
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'consultation', label: 'Consultation' },
              { value: 'prescription', label: 'Prescription' },
              { value: 'lab', label: 'Lab' },
              { value: 'diagnosis', label: 'Diagnosis' },
              { value: 'follow-up', label: 'Follow-up' },
            ]}
          />
        </div>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={fetchHistory} /> : 
        history.length === 0 ? <EmptyState title="No records found" message="There are no medical history records matching your criteria." /> :
        (
          <div className="relative border-l border-gray-200 ml-4 space-y-8 pb-4">
            {history.map((record) => (
              <div key={record.id} className="relative pl-8">
                <span className="absolute -left-2.5 top-1.5 flex h-5 w-5 rounded-full bg-white border-2 border-blue-500 ring-4 ring-white" />
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{record.title}</h3>
                    <div className="flex items-center gap-3">
                      <Badge variant={getCategoryColor(record.category)}>{record.category}</Badge>
                      <span className="text-sm font-medium text-gray-500">{new Date(record.recordedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {record.description && (
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed whitespace-pre-line">{record.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}