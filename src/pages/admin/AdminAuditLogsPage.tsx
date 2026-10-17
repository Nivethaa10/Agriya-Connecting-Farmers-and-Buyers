import React, { useEffect, useState } from 'react';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { api, getErrorMessage } from '../../services/api.ts';

interface AuditLogEntry {
  _id: string;
  action: string;
  targetType: string;
  targetId?: string;
  timestamp: string;
  performedBy?: { name?: string; email?: string };
  details?: Record<string, unknown>;
}

interface AdminAuditLogsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminAuditLogsPage: React.FC<AdminAuditLogsPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.get('/admin/audit-logs')
      .then((response) => {
        if (active && response.data.success) setLogs(response.data.logs);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900">Platform administration</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">Administrative Audit Trail</h1>
          <p className="mt-1 text-sm text-neutral-600">Recent verification decisions and account status changes.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/admin/dashboard')}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" /> Admin dashboard
        </button>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
            <p className="text-sm font-semibold text-neutral-800">No audit events recorded</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {logs.map((log) => (
              <article key={log._id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">{log.action.replace(/_/g, ' ')}</h2>
                  <p className="mt-1 text-xs text-neutral-600">
                    By {log.performedBy?.name || log.performedBy?.email || 'Administrator'} · {log.targetType}
                    {log.targetId ? ` · ${log.targetId}` : ''}
                  </p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p className="mt-1 break-words text-xs text-neutral-500">
                      {Object.entries(log.details)
                        .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>
                <time className="text-xs text-neutral-500 sm:text-right">
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
