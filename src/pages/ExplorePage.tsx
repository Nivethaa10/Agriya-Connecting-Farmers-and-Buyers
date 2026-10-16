import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api.ts';
import { Contract } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  X,
  FileCheck2,
  Wheat,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ExplorePageProps {
  onNavigate: (path: string) => void;
  initialSelectedContractId?: string | null;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate,
  initialSelectedContractId,
}) => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [appliedContractIds, setAppliedContractIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal & Application Modal
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Application Form State
  const [quantityOffered, setQuantityOffered] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [farmerNotes, setFarmerNotes] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 9 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (stateFilter !== 'all') params.state = stateFilter;

      const res = await api.get('/farmer/contracts', { params });
      if (res.data.success) {
        setContracts(res.data.contracts || []);
        setAppliedContractIds(res.data.appliedContractIds || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.total || 0);

        // If an initial contract ID was provided, open it
        if (initialSelectedContractId && !selectedContract) {
          const found = (res.data.contracts || []).find(
            (c: Contract) => c._id === initialSelectedContractId
          );
          if (found) setSelectedContract(found);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page, category, stateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContracts();
  };

  const openApplyModal = (contract: Contract) => {
    if (!user) {
      onNavigate('/login');
      return;
    }
    if (user.role !== 'farmer') {
      alert('Only registered Farmer accounts can apply for contracts.');
      return;
    }
    setSelectedContract(contract);
    setQuantityOffered(String(contract.minQuantityPerFarmerTons));
    // Default dates based on contract
    setExpectedHarvestDate(
      contract.expectedHarvestDate ? contract.expectedHarvestDate.split('T')[0] : ''
    );
    setExpectedDeliveryDate(
      contract.deliveryDeadline ? contract.deliveryDeadline.split('T')[0] : ''
    );
    setFarmerNotes('');
    setApplyError(null);
    setApplySuccess(null);
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    try {
      setApplySubmitting(true);
      setApplyError(null);
      setApplySuccess(null);

      const res = await api.post(`/farmer/contracts/${selectedContract._id}/apply`, {
        quantityOfferedTons: Number(quantityOffered),
        expectedHarvestDate,
        expectedDeliveryDate,
        farmerNotes,
      });

      if (res.data.success) {
        setApplySuccess('Application submitted successfully! The buyer has been notified.');
        setAppliedContractIds((prev) => [...prev, selectedContract._id]);
        setTimeout(() => {
          setIsApplyModalOpen(false);
          setSelectedContract(null);
        }, 1200);
      }
    } catch (err: any) {
      setApplyError(getErrorMessage(err));
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1">
            Contract Farming Marketplace
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            Explore Open Contracts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Discover verified corporate crop demands offering guaranteed pre-harvest pricing.
          </p>
        </div>
        <div className="text-xs text-neutral-500 font-medium">
          Showing <span className="font-bold text-neutral-900 tabular-nums">{contracts.length}</span> of{' '}
          <span className="font-bold text-neutral-900 tabular-nums">{totalCount}</span> open contracts
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by crop, variety, or district..."
              className="w-full text-xs rounded-xl border border-neutral-300 pl-10 pr-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-emerald-800"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 bg-white focus:outline-emerald-800"
            >
              <option value="all">All Crop Categories</option>
              <option value="Cereals & Grains">Cereals & Grains</option>
              <option value="Pulses">Pulses</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Spices">Spices</option>
              <option value="Cotton & Fiber">Cotton & Fiber</option>
              <option value="Sugarcane & Cash Crops">Sugarcane & Cash Crops</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 bg-white focus:outline-emerald-800"
            >
              <option value="all">All States</option>
              <option value="Haryana">Haryana</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Punjab">Punjab</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors shadow-xs"
            >
              Filter
            </button>
            {(search || category !== 'all' || stateFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                  setStateFilter('all');
                  setPage(1);
                }}
                className="p-2.5 text-neutral-500 hover:text-neutral-900 rounded-xl border border-neutral-200 hover:bg-neutral-50"
                title="Reset filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Contracts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white border border-neutral-200 p-6 animate-pulse space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
              <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-20 bg-neutral-100 rounded"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center space-y-3">
          <Wheat className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-heading text-base font-bold text-neutral-800">No matching contracts found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search query, crop category, or state filter to view available demand.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('all');
              setStateFilter('all');
            }}
            className="text-xs font-semibold text-emerald-900 hover:underline pt-2 inline-block"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => {
            const hasApplied = appliedContractIds.includes(contract._id);
            const pricePerQuintal = (contract.pricePerTon / 10).toFixed(0);

            return (
              <div
                key={contract._id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between hover:border-emerald-700/60 transition-all hover:shadow-md group"
              >
                <div className="space-y-4">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-medium text-emerald-900">{contract.category}</span>
                    <div className="flex items-center gap-1.5">
                      <span aria-hidden="true">·</span>
                      <span>{contract.isSample ? 'Verified Benchmark' : 'Active Buyer'}</span>
                    </div>
                  </div>

                  {/* Title & Crop */}
                  <div>
                    <h3
                      onClick={() => setSelectedContract(contract)}
                      className="font-heading text-lg font-bold text-neutral-900 group-hover:text-emerald-900 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {contract.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Crop: <span className="font-semibold text-neutral-800">{contract.cropName}</span>
                      {contract.cropVariety && (
                        <span> ({contract.cropVariety})</span>
                      )}
                    </p>
                  </div>

                  {/* Metrics Box */}
                  <div className="bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/60 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-neutral-500">Guaranteed Price</span>
                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-900 tabular-nums">
                          ₹{contract.pricePerTon.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-neutral-500 ml-1">/ ton</span>
                        <div className="text-[10px] text-neutral-400 tabular-nums">
                          (₹{Number(pricePerQuintal).toLocaleString('en-IN')} / quintal)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-600 pt-1 border-t border-neutral-200/50">
                      <span>Demand Volume</span>
                      <span className="font-semibold text-neutral-900 tabular-nums">
                        {contract.quantityRequiredTons} tons total
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>Min Allotment</span>
                      <span className="font-semibold text-neutral-900 tabular-nums">
                        {contract.minQuantityPerFarmerTons} tons
                      </span>
                    </div>
                  </div>

                  {/* Metadata Location & Dates */}
                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">
                        {contract.deliveryLocation.facilityName}, {contract.deliveryLocation.district}, {contract.deliveryLocation.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>
                        Delivery deadline:{' '}
                        {new Date(contract.deliveryDeadline).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedContract(contract)}
                    className="text-xs font-semibold text-neutral-700 hover:text-emerald-950 hover:underline"
                  >
                    View Specs
                  </button>

                  {hasApplied ? (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => openApplyModal(contract)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors shadow-xs"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-neutral-600 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contract Detail Drawer / Modal */}
      {selectedContract && !isApplyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-900 uppercase tracking-wider">
                  {selectedContract.category}
                </span>
                <h3 className="font-heading text-xl font-bold text-neutral-900 mt-1">
                  {selectedContract.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Published by: {selectedContract.buyerId?.name || 'Verified Corporate Procurement'}
                </p>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Financial & Volume Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-center">
                  <span className="text-[11px] text-neutral-500 block">Guaranteed Price</span>
                  <span className="text-sm font-bold text-emerald-950 tabular-nums">
                    ₹{selectedContract.pricePerTon.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">per metric ton</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-center">
                  <span className="text-[11px] text-neutral-500 block">Total Volume</span>
                  <span className="text-sm font-bold text-neutral-900 tabular-nums">
                    {selectedContract.quantityRequiredTons} tons
                  </span>
                  <span className="text-[10px] text-neutral-400 block">demanded</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-center">
                  <span className="text-[11px] text-neutral-500 block">Min Allotment</span>
                  <span className="text-sm font-bold text-neutral-900 tabular-nums">
                    {selectedContract.minQuantityPerFarmerTons} tons
                  </span>
                  <span className="text-[10px] text-neutral-400 block">per application</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-center">
                  <span className="text-[11px] text-neutral-500 block">Settlement</span>
                  <span className="text-sm font-bold text-neutral-900 tabular-nums">
                    {selectedContract.paymentTerms?.settlementDays || 7} Days
                  </span>
                  <span className="text-[10px] text-neutral-400 block">post-intake</span>
                </div>
              </div>

              {/* Quality Standards & Testing Specifications */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <span>Quality Benchmarks & Acceptance Criteria</span>
                </h4>
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/70 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Inspection Grade</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedContract.qualityStandards?.grade}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Max Permissible Moisture</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {selectedContract.qualityStandards?.maxMoisturePercent}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Max Foreign Matter / Impurities</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {selectedContract.qualityStandards?.maxForeignMatterPercent}%
                    </span>
                  </div>
                  {selectedContract.qualityStandards?.specificationNotes && (
                    <div className="pt-2">
                      <span className="text-neutral-500 block mb-1">Testing Specifications:</span>
                      <p className="text-neutral-700 leading-relaxed bg-white p-2.5 rounded border border-neutral-200">
                        {selectedContract.qualityStandards.specificationNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery & Logistics */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-800" />
                  <span>Delivery Center & Schedule</span>
                </h4>
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/70 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Intake Center</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedContract.deliveryLocation.facilityName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Address</span>
                    <span className="font-semibold text-neutral-900 text-right">
                      {selectedContract.deliveryLocation.address}, {selectedContract.deliveryLocation.district}, {selectedContract.deliveryLocation.state}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/50">
                    <span className="text-neutral-500">Cultivation Start Window</span>
                    <span className="font-semibold text-neutral-900">
                      {new Date(selectedContract.cultivationStartDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Consignment Deadline</span>
                    <span className="font-semibold text-emerald-900">
                      {new Date(selectedContract.deliveryDeadline).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Payment Settlement Protocol
                </h4>
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/70 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Advance / Intake Split</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {selectedContract.paymentTerms?.advancePercentage}% Advance /{' '}
                      {selectedContract.paymentTerms?.onDeliveryPercentage}% On Delivery
                    </span>
                  </div>
                  <p className="text-neutral-600 pt-1">
                    {selectedContract.paymentTerms?.notes}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Close
              </button>
              {appliedContractIds.includes(selectedContract._id) ? (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-4 py-2 rounded-lg">
                  Already Applied
                </span>
              ) : (
                <button
                  onClick={() => openApplyModal(selectedContract)}
                  className="px-6 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors shadow-xs"
                >
                  Apply for this Contract
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Farmer Application Modal */}
      {isApplyModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-neutral-900">
                  Apply for Farming Contract
                </h3>
                <p className="text-xs text-neutral-500 truncate max-w-xs">{selectedContract.title}</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              {applyError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              {applySuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{applySuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Quantity Offered (Metric Tons)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={selectedContract.minQuantityPerFarmerTons}
                  max={selectedContract.quantityRequiredTons}
                  value={quantityOffered}
                  onChange={(e) => setQuantityOffered(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:outline-emerald-800 tabular-nums"
                  required
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Minimum required: {selectedContract.minQuantityPerFarmerTons} tons · Available:{' '}
                  {selectedContract.quantityRequiredTons - (selectedContract.allocatedQuantityTons || 0)} tons
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:outline-emerald-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:outline-emerald-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Farmer Notes / Farm Location Details
                </label>
                <textarea
                  rows={3}
                  value={farmerNotes}
                  onChange={(e) => setFarmerNotes(e.target.value)}
                  placeholder="Specify soil preparation, irrigation source, or past harvest experience with this crop..."
                  className="w-full text-xs rounded-lg border border-neutral-300 p-2.5 text-neutral-900 focus:outline-emerald-800"
                ></textarea>
              </div>

              {/* Financial Calculation Preview */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                <div className="flex justify-between text-neutral-600">
                  <span>Price per Ton</span>
                  <span className="tabular-nums font-semibold text-neutral-900">
                    ₹{selectedContract.pricePerTon.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-200 pt-1">
                  <span>Estimated Total Contract Value</span>
                  <span className="tabular-nums text-emerald-950">
                    ₹
                    {(
                      (Number(quantityOffered) || 0) * selectedContract.pricePerTon
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={applySubmitting}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applySubmitting || !quantityOffered}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {applySubmitting ? 'Submitting Application...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
