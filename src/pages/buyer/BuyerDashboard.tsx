import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { BuyerProfile } from '../../types/index.ts';
import {
  Building2,
  FileText,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Plus,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface BuyerDashboardProps {
  onNavigate: (path: string) => void;
  onOpenUploadDoc: () => void;
  onOpenSupport: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  onNavigate,
  onOpenUploadDoc,
  onOpenSupport,
}) => {
  const { user, profile } = useAuth();
  const buyerProfile = profile as BuyerProfile | null;
  const [stats, setStats] = useState<any>(null);
  const [recentContracts, setRecentContracts] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/buyer/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentContracts(res.data.recentContracts || []);
        setRecentApplications(res.data.recentApplications || []);
      }
    } catch (err) {
      console.error('Failed to load buyer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const verificationStatus = stats?.verificationStatus || buyerProfile?.verificationStatus || 'not_submitted';
  const isVerified = verificationStatus === 'verified';
  const applicationReviewContractId =
    recentApplications.find((application) => application.contractId?._id)?.contractId?._id ||
    recentContracts[0]?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900">
              {buyerProfile?.companyName || user?.name}
            </h1>
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isVerified
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : verificationStatus === 'pending'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
            >
              {verificationStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">
            {buyerProfile?.businessType || 'Institutional Procurement Entity'} ·{' '}
            {buyerProfile?.address?.city ? `${buyerProfile.address.city}, ` : ''}
            {buyerProfile?.address?.state || 'Verified Jurisdiction'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/buyer/contracts/new')}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Contract Demand</span>
          </button>
          <button
            onClick={() => onNavigate('/buyer/profile')}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Business Verification
          </button>
          <button
            onClick={onOpenSupport}
            className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Support
          </button>
        </div>
      </div>

      {/* Verification Notice Banner if not verified */}
      {!isVerified && (
        <div
          className={`p-5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            verificationStatus === 'pending'
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : verificationStatus === 'rejected'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-neutral-50 border-neutral-300 text-neutral-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">
                {verificationStatus === 'pending'
                  ? 'Verification In Review: Your business documents are currently pending Administrator audit.'
                  : verificationStatus === 'rejected'
                  ? 'Verification Declined: Please review the audit feedback on your profile and resubmit corrected documents.'
                  : 'Action Required: You are currently an unverified buyer. Only administrator-verified buyers may publish contracts.'}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Unverified buyers may compose and save contract drafts, but verification is required before contracts can accept applications.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/buyer/profile')}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white border border-current hover:bg-neutral-100 transition-colors shrink-0"
          >
            Review Profile & Documents
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Published Contracts</span>
            <FileText className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.publishedContracts || 0}
          </div>
          <p className="text-[11px] text-neutral-400">Open to farmer applications</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Pending Farmer Applications</span>
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.pendingApplications || 0}
          </div>
          <p className="text-[11px] text-neutral-400">Require buyer review & decision</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Active Producer Contracts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {loading ? '...' : stats?.activeRelationships || 0}
          </div>
          <p className="text-[11px] text-neutral-400">Under cultivation or transit</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Committed Procurement Value</span>
            <CreditCard className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-emerald-950 tabular-nums">
            ₹{loading ? '...' : (stats?.totalCommittedValueINR || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-neutral-400">Total contracted pipeline</p>
        </div>
      </div>

      {/* Main Sections: Recent Applications & Created Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pending Applications to Review */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                <button
                  type="button"
                  disabled={!applicationReviewContractId}
                  onClick={() =>
                    onNavigate(`/buyer/contracts/${applicationReviewContractId}/applications`)
                  }
                  className="text-left enabled:hover:text-emerald-900 enabled:cursor-pointer disabled:cursor-default"
                >
                  Pending Farmer Applications
                </button>
              </h2>
              <p className="text-xs text-neutral-500">Review producer offers and establish contracts</p>
            </div>
            <button
              onClick={() => onNavigate('/buyer/contracts')}
              className="text-xs font-semibold text-emerald-900 hover:underline"
            >
              All Contracts
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400">Loading applications...</div>
          ) : recentApplications.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <Users className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">No pending applications</p>
              <p className="text-[11px] text-neutral-500">
                When farmers apply to your published contracts, they will appear here for decision.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentApplications.map((app) => (
                <div key={app._id} className="py-3.5 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-900">{app.farmerId?.name}</h4>
                    <span className="text-xs font-bold text-emerald-900 tabular-nums">
                      {app.quantityOfferedTons} tons offered
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    For: {app.contractId?.title || 'Contract'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      Delivery by:{' '}
                      {new Date(app.expectedDeliveryDate).toLocaleDateString('en-IN')}
                    </span>
                    <button
                      onClick={() =>
                        onNavigate(`/buyer/contracts/${app.contractId?._id}/applications`)
                      }
                      className="text-emerald-900 font-semibold hover:underline"
                    >
                      Review & Decide →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contracts List */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                My Procurement Contracts
              </h2>
              <p className="text-xs text-neutral-500">Drafted and published purchasing requirements</p>
            </div>
            <button
              onClick={() => onNavigate('/buyer/contracts')}
              className="text-xs font-semibold text-emerald-900 hover:underline"
            >
              Manage Contracts
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400">Loading contracts...</div>
          ) : recentContracts.length === 0 ? (
            <div className="p-10 text-center space-y-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <FileText className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">No contracts created yet</p>
              <button
                onClick={() => onNavigate('/buyer/contracts/new')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors shadow-xs"
              >
                Create Your First Contract Demand
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContracts.map((c) => (
                <div
                  key={c._id}
                  onClick={() => onNavigate(`/buyer/contracts/${c._id}/applications`)}
                  className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-700 transition-colors cursor-pointer space-y-2 hover:bg-neutral-50/50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-900 truncate max-w-[260px]">
                      {c.title}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        c.status === 'published'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>
                      {c.cropName} · {c.quantityRequiredTons} tons
                    </span>
                    <span className="font-bold text-emerald-950 tabular-nums">
                      ₹{c.pricePerTon.toLocaleString('en-IN')} / ton
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
