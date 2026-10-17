import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { ContractRelationship } from '../../types/index.ts';
import { Sprout, ArrowRight, Wheat, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

interface FarmerActiveContractsPageProps {
  onNavigate: (path: string) => void;
}

export const FarmerActiveContractsPage: React.FC<FarmerActiveContractsPageProps> = ({
  onNavigate,
}) => {
  const [relationships, setRelationships] = useState<ContractRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farmer/active-contracts');
      if (res.data.success) {
        setRelationships(res.data.relationships || []);
      }
    } catch (err) {
      console.error('Failed to load active contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveContracts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1">
          Active Production Commitments
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
          My Active Contracts
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Manage real-time cultivation logs, record crop harvests, update dispatch consignments, and track direct bank payments.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-neutral-400">Loading active contracts...</div>
      ) : relationships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center space-y-3">
          <Wheat className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-heading text-base font-bold text-neutral-900">
            No active contracts established yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Once a corporate buyer approves your contract application, your active relationship and lifecycle workspace will be established here.
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
          {relationships.map((rel) => (
            <div
              key={rel._id}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5 hover:border-emerald-700/60 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                    {rel.contractId?.category || 'Active Farming Contract'}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-neutral-900 mt-0.5">
                    {rel.contractId?.title || rel.cropName}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Buyer: {rel.buyerId?.name || 'Institutional Partner'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {rel.lifecycleStage.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400">
                Lifecycle last updated {new Date(rel.updatedAt).toLocaleString('en-IN')}
              </p>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Lifecycle Progress</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {rel.progressPercentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-800 rounded-full transition-all"
                    style={{ width: `${rel.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Agreed Terms Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-500 block">Agreed Volume</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {rel.agreedQuantityTons} metric tons
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Locked Price</span>
                  <span className="font-bold text-emerald-950 tabular-nums">
                    ₹{rel.agreedPricePerTon.toLocaleString('en-IN')} / ton
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Total Value</span>
                  <span className="font-bold text-emerald-950 tabular-nums">
                    ₹{rel.totalAgreedValue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Status</span>
                  <span className="font-bold text-neutral-900 capitalize">{rel.status}</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() => onNavigate(`/farmer/lifecycle/${rel._id}`)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <span>Open Full Lifecycle Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
