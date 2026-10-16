import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sprout,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  LifeBuoy,
  FileCheck,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenNotifications,
}) => {
  const { user, logout, unreadNotifications } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'farmer') return '/farmer/dashboard';
    if (user.role === 'buyer') return '/buyer/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark with subtle brand icon */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-900 text-cream flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-heading text-xl font-bold tracking-tight text-emerald-950">
                AGRIYA
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide text-neutral-500 ml-2">
                Contract Farming
              </span>
            </div>
          </button>

          {/* Zone 2: Concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <button
              onClick={() => onNavigate('/')}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentPath === '/' ? 'text-emerald-950 font-semibold border-b-2 border-emerald-900' : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('/explore')}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentPath.startsWith('/explore') ? 'text-emerald-950 font-semibold border-b-2 border-emerald-900' : ''
              }`}
            >
              Explore Contracts
            </button>
            <button
              onClick={() => onNavigate('/how-it-works')}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentPath === '/how-it-works' ? 'text-emerald-950 font-semibold border-b-2 border-emerald-900' : ''
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('/about')}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentPath === '/about' ? 'text-emerald-950 font-semibold border-b-2 border-emerald-900' : ''
              }`}
            >
              Legal & Framework
            </button>
          </nav>

          {/* Zone 3: Primary action or Authenticated Profile Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notifications trigger */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 text-neutral-600 hover:text-emerald-900 rounded-lg hover:bg-neutral-100 transition-colors focus:outline-none"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Direct Dashboard Link */}
                <button
                  onClick={() => onNavigate(getDashboardPath())}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Workspace</span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors focus:outline-none border border-neutral-200"
                  >
                    <div className="w-7 h-7 rounded bg-emerald-900 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden lg:inline-block text-xs font-semibold text-neutral-900 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-3.5 py-2.5 border-b border-neutral-100">
                        <p className="text-xs font-semibold text-neutral-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {user.role}
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigate(getDashboardPath())}
                        className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                        Dashboard
                      </button>

                      {user.role === 'farmer' && (
                        <>
                          <button
                            onClick={() => onNavigate('/farmer/applications')}
                            className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-neutral-500" />
                            My Applications
                          </button>
                          <button
                            onClick={() => onNavigate('/farmer/profile')}
                            className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <User className="w-4 h-4 text-neutral-500" />
                            Farm Profile
                          </button>
                        </>
                      )}

                      {user.role === 'buyer' && (
                        <>
                          <button
                            onClick={() => onNavigate('/buyer/contracts')}
                            className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <FileCheck className="w-4 h-4 text-neutral-500" />
                            Manage Contracts
                          </button>
                          <button
                            onClick={() => onNavigate('/buyer/profile')}
                            className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-neutral-500" />
                            Business Verification
                          </button>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => onNavigate('/admin/verifications')}
                          className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-neutral-500" />
                          Buyer Verifications
                        </button>
                      )}

                      <div className="border-t border-neutral-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-emerald-950 transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors shadow-xs whitespace-nowrap"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none"
            >
              <span className="sr-only">Toggle navigation menu</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-neutral-200 space-y-1">
            <button
              onClick={() => {
                onNavigate('/');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md"
            >
              Overview
            </button>
            <button
              onClick={() => {
                onNavigate('/explore');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md"
            >
              Explore Contracts
            </button>
            <button
              onClick={() => {
                onNavigate('/how-it-works');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                onNavigate('/about');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md"
            >
              Legal & Framework
            </button>
            {user && (
              <button
                onClick={() => {
                  onNavigate(getDashboardPath());
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-semibold text-emerald-900 bg-emerald-50 rounded-md"
              >
                Go to Workspace
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
