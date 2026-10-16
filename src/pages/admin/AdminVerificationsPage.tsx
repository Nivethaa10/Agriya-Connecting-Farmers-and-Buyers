import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api.ts';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Building2,
  Filter,
} from 'lucide-react';

export const AdminVerificationsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Decision Modal
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [decision, setDecision] = useState<'verified' | 'rejected'>('verified');
  const [reason, setReason] = useState('All statutory incorporation and APMC documents verified against official registries.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/verifications', {
        params: { status: statusFilter },
      });
      if (res.data.success) {
        setRequests(res.data.verificationRequests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    if (decision === 'rejected' && !reason.trim()) {
      setError('A rejection reason is mandatory to inform the buyer.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const res = await api.post(`/admin/verifications/${selectedProfile._id}/decision`, {
        decision,
        reason: reason.trim(),
      });

      if (res.data.success) {
        setSuccess(`Buyer profile marked as ${decision}.`);
        setTimeout(() => {
          setSelectedProfile(null);
          fetchVerifications();
        }, 1000);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1">
            Statutory Compliance Audit
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
            Buyer Business Verifications
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Review corporate incorporation, GSTIN filings, and trade licenses before granting contract publishing permissions.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 bg-white focus:outline-emerald-800"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending Review Only</option>
            <option value="verified">Verified Buyers</option>
            <option value="rejected">Rejected Requests</option>
            <option value="not_submitted">Not Submitted</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-neutral-400">Loading verification records...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-heading text-base font-bold text-neutral-900">
            No verification records found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            There are currently no buyer verification submissions matching your selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-base font-bold text-neutral-900">
                      {req.companyName}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        req.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-900'
                          : req.verificationStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : req.verificationStatus === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {req.verificationStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    User Account: {req.userId?.name} ({req.userId?.email} · {req.userId?.phone})
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      setSelectedProfile(req);
                      setDecision(req.verificationStatus === 'rejected' ? 'rejected' : 'verified');
                      setReason(
                        req.verificationStatus === 'rejected'
                          ? req.verificationNotes || 'Missing valid GSTIN document.'
                          : 'All statutory incorporation and APMC documents verified against official registries.'
                      );
                      setError(null);
                      setSuccess(null);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors shadow-xs"
                  >
                    Perform Audit Decision
                  </button>
                </div>
              </div>

              {/* Business specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-500 block">Business Entity</span>
                  <span className="font-bold text-neutral-900">{req.businessType}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">MCA CIN / Reg #</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    {req.registrationNumber || 'Not Provided'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">GSTIN</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    {req.gstNumber || 'Not Provided'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Location</span>
                  <span className="font-bold text-neutral-900">
                    {req.address?.city ? `${req.address.city}, ` : ''}
                    {req.address?.state || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-700 block">
                  Uploaded Legal Documents ({req.documents?.length || 0}):
                </span>
                {req.documents?.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No files uploaded by buyer.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {req.documents?.map((doc: any) => (
                      <a
                        key={doc._id}
                        href={`/api/documents/${doc._id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg flex items-center gap-1.5 transition-colors border border-neutral-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="font-medium">{doc.title}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          ({(doc.fileSizeBytes / 1024).toFixed(0)} KB)
                        </span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Verification notes history */}
              {req.verificationNotes && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-600">
                  <strong className="text-neutral-800">Current Audit Remarks:</strong>{' '}
                  {req.verificationNotes}
                  {req.verifiedAt && (
                    <span className="text-neutral-400 ml-2">
                      ({new Date(req.verifiedAt).toLocaleDateString('en-IN')})
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-neutral-900">
                  Audit Buyer Credentials
                </h3>
                <p className="text-xs text-neutral-500">{selectedProfile.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDecisionSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Administrative Action
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDecision('verified');
                      setReason('All statutory incorporation and APMC documents verified against official registries.');
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      decision === 'verified'
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-800/20'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                    <span>Approve Verification</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDecision('rejected');
                      setReason('');
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      decision === 'rejected'
                        ? 'border-rose-800 bg-rose-50 text-rose-950 ring-2 ring-rose-800/20'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-800" />
                    <span>Decline Verification</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Audit Notes & Statutory Findings (Mandatory)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    decision === 'verified'
                      ? 'Confirm validity of CIN, GSTIN, and APMC trade licenses audited...'
                      : 'State exact reason for decline (e.g. invalid GSTIN, unreadable PDF, lack of trade license)...'
                  }
                  className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 text-neutral-900"
                  required
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {submitting ? 'Recording Audit...' : 'Execute Audit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
