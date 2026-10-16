import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api.ts';
import { Contract, Application } from '../../types/index.ts';
import {
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface BuyerContractApplicationsPageProps {
  contractId: string;
  onNavigate: (path: string) => void;
}

export const BuyerContractApplicationsPage: React.FC<BuyerContractApplicationsPageProps> = ({
  contractId,
  onNavigate,
}) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/buyer/contracts/${contractId}/applications`);
      if (res.data.success) {
        setContract(res.data.contract);
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [contractId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (reviewDecision === 'rejected' && !rejectionReason.trim()) {
      setReviewError('A reason is mandatory when declining an application.');
      return;
    }

    try {
      setReviewing(true);
      setReviewError(null);
      setReviewSuccess(null);

      const res = await api.post(`/buyer/applications/${selectedApp._id}/review`, {
        decision: reviewDecision,
        rejectionReason: rejectionReason.trim(),
      });

      if (res.data.success) {
        setReviewSuccess(
          reviewDecision === 'approved'
            ? 'Application approved! Active contract established.'
            : 'Application rejected.'
        );
        setTimeout(() => {
          setSelectedApp(null);
          setRejectionReason('');
          fetchApplications();
        }, 1000);
      }
    } catch (err: any) {
      setReviewError(getErrorMessage(err));
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-neutral-400">Loading applications...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1">
          Applicant Auditing
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
          Farmer Applications: {contract?.title}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Review farmer agronomic credentials, farm acreage, soil characteristics, and inspect uploaded land records before approval.
        </p>
      </div>

      {/* Contract Snapshot */}
      {contract && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-neutral-500 block">Total Demanded</span>
            <span className="font-bold text-neutral-900 tabular-nums">
              {contract.quantityRequiredTons} tons
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Committed / Allocated</span>
            <span className="font-bold text-emerald-950 tabular-nums">
              {contract.allocatedQuantityTons || 0} tons
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Locked Price</span>
            <span className="font-bold text-emerald-950 tabular-nums">
              ₹{contract.pricePerTon.toLocaleString('en-IN')} / ton
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Delivery Deadline</span>
            <span className="font-bold text-neutral-900">
              {new Date(contract.deliveryDeadline).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center space-y-3">
          <Users className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-heading text-base font-bold text-neutral-900">
            No farmer applications received yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Once farmers browse your published contract and apply with their acreage and expected yield, their dossiers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-neutral-900">
                    {app.farmerId?.name || 'Farmer Applicant'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Contact: {app.farmerId?.phone} · Email: {app.farmerId?.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      app.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-900'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {app.status}
                  </span>

                  {app.status === 'pending' && (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setReviewDecision('approved');
                        setRejectionReason('');
                        setReviewError(null);
                        setReviewSuccess(null);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors shadow-xs"
                    >
                      Audit & Decide
                    </button>
                  )}
                </div>
              </div>

              {/* Offer metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-500 block">Offered Quantity</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {app.quantityOfferedTons} metric tons
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Expected Harvest</span>
                  <span className="font-bold text-neutral-900">
                    {new Date(app.expectedHarvestDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Expected Delivery</span>
                  <span className="font-bold text-neutral-900">
                    {new Date(app.expectedDeliveryDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Contract Value</span>
                  <span className="font-bold text-emerald-950 tabular-nums">
                    ₹{((contract?.pricePerTon || 0) * app.quantityOfferedTons).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Farmer agronomic details */}
              {app.farmerProfile && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-neutral-600 border border-neutral-100 p-3 rounded-lg">
                  <div>
                    <span className="text-neutral-400 block">Farm Size</span>
                    <strong>{app.farmerProfile.farmSizeAcres || 'N/A'} Acres</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Soil Type</span>
                    <strong>{app.farmerProfile.soilType || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Irrigation</span>
                    <strong>{app.farmerProfile.irrigationSource || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Experience</span>
                    <strong>{app.farmerProfile.experienceYears || '0'} Years</strong>
                  </div>
                </div>
              )}

              {/* Uploaded Documents audit */}
              {app.farmerDocuments && app.farmerDocuments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-neutral-700 block">
                    Uploaded Verification Documents:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {app.farmerDocuments.map((doc: any) => (
                      <a
                        key={doc._id}
                        href={`/api/documents/${doc._id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-800" />
                        <span>{doc.title || doc.docType}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {app.farmerNotes && (
                <div className="text-xs text-neutral-600 bg-neutral-50/50 p-3 rounded-lg">
                  <strong>Farmer Remarks:</strong> {app.farmerNotes}
                </div>
              )}

              {app.status === 'rejected' && app.rejectionReason && (
                <div className="text-xs text-rose-800 bg-rose-50 p-3 rounded-lg">
                  <strong>Rejection Reason Recorded:</strong> {app.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-neutral-900">
                  Review & Decide on Application
                </h3>
                <p className="text-xs text-neutral-500">Applicant: {selectedApp.farmerId?.name}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              {reviewError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('approved')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      reviewDecision === 'approved'
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-800/20'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                    <span>Approve & Contract</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('rejected')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      reviewDecision === 'rejected'
                        ? 'border-rose-800 bg-rose-50 text-rose-950 ring-2 ring-rose-800/20'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-800" />
                    <span>Decline Application</span>
                  </button>
                </div>
              </div>

              {reviewDecision === 'approved' ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                  <p className="font-bold">What happens on Approval:</p>
                  <p>
                    An active Contract Relationship is established with {selectedApp.farmerId?.name} for{' '}
                    <strong>{selectedApp.quantityOfferedTons} metric tons</strong>. Committed funds are recorded and cultivation logging opens.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Decline Reason (Mandatory)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify why the offer cannot be accepted (e.g. soil mismatch, capacity already filled, or unviable delivery date)..."
                    className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 text-neutral-900"
                    required
                  ></textarea>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  disabled={reviewing}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {reviewing ? 'Recording Decision...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
