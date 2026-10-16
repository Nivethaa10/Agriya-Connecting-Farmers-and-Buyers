import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  FileText,
  CreditCard,
  Scale,
  ArrowRight,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setPendingVerifications(res.data.recentPendingVerifications || []);
        setRecentAuditLogs(res.data.recentAuditLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900">
              Platform Administration Console
            </h1>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              System Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">
            System-wide oversight, corporate verification audits, user management, and trade volume governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/admin/verifications')}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Buyer Verifications</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/reports')}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            System Reports
          </button>
          <button
            onClick={() => onNavigate('/admin/users')}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            User Accounts
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.totalUsers || 0}
          </div>
          <p className="text-[11px] text-neutral-400">
            {stats?.totalFarmers || 0} Farmers · {stats?.totalBuyers || 0} Buyers
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Pending Verifications</span>
            <ShieldAlert className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.pendingVerifications || 0}
          </div>
          <p className="text-[11px] text-neutral-400">
            {stats?.verifiedBuyers || 0} Verified Corporate Buyers
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Active Contracts</span>
            <FileText className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.activeRelationships || 0}
          </div>
          <p className="text-[11px] text-neutral-400">
            {stats?.publishedContracts || 0} Published Demands
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Total Trade Volume</span>
            <CreditCard className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-emerald-950 tabular-nums">
            ₹{loading ? '...' : (stats?.totalTradeVolumeINR || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-neutral-400">
            ₹{(stats?.paidTradeVolumeINR || 0).toLocaleString('en-IN')} settled
          </p>
        </div>
      </div>

      {/* Main Grid: Pending Verifications & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pending Verification Requests */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                Buyer Verification Queue
              </h2>
              <p className="text-xs text-neutral-500">
                Institutional entities awaiting legal credential audit
              </p>
            </div>
            <button
              onClick={() => onNavigate('/admin/verifications')}
              className="text-xs font-semibold text-emerald-900 hover:underline"
            >
              Open Queue
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400">Loading verification queue...</div>
          ) : pendingVerifications.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">Verification queue is clear</p>
              <p className="text-[11px] text-neutral-500">
                All submitted buyer incorporation requests have been audited.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {pendingVerifications.map((p) => (
                <div key={p._id} className="py-3.5 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-900">{p.companyName}</h4>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Pending Audit
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Type: {p.businessType} · CIN: {p.registrationNumber || 'Not entered'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      Requested on:{' '}
                      {new Date(p.verificationRequestedAt || p.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <button
                      onClick={() => onNavigate('/admin/verifications')}
                      className="text-emerald-900 font-semibold hover:underline"
                    >
                      Audit Documents →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Logs */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                Administrative Audit Trail
              </h2>
              <p className="text-xs text-neutral-500">Recent security and status operations</p>
            </div>
            <button
              onClick={() => onNavigate('/admin/audit-logs')}
              className="text-xs font-semibold text-emerald-900 hover:underline"
            >
              Full Trail
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400">Loading audit trail...</div>
          ) : recentAuditLogs.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <FileText className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">No recent audit logs</p>
              <p className="text-[11px] text-neutral-500">
                Administrative verifications and account toggles are logged here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentAuditLogs.map((log) => (
                <div key={log._id} className="py-3 space-y-1 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-neutral-900">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-neutral-400 tabular-nums">
                      {new Date(log.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    By: {log.performedBy?.name || 'Administrator'} · Type: {log.targetType}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
