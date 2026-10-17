import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { Contract } from '../types/index.ts';
import {
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Calendar,
  MapPin,
  ArrowRight,
  Wheat,
  Scale,
  Building2,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onSelectContract?: (contractId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectContract }) => {
  const [featuredContracts, setFeaturedContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/farmer/contracts?limit=3');
        if (res.data.success) {
          setFeaturedContracts(res.data.contracts || []);
        }
      } catch (err) {
        console.error('Failed to load featured contracts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-14 pb-12 border-b border-neutral-200/80 bg-[#fbfaf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-100/70 px-3 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Transparent Contract Farming Marketplace</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.12]">
                Guaranteed Prices. Verified Buyers. <span className="text-emerald-900">Secure Cultivation.</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
                AGRIYA directly connects agricultural producers and institutional corporate buyers through legally-binding digital farming contracts, verified quality grading, and transparent milestone settlements.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() => onNavigate('/explore')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-all shadow-sm flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                  <span>Explore Open Contracts</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-6 py-3.5 text-sm font-semibold text-emerald-950 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors shadow-xs whitespace-nowrap text-center"
                >
                  Join as Farmer or Buyer
                </button>
              </div>

              {/* Trust signals */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Strict Buyer Legal Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Transparent Quality Criteria</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Model Contract Framework</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-neutral-200/90 aspect-16/9 lg:aspect-4/3 bg-neutral-200">
                <img
                  src="/src/assets/images/hero_agritech_contract_1791983001841.jpg"
                  alt="Precision agricultural farmland with modern digital crop telemetry"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white space-y-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                      Real Contract Security
                    </p>
                    <p className="text-sm font-medium">
                      Legally defined procurement agreements before seed touches soil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Contracts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-850 mb-1.5">
              Live Opportunities
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Published Contract Demands
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Institutional requirements currently accepting producer applications.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/explore')}
            className="text-xs sm:text-sm font-semibold text-emerald-900 hover:text-emerald-950 flex items-center gap-1.5 hover:underline whitespace-nowrap self-start md:self-auto"
          >
            <span>View All Contracts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-xl bg-neutral-100 animate-pulse border border-neutral-200"></div>
            ))}
          </div>
        ) : featuredContracts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-neutral-200">
            <Wheat className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">No open contracts published at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredContracts.map((contract) => (
              <div
                key={contract._id}
                className="bg-white rounded-xl border border-neutral-200 hover:border-emerald-700/60 p-6 flex flex-col justify-between transition-all hover:shadow-md group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{contract.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-neutral-700">
                      {contract.isSample ? 'Verified Benchmark' : 'Active Buyer'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-neutral-900 group-hover:text-emerald-900 transition-colors line-clamp-2">
                      {contract.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Variety: <span className="text-neutral-700 font-medium">{contract.cropVariety || contract.cropName}</span>
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-3.5 space-y-2 border border-neutral-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Agreed Price</span>
                      <span className="text-sm font-bold text-emerald-900 tabular-nums">
                        ₹{contract.pricePerTon?.toLocaleString('en-IN') ?? 'N/A'} / ton
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>Total Procurement</span>
                      <span className="font-medium text-neutral-800 tabular-nums">
                        {contract.quantityRequiredTons} tons
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>Min Offer per Farmer</span>
                      <span className="font-medium text-neutral-800 tabular-nums">
                        {contract.minQuantityPerFarmerTons} tons
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">
                        {contract.deliveryLocation.district}, {contract.deliveryLocation.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>
                        Delivery by {new Date(contract.deliveryDeadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-500">
                    {contract.qualityStandards?.grade || 'Standard Grade'}
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectContract) {
                        onSelectContract(contract._id);
                      } else {
                        onNavigate('/explore');
                      }
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors"
                  >
                    View & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Two-Column Operational Pillar: Farmer Empowerment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Visual Asset */}
            <div className="lg:col-span-5 relative min-h-[320px] bg-neutral-200">
              <img
                src="/src/assets/images/farmer_harvest_showcase_1791983003485.jpg"
                alt="Empowered farmer with basket of fresh harvest in thriving field"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Editorial Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-900">
                <Wheat className="w-4 h-4 text-emerald-800" />
                <span>For Farmers & Collectives</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-snug">
                Insulate Your Farm from Price Crashes with Pre-Sowing Price Lock
              </h2>

              <p className="text-sm text-neutral-600 leading-relaxed">
                Eliminate middlemen and speculative auction volatility. AGRIYA lets you browse procurement specifications from verified industrial buyers, enter written contracts prior to planting, record progress milestones, and receive timely direct bank transfers upon quality inspection.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <h4 className="text-xs font-bold text-neutral-900">Direct Contract Ownership</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Legally clear terms with defined minimum pricing and harvest expectations.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <h4 className="text-xs font-bold text-neutral-900">Progress Transparency</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Log sowing, vegetative, and harvest stages directly to buyer dashboards.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors inline-flex items-center gap-2"
                >
                  <span>Register Farm Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Operational Pillar: Buyer Security & Quality */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Editorial Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-900">
                <Building2 className="w-4 h-4 text-emerald-800" />
                <span>For Institutional Buyers & Exporters</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-snug">
                Source Traceable Raw Produce to Exact Quality Benchmarks
              </h2>

              <p className="text-sm text-neutral-600 leading-relaxed">
                Procure raw materials with certainty. Specify grade parameters, moisture cutoffs, foreign matter limits, and delivery centers. Track cultivation through real field logs, execute standardized quality inspections upon intake, and manage supply pipeline schedules from one console.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <h4 className="text-xs font-bold text-neutral-900">Strict Identity Verification</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Mandatory admin audit of GST, incorporation, and trade credentials.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <h4 className="text-xs font-bold text-neutral-900">Field-Level Inspection</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Objective quality assessment with grade approvals and test certificates.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors inline-flex items-center gap-2"
                >
                  <span>Register Institutional Buyer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Asset */}
            <div className="lg:col-span-5 relative min-h-[320px] bg-neutral-200 order-1 lg:order-2">
              <img
                src="/src/assets/images/buyer_quality_inspection_1791983003812.jpg"
                alt="Quality inspection and grading of agricultural crops in modern facility"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Agriculture Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden aspect-21/9 min-h-[260px] bg-neutral-900 border border-neutral-300">
          <img
            src="/src/assets/images/precision_farming_field_1791983003359.jpg"
            alt="Sustainable precision irrigation field"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/60 to-transparent flex items-center p-8 sm:p-14">
            <div className="max-w-xl space-y-4 text-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Sustainable Supply Chain
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                Empowering India's Next-Generation Agricultural Commerce
              </h3>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                By aligning production volume directly with consumer processing demand, AGRIYA mitigates post-harvest wastage and ensures sustainable food security nationwide.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-4 py-2 text-xs font-semibold text-emerald-950 bg-white rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  Read About the Model Contract Act
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
