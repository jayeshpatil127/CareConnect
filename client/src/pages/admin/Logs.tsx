import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { getAdminLogs } from '../../services/adminService';
import {
  ClipboardList,
  Filter,
  Clock,
  User,
  Shield,
  AlertTriangle,
  Info,
  XCircle,
} from 'lucide-react';

const LEVEL_BADGE_VARIANTS: Record<string, 'info' | 'warning' | 'danger' | 'neutral'> = {
  info: 'info',
  warning: 'warning',
  error: 'danger',
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (levelFilter) filters.level = levelFilter;

      const res = await getAdminLogs(filters);
      setLogs(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [levelFilter]);

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600" />
            System Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time security events, account management, and clinical audit trail.
          </p>
        </div>

        {/* Level Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm self-start sm:self-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <label htmlFor="level-filter" className="text-xs font-medium text-gray-600">
            Severity:
          </label>
          <select
            id="level-filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <Card className="p-8">
          <LoadingState message="Fetching system audit logs..." />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          message={
            levelFilter
              ? `No logs match severity level "${levelFilter}".`
              : 'No system logs recorded yet.'
          }
          action={
            levelFilter ? (
              <button
                onClick={() => setLevelFilter('')}
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
                  <th scope="col" className="px-6 py-3.5">Severity</th>
                  <th scope="col" className="px-6 py-3.5">Action</th>
                  <th scope="col" className="px-6 py-3.5">Details</th>
                  <th scope="col" className="px-6 py-3.5">User</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <Badge variant={LEVEL_BADGE_VARIANTS[log.level] || 'neutral'}>
                        {log.level.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-bold text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-3.5 font-sans text-xs text-gray-700 max-w-md break-words">
                      {log.message}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-sans text-xs">
                      {log.userName ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-800 font-medium">{log.userName}</span>
                          {log.userRole && (
                            <span className="text-gray-400 capitalize">({log.userRole})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right text-gray-500 font-mono text-xs">
                      {formatTimestamp(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between font-sans">
            <span>
              Displaying <span className="font-semibold text-gray-700">{logs.length}</span> audit event{logs.length === 1 ? '' : 's'}
            </span>
            <span className="text-gray-400">MySQL &bull; system_logs</span>
          </div>
        </div>
      )}
    </div>
  );
}
