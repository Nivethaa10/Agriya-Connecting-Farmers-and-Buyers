import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Sprout, Lock, Mail, Phone, User as UserIcon, Building, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');

  // Core fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Farmer specific optional quick info
  const [farmSizeAcres, setFarmSizeAcres] = useState('');
  const [soilType, setSoilType] = useState('Alluvial Soil');
  const [state, setState] = useState('Madhya Pradesh');

  // Buyer specific optional quick info
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Agri Processing & Milling');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: any = {
        name,
        email,
        phone,
        password,
        confirmPassword,
        role,
        state,
      };

      if (role === 'farmer') {
        payload.farmSizeAcres = farmSizeAcres ? Number(farmSizeAcres) : 0;
        payload.soilType = soilType;
      } else {
        payload.companyName = companyName || `${name} Commodities`;
        payload.businessType = businessType;
      }

      const res = await register(payload);
      if (res.success) {
        if (role === 'farmer') {
          onNavigate('/farmer/dashboard');
        } else {
          onNavigate('/buyer/dashboard');
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full shadow-lg p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
            Create Your AGRIYA Account
          </h1>
          <p className="text-xs text-neutral-500">
            Join the verified contract farming platform as a Producer or Corporate Buyer
          </p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-semibold text-neutral-600">
          <button
            type="button"
            onClick={() => setRole('farmer')}
            className={`py-2 rounded-lg transition-all ${
              role === 'farmer' ? 'bg-white text-emerald-950 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            I am a Farmer / Collective
          </button>
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`py-2 rounded-lg transition-all ${
              role === 'buyer' ? 'bg-white text-emerald-950 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            I am an Institutional Buyer
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Legal Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar or Rajesh Patel"
                className="w-full text-xs rounded-xl border border-neutral-300 pl-9 pr-3 py-2 text-neutral-900 focus:outline-emerald-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@gmail.com"
                  className="w-full text-xs rounded-xl border border-neutral-300 pl-9 pr-3 py-2 text-neutral-900 focus:outline-emerald-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs rounded-xl border border-neutral-300 pl-9 pr-3 py-2 text-neutral-900 focus:outline-emerald-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role specific profile fields */}
          {role === 'farmer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Farm Size (Acres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={farmSizeAcres}
                  onChange={(e) => setFarmSizeAcres(e.target.value)}
                  placeholder="e.g. 8.5"
                  className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-1.5 text-neutral-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Dominant Soil Type
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 px-2 py-1.5 text-neutral-900 bg-white"
                >
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Red & Yellow Soil">Red & Yellow Soil</option>
                  <option value="Clayey Loam">Clayey Loam</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 px-2 py-1.5 text-neutral-900 bg-white"
                >
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Navratan Agro Mills Ltd."
                  className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-1.5 text-neutral-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Business Entity Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 px-2 py-1.5 text-neutral-900 bg-white"
                >
                  <option value="Agri Processing & Milling">Agri Processing & Milling</option>
                  <option value="Wholesaler / Exporter">Wholesaler / Exporter</option>
                  <option value="Supermarket Retail Chain">Supermarket Retail Chain</option>
                  <option value="FMCG Food Manufacturer">FMCG Food Manufacturer</option>
                  <option value="Farmers Producer Org / Cooperative">FPO / Cooperative</option>
                  <option value="Seed & Grain Trading House">Trading House</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full text-xs rounded-xl border border-neutral-300 pl-9 pr-3 py-2 text-neutral-900 focus:outline-emerald-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full text-xs rounded-xl border border-neutral-300 pl-9 pr-3 py-2 text-neutral-900 focus:outline-emerald-800"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-neutral-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="font-semibold text-emerald-900 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
