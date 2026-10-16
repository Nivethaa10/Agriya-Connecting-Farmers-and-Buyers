import React from 'react';
import { Sprout, ShieldCheck, Scale, FileText } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-emerald-950 text-neutral-300 border-t border-emerald-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-emerald-900/60">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                AGRIYA
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Institutional contract farming platform connecting verified industrial food processors, exporters, and farming collectives with structured contracts, quality benchmarks, and transparent settlements.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Buyer Governance</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/explore')}
                  className="hover:text-white transition-colors"
                >
                  Published Contracts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/explore?category=Cereals+%26+Grains')}
                  className="hover:text-white transition-colors"
                >
                  Cereals & Grain Procurement
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/explore?category=Oilseeds')}
                  className="hover:text-white transition-colors"
                >
                  Oilseeds & Pulses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/explore?category=Spices')}
                  className="hover:text-white transition-colors"
                >
                  High-Value Spices & Horticulture
                </button>
              </li>
            </ul>
          </div>

          {/* Farmer & Buyer Framework */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4">
              Contract Lifecycle
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  Cultivation Monitoring
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  Quality Inspection Standards
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  Dispatch & Delivery Confirmation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  Direct Settlement Accounting
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  Model Contract Farming Act
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Dispute Resolution Protocol
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  Document Verification Norms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  Quality Specification Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} AGRIYA AgriTech Network. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Enterprise B2B AgriTech Architecture</span>
            <span>·</span>
            <span>Zero-Commission Direct Contracting</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
