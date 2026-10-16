import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { Application } from '../../types/index.ts';
import { FileText, ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';

interface FarmerApplicationsPageProps {
  onNavigate: (path: string) => void;
}

export const FarmerApplicationsPage: React.FC<FarmerApplicationsPageProps> = ({ onNavigate }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farmer/applications');
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch farmer applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1">
          Submission History
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
          My Contract Applications
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Monitor review statuses, buyer decisions, and reason remarks for all your contract farming submissions.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-neutral-400">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center space-y-3">
          <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-heading text-base font-bold text-neutral-900">
            No applications submitted yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Browse published corporate demand contracts and apply with your offered tonnage and harvest timeline.
          </p>
          <button
            onClick={() => onNavigate('/explore')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors inline-block mt-2 shadow-xs"
          >
            Explore Open Contracts
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                    {app.contractId?.category || 'Crop Category'}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-neutral-900 mt-0.5">
                    {app.contractId?.title || 'Contract'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Buyer: {app.buyerId?.name || 'Corporate Buyer'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      app.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-900'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {app.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {app.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                    {app.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    <span className="capitalize">{app.status}</span>
                  </span>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-500 block">Offered Quantity</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {app.quantityOfferedTons} metric tons
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Contract Price</span>
                  <span className="font-bold text-emerald-950 tabular-nums">
                    ₹{app.contractId?.pricePerTon ? app.contractId.pricePerTon.toLocaleString('en-IN') : 'N/A'} / ton
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Est. Harvest</span>
                  <span className="font-bold text-neutral-900">
                    {new Date(app.expectedHarvestDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Est. Delivery</span>
                  <span className="font-bold text-neutral-900">
                    {new Date(app.expectedDeliveryDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Notes & Reason */}
              {app.farmerNotes && (
                <div className="text-xs text-neutral-600 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                  <strong className="text-neutral-800">Your Notes:</strong> {app.farmerNotes}
                </div>
              )}

              {app.status === 'rejected' && app.rejectionReason && (
                <div className="text-xs bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-xl space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                    <span>Buyer Decline Reason:</span>
                  </div>
                  <p className="leading-relaxed pl-5.5">{app.rejectionReason}</p>
                </div>
              )}

              {app.status === 'approved' && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-emerald-800 font-medium">
                    Contract relationship activated. Proceed to log cultivation progress.
                  </span>
                  <button
                    onClick={() => onNavigate('/farmer/active-contracts')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Go to Active Contract</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
