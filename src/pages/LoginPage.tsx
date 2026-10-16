import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Sprout, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [roleHint, setRoleHint] = useState<'farmer' | 'buyer' | 'admin'>('farmer');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide your email/phone and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(identifier, password);
      if (res.success) {
        // Redirection based on role
        if (roleHint === 'admin' || identifier.includes('admin')) {
          onNavigate('/admin/dashboard');
        } else if (roleHint === 'buyer') {
          onNavigate('/buyer/dashboard');
        } else {
          onNavigate('/farmer/dashboard');
        }
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const setHelperCredentials = (type: 'admin' | 'sampleBuyer') => {
    if (type === 'admin') {
      setRoleHint('admin');
      setIdentifier('admin@agriya.org');
      setPassword('AdminSecure@2026');
    } else if (type === 'sampleBuyer') {
      setRoleHint('buyer');
      setIdentifier('procurement@agriexport.in');
      setPassword('BuyerSecure@2026');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full shadow-lg p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
            Sign In to AGRIYA
          </h1>
          <p className="text-xs text-neutral-500">
            Access your verified contract farming workspace
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 p-1 bg-neutral-100 rounded-xl text-xs font-semibold text-neutral-600">
          <button
            type="button"
            onClick={() => setRoleHint('farmer')}
            className={`py-2 rounded-lg transition-all ${
              roleHint === 'farmer' ? 'bg-white text-emerald-950 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            Farmer
          </button>
          <button
            type="button"
            onClick={() => setRoleHint('buyer')}
            className={`py-2 rounded-lg transition-all ${
              roleHint === 'buyer' ? 'bg-white text-emerald-950 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setRoleHint('admin')}
            className={`py-2 rounded-lg transition-all ${
              roleHint === 'admin' ? 'bg-white text-emerald-950 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            Admin
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
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  roleHint === 'farmer'
                    ? 'e.g. ram.farmer@gmail.com or +9198...'
                    : roleHint === 'buyer'
                    ? 'e.g. procurement@agriexport.in'
                    : 'admin@agriya.org'
                }
                className="w-full text-xs rounded-xl border border-neutral-300 pl-9 pr-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full text-xs rounded-xl border border-neutral-300 pl-9 pr-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick test credentials assistance */}
        <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500 space-y-2">
          <p className="font-semibold text-neutral-700">Quick Credentials Assistance:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setHelperCredentials('admin')}
              className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors"
            >
              Fill Initial Admin
            </button>
            <button
              type="button"
              onClick={() => setHelperCredentials('sampleBuyer')}
              className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors"
            >
              Fill Sample Verified Buyer
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center pt-2">
          <p className="text-xs text-neutral-600">
            Don't have an AGRIYA account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="font-semibold text-emerald-900 hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
