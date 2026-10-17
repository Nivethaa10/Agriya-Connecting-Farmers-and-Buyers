import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { FarmerProfile } from '../../types/index.ts';
import {
  Sprout,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Wheat,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface FarmerDashboardProps {
  onNavigate: (path: string) => void;
  onOpenUploadDoc: () => void;
  onOpenSupport: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onNavigate,
  onOpenUploadDoc,
  onOpenSupport,
}) => {
  const { user, profile } = useAuth();
  const farmerProfile = profile as FarmerProfile | null;
  const [stats, setStats] = useState<any>(null);
  const [recentRelationships, setRecentRelationships] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farmer/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentRelationships(res.data.recentRelationships || []);
        setRecentApplications(res.data.recentApplications || []);
      }
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
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
              Welcome back, {user?.name}
            </h1>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Farmer Producer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">
            {farmerProfile?.farmName || 'Farm Workspace'} · {farmerProfile?.location?.district || 'Location'}{' '}
            {farmerProfile?.location?.state ? `, ${farmerProfile?.location?.state}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/explore')}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Browse Open Contracts</span>
          </button>
          <button
            onClick={() => onNavigate('/farmer/profile')}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Edit Farm Details
          </button>
          <button
            onClick={onOpenSupport}
            className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Need Help?
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Active Contracts</span>
            <Sprout className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.activeContractsCount || 0}
          </div>
          <p className="text-[11px] text-neutral-400">Under active cultivation & delivery</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Pending Applications</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.pendingApplicationsCount || 0}
          </div>
          <p className="text-[11px] text-neutral-400">Awaiting corporate buyer review</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Settled Earnings</span>
            <CreditCard className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-emerald-950 tabular-nums">
            ₹{loading ? '...' : (stats?.totalEarnedINR || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-neutral-400">Released to bank account</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Completed Contracts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.completedContractsCount || 0}
          </div>
          <p className="text-[11px] text-neutral-400">Successfully delivered</p>
        </div>
      </div>

      {/* Main Grid: Active Contracts & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Contract Relationships */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                Active Cultivation Commitments
              </h2>
              <p className="text-xs text-neutral-500">
                Live farming agreements requiring milestone logs or dispatch
              </p>
            </div>
            <button
              onClick={() => onNavigate('/farmer/active-contracts')}
              className="text-xs font-semibold text-emerald-900 hover:underline"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400">Loading contracts...</div>
          ) : recentRelationships.length === 0 ? (
            <div className="p-10 text-center space-y-3 bg-neutral-50/70 rounded-xl border border-neutral-200/60">
              <Wheat className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">No active contracts yet</p>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                Explore published contracts and submit an application to start a guaranteed harvest relationship.
              </p>
              <button
                onClick={() => onNavigate('/explore')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors"
              >
                Browse Contracts
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentRelationships.map((rel) => (
                <div
                  key={rel._id}
                  onClick={() => onNavigate(`/farmer/lifecycle/${rel._id}`)}
                  className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-700 transition-colors cursor-pointer space-y-3 hover:bg-neutral-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">
                        {rel.contractId?.title || rel.cropName}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Buyer: {rel.buyerId?.name || 'Institutional Partner'}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {rel.lifecycleStage.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Lifecycle last updated {new Date(rel.updatedAt).toLocaleString('en-IN')}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Lifecycle Progress</span>
                      <span className="font-bold text-neutral-900 tabular-nums">
                        {rel.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-800 rounded-full transition-all"
                        style={{ width: `${rel.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
                    <span>
                      Agreed:{' '}
                      <strong className="text-neutral-900 tabular-nums">
                        {rel.agreedQuantityTons} tons
                      </strong>
                    </span>
                    <span className="font-bold text-emerald-950 tabular-nums">
                      ₹{rel.totalAgreedValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications Log */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                Application History
              </h2>
              <p className="text-xs text-neutral-500">Recent applications submitted to buyers</p>
            </div>
            <button
              onClick={() => onNavigate('/farmer/applications')}
              className="text-xs font-semibold text-emerald-900 hover:underline"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400">Loading applications...</div>
          ) : recentApplications.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-neutral-50/70 rounded-xl border border-neutral-200/60">
              <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">No applications on file</p>
              <p className="text-[11px] text-neutral-500">
                When you apply to open contracts, you can track approvals and feedback here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentApplications.map((app) => (
                <div key={app._id} className="py-3.5 space-y-1.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-900 truncate max-w-[200px]">
                      {app.contractId?.cropName || 'Crop'}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    Contract: {app.contractId?.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums">
                    <span>Offered: {app.quantityOfferedTons} tons</span>
                    <span>
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Farm Documents Prompt */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-neutral-900">Land Records & Farm Verification</h4>
            <p className="text-neutral-500 leading-relaxed">
              Uploading verified land records, Aadhaar, and soil reports improves your application approval rate with corporate buyers.
            </p>
            <div className="pt-1 flex gap-2">
              <button
                onClick={onOpenUploadDoc}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Upload Document
              </button>
              <button
                onClick={() => onNavigate('/farmer/profile')}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:underline"
              >
                View Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
