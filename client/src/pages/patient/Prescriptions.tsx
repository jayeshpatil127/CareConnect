import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Badge } from '../../components/ui/Badge';
import { getPrescriptions } from '../../services/patientService';
import { Prescription } from '../../types';
import { Pill, UserRound, Repeat, Calendar } from 'lucide-react';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await getPrescriptions();
      setPrescriptions(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={fetchPrescriptions} /> : 
        prescriptions.length === 0 ? <EmptyState title="No prescriptions" message="You don't have any prescriptions." /> :
        (
          <div className="grid gap-4 md:grid-cols-2">
            {prescriptions.map(p => (
              <Card key={p.id} className="p-5 flex flex-col hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{p.medicine}</h3>
                      <p className="text-sm font-medium text-blue-600">{p.dosage}</p>
                    </div>
                  </div>
                  <Badge variant={p.status === 'active' ? 'success' : 'neutral'}>{p.status}</Badge>
                </div>
                
                <div className="space-y-3 mt-2 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-2">
                    <Repeat className="w-4 h-4 mt-0.5 text-gray-400" />
                    <span><span className="font-medium text-gray-900">Frequency:</span> {p.frequency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-gray-400" />
                    <span><span className="font-medium text-gray-900">Prescribed by:</span> {p.doctorName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200/60">
                     <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400"/> {new Date(p.prescribedAt).toLocaleDateString()}</span>
                     <span className="font-medium bg-white px-2 py-1 rounded border border-gray-200 text-xs">Refills: {p.refills}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  );
}