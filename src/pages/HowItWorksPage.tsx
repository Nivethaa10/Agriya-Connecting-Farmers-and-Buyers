import React from 'react';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  Sprout,
  Wheat,
  Scale,
  Truck,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      num: '01',
      title: 'Buyer Identity & Document Verification',
      role: 'Buyer & Admin',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-800" />,
      desc: 'Institutional buyers register their corporate profile and upload mandatory incorporation or GST licenses. System administrators rigorously audit the submitted credentials before granting contract publishing authority.',
    },
    {
      num: '02',
      title: 'Contract Demands Published',
      role: 'Verified Buyer',
      icon: <FileText className="w-5 h-5 text-emerald-800" />,
      desc: 'Authorized buyers publish concrete procurement requirements detailing required crop tonnage, minimum farmer allotment, fixed price per ton (in ₹), moisture and foreign matter limits, and delivery center locations.',
    },
    {
      num: '03',
      title: 'Farmer Application & Allotment',
      role: 'Farmer',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-800" />,
      desc: 'Farmers browse published contracts, evaluate specifications against their soil and acreage capacity, and submit an application specifying offered quantity, expected harvest date, and delivery timeline.',
    },
    {
      num: '04',
      title: 'Buyer Review & Relationship Activation',
      role: 'Buyer',
      icon: <Sprout className="w-5 h-5 text-emerald-800" />,
      desc: 'The buyer reviews the farmer profile, acreage, and uploaded land records. Upon buyer approval, a formal Contract Relationship is created and committed funds are allocated.',
    },
    {
      num: '05',
      title: 'Cultivation Milestone Logging',
      role: 'Farmer',
      icon: <Wheat className="w-5 h-5 text-emerald-800" />,
      desc: 'Throughout the crop growth cycle, the farmer posts dated field logs covering vegetative vigor, irrigation status, soil condition, and pest management, keeping the buyer informed.',
    },
    {
      num: '06',
      title: 'Harvest & Buyer Quality Inspection',
      role: 'Farmer & Buyer',
      icon: <Scale className="w-5 h-5 text-emerald-800" />,
      desc: 'The farmer logs the actual harvested yield and packaging details. Upon consignment arrival, the buyer agronomist measures moisture percentage and purity against contractual standards and records a formal quality grade certificate.',
    },
    {
      num: '07',
      title: 'Delivery Confirmation & Bank Settlement',
      role: 'Farmer & Buyer',
      icon: <Truck className="w-5 h-5 text-emerald-800" />,
      desc: 'The farmer logs vehicle registration and consignment waybill numbers. The buyer confirms receipt, and records the final banking RTGS settlement reference (UTR number) directly into the platform record.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-100/60 px-3 py-1 rounded-md">
          <span>Complete Lifecycle</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
          How AGRIYA Governs Every Contract Stage
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
          From legal pre-verification to harvest, quality testing, and direct bank settlement—explore our transparent end-to-end contract farming execution workflow.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div
            key={s.num}
            className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start shadow-xs hover:border-emerald-700/60 transition-colors"
          >
            <div className="flex items-center gap-4 shrink-0">
              <span className="font-heading text-2xl font-bold text-neutral-400 tabular-nums">
                {s.num}
              </span>
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                {s.icon}
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-neutral-900">{s.title}</h3>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {s.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action CTA */}
      <div className="bg-[#f7f5ee] rounded-2xl border border-neutral-200 p-8 sm:p-12 text-center space-y-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900">
          Experience the Platform Today
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto">
          Start exploring live published contract opportunities or register your profile to begin contracting with verified partners.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/explore')}
            className="px-6 py-3 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors shadow-xs"
          >
            Browse Open Contracts
          </button>
          <button
            onClick={() => onNavigate('/register')}
            className="px-6 py-3 text-xs font-semibold text-emerald-950 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Create Your Account
          </button>
        </div>
      </div>
    </div>
  );
};
