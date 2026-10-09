import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getVitals, logVital } from '../../services/patientService';
import { Vital } from '../../types';
import { Activity, Plus, X } from 'lucide-react';

export default function PatientVitals() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isLogging, setIsLogging] = useState(false);
  const [logData, setLogData] = useState({
    bloodPressure: '', heartRate: '', bloodGlucose: '', weight: '', spo2: ''
  });
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState('');

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const res = await getVitals();
      setVitals(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVitals(); }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogLoading(true);
    setLogError('');
    try {
      // Clean up empty strings
      const payload: any = {};
      if (logData.bloodPressure) payload.bloodPressure = logData.bloodPressure;
      if (logData.heartRate) payload.heartRate = parseInt(logData.heartRate);
      if (logData.bloodGlucose) payload.bloodGlucose = parseFloat(logData.bloodGlucose);
      if (logData.weight) payload.weight = parseFloat(logData.weight);
      if (logData.spo2) payload.spo2 = parseInt(logData.spo2);
      
      await logVital(payload);
      setIsLogging(false);
      fetchVitals();
      setLogData({bloodPressure: '', heartRate: '', bloodGlucose: '', weight: '', spo2: ''});
    } catch (err: any) {
      setLogError(err.message);
    } finally {
      setLogLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Vitals History</h1>
        <Button onClick={() => setIsLogging(true)}><Plus className="w-4 h-4" /> Log Vitals</Button>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={fetchVitals} /> : 
        vitals.length === 0 ? <EmptyState title="No vitals recorded" message="You haven't logged any vitals yet." /> :
        (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-900">Date & Time</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Blood Pressure</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Heart Rate</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Glucose (mg/dL)</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Weight (kg)</th>
                  <th className="px-6 py-4 font-medium text-gray-900">SpO2 (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vitals.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{new Date(v.recordedAt).toLocaleString()}</td>
                    <td className="px-6 py-4">{v.bloodPressure || '-'}</td>
                    <td className="px-6 py-4">{v.heartRate || '-'}</td>
                    <td className="px-6 py-4">{v.bloodGlucose || '-'}</td>
                    <td className="px-6 py-4">{v.weight || '-'}</td>
                    <td className="px-6 py-4">{v.spo2 || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {/* Log Modal */}
      {isLogging && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
          <Card className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" /> Log Vitals</h2>
              <button onClick={() => setIsLogging(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleLog} className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-6">
              {logError && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{logError}</div>}
              
              <Input label="Blood Pressure (e.g. 120/80)" value={logData.bloodPressure} onChange={(e: any) => setLogData({...logData, bloodPressure: e.target.value})} />
              <Input label="Heart Rate (bpm)" type="number" min="0" max="300" value={logData.heartRate} onChange={(e: any) => setLogData({...logData, heartRate: e.target.value})} />
              <Input label="Blood Glucose (mg/dL)" type="number" step="0.1" value={logData.bloodGlucose} onChange={(e: any) => setLogData({...logData, bloodGlucose: e.target.value})} />
              <Input label="Weight (kg)" type="number" step="0.1" value={logData.weight} onChange={(e: any) => setLogData({...logData, weight: e.target.value})} />
              <Input label="SpO2 (%)" type="number" min="0" max="100" value={logData.spo2} onChange={(e: any) => setLogData({...logData, spo2: e.target.value})} />
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setIsLogging(false)}>Cancel</Button>
                <Button type="submit" disabled={logLoading}>{logLoading ? 'Saving...' : 'Save Vitals'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}