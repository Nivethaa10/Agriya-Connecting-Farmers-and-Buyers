import React from 'react';
import { Scale, ShieldCheck, FileCheck, CheckCircle2, Building, Award, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-100/60 px-3 py-1 rounded-md">
          <Scale className="w-3.5 h-3.5 text-emerald-800" />
          <span>Institutional Architecture</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
          Re-architecting Contract Farming Through Transparency
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
          AGRIYA is an independent AgriTech infrastructure engineered to establish structured, legally-governed, and transparent commercial contracts between Indian agricultural producers and verified institutional buyers.
        </p>
      </div>

      {/* Model Contract Farming Act Alignment */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-10 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center">
            <Scale className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-neutral-900">
              Alignment with Model Contract Farming & Services Act
            </h2>
            <p className="text-xs text-neutral-500">
              Statutory principles embedded directly into digital workflow logic
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed">
          Traditional oral agreements and informal verbal procurement routinely fail Indian agricultural stakeholders, leaving farmers exposed to price collapse at harvest and buyers burdened with unstandardized, high-moisture consignments. AGRIYA translates key statutory safeguards into code:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900">1. Pre-Determined Pricing</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Price per metric ton is recorded upon contract creation and remains fixed. No post-harvest unilateral price cuts by buyers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900">2. Land Rights Inviolability</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Contracts pertain strictly to produce delivery. Ownership, leasehold, and titles of agricultural land remain 100% with the farmer.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900">3. Standardized Quality Norms</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Objective moisture, impurity, and sizing benchmarks are published prior to application, evaluated with recorded test findings.
            </p>
          </div>
        </div>
      </div>

      {/* Strict Buyer Verification Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
          </div>
          <h3 className="font-heading text-lg font-bold text-neutral-900">
            Strict Multi-Tier Verification
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Unlike open bulletin boards, AGRIYA prevents fraudulent procurement bids. Unverified buyers can only draft proposals. Only buyers whose MCA Incorporation, GST Certificates, and APMC Trade Licenses are audited and approved by authorized system administrators can publish contracts or receive farmer applications.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-emerald-900">
            <FileCheck className="w-5 h-5 text-emerald-800" />
          </div>
          <h3 className="font-heading text-lg font-bold text-neutral-900">
            Transparent Milestone Auditing
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every active contract maintains an unalterable chronological record of cultivation updates, actual harvest yields, quality inspection certificates, consignment waybill numbers, and banking UTR references. Both farmer and buyer dashboards mirror identical real-time status.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-emerald-900 rounded-2xl text-white p-8 sm:p-12 text-center space-y-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          Ready to Modernize Your Agricultural Supply Chain?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-200 max-w-xl mx-auto leading-relaxed">
          Whether you are an individual farmer seeking guaranteed prices or an institutional food processor seeking reliable, high-grade produce, AGRIYA provides the infrastructure you need.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/register')}
            className="px-6 py-3 text-xs font-semibold text-emerald-950 bg-white rounded-xl hover:bg-neutral-100 transition-colors shadow-sm"
          >
            Create Your Account
          </button>
          <button
            onClick={() => onNavigate('/explore')}
            className="px-6 py-3 text-xs font-semibold text-white border border-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors"
          >
            Browse Published Contracts
          </button>
        </div>
      </div>
    </div>
  );
};
