import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { DocumentUploadModal } from './components/DocumentUploadModal.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { SupportTicketModal } from './components/SupportTicketModal.tsx';

// Public pages
import { LandingPage } from './pages/LandingPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { HowItWorksPage } from './pages/HowItWorksPage.tsx';
import { ExplorePage } from './pages/ExplorePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';

// Farmer pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard.tsx';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage.tsx';
import { FarmerApplicationsPage } from './pages/farmer/FarmerApplicationsPage.tsx';
import { FarmerActiveContractsPage } from './pages/farmer/FarmerActiveContractsPage.tsx';
import { FarmerActiveLifecyclePage } from './pages/farmer/FarmerActiveLifecyclePage.tsx';

// Buyer pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard.tsx';
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage.tsx';
import { BuyerContractsPage } from './pages/buyer/BuyerContractsPage.tsx';
import { BuyerContractApplicationsPage } from './pages/buyer/BuyerContractApplicationsPage.tsx';
import { BuyerActiveContractsPage } from './pages/buyer/BuyerActiveContractsPage.tsx';
import { BuyerActiveLifecyclePage } from './pages/buyer/BuyerActiveLifecyclePage.tsx';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage.tsx';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.tsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.tsx';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.tsx';

import { api } from './services/api.ts';
import { Database, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface DBStatusData {
  connected: boolean;
  provider: 'atlas' | 'local-standalone' | 'embedded-persisted';
  maskedUri: string;
  atlasAttempted: boolean;
  atlasConnected: boolean;
  atlasError?: string;
  readWriteSuccess?: boolean;
}

function MainApp() {
  const { user, isLoading, refreshUser } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  // Modals
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Database Connection Diagnostics Banner State
  const [dbStatus, setDbStatus] = useState<DBStatusData | null>(null);
  const [isDbBannerDismissed, setIsDbBannerDismissed] = useState(false);

  // Fetch db status to transparently inform the user
  useEffect(() => {
    const fetchDbStatus = async () => {
      try {
        const res = await api.get('/db-status');
        if (res.data.status) {
          setDbStatus(res.data.status);
        }
      } catch (err) {
        console.warn('Could not fetch DB status:', err);
      }
    };
    fetchDbStatus();
  }, []);

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to extract dynamic URL parameters
  const getSubRouteId = (prefix: string): string => {
    if (currentPath.startsWith(prefix)) {
      const remainder = currentPath.slice(prefix.length);
      const cleanId = remainder.split('/')[0];
      return cleanId;
    }
    return '';
  };

  // Render role-protected or public page
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Loading AGRIYA Engine...
          </p>
        </div>
      );
    }

    if (currentPath.startsWith('/admin/') && user?.role !== 'admin') {
      const destination = user
        ? user.role === 'farmer'
          ? '/farmer/dashboard'
          : '/buyer/dashboard'
        : '/login';
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Administrator access required</h1>
          <p className="text-sm text-neutral-600">Sign in with an administrator account to open this page.</p>
          <button
            type="button"
            onClick={() => navigate(destination)}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950"
          >
            {user ? 'Go to my dashboard' : 'Sign in'}
          </button>
        </div>
      );
    }

    if (currentPath.startsWith('/buyer/') && user?.role !== 'buyer') {
      const destination = user
        ? user.role === 'farmer'
          ? '/farmer/dashboard'
          : '/admin/dashboard'
        : '/login';
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Buyer access required</h1>
          <p className="text-sm text-neutral-600">Sign in with a buyer account to open this page.</p>
          <button
            type="button"
            onClick={() => navigate(destination)}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950"
          >
            {user ? 'Go to my dashboard' : 'Sign in'}
          </button>
        </div>
      );
    }

    if (currentPath.startsWith('/farmer/') && user?.role !== 'farmer') {
      const destination = user
        ? user.role === 'buyer'
          ? '/buyer/dashboard'
          : '/admin/dashboard'
        : '/login';
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Farmer access required</h1>
          <p className="text-sm text-neutral-600">Sign in with a farmer account to open this page.</p>
          <button
            type="button"
            onClick={() => navigate(destination)}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950"
          >
            {user ? 'Go to my dashboard' : 'Sign in'}
          </button>
        </div>
      );
    }

    // Dynamic Parameter Routes
    if (
      currentPath.startsWith('/farmer/lifecycle/') ||
      currentPath.startsWith('/farmer/active/') ||
      currentPath.startsWith('/farmer/contracts/active/')
    ) {
      const prefix = currentPath.startsWith('/farmer/lifecycle/')
        ? '/farmer/lifecycle/'
        : currentPath.startsWith('/farmer/active/')
          ? '/farmer/active/'
          : '/farmer/contracts/active/';
      const relId = getSubRouteId(prefix);
      return (
        <FarmerActiveLifecyclePage
          relationshipId={relId}
          onNavigate={navigate}
          onOpenSupport={() => setIsSupportOpen(true)}
        />
      );
    }

    if (
      currentPath.startsWith('/buyer/lifecycle/') ||
      currentPath.startsWith('/buyer/active/') ||
      currentPath.startsWith('/buyer/contracts/active/')
    ) {
      const prefix = currentPath.startsWith('/buyer/lifecycle/')
        ? '/buyer/lifecycle/'
        : currentPath.startsWith('/buyer/active/')
          ? '/buyer/active/'
          : '/buyer/contracts/active/';
      const relId = getSubRouteId(prefix);
      return (
        <BuyerActiveLifecyclePage
          relationshipId={relId}
          onNavigate={navigate}
          onOpenSupport={() => setIsSupportOpen(true)}
        />
      );
    }

    if (currentPath.startsWith('/buyer/contracts/') && currentPath.endsWith('/applications')) {
      const parts = currentPath.replace('/buyer/contracts/', '').replace('/applications', '');
      return <BuyerContractApplicationsPage contractId={parts} onNavigate={navigate} />;
    }

    // Static Standard Routes
    switch (currentPath) {
      case '/':
        return (
          <LandingPage
            onNavigate={navigate}
            onSelectContract={(id) => {
              setSelectedContractId(id);
              navigate('/explore');
            }}
          />
        );

      case '/about':
        return <AboutPage onNavigate={navigate} />;

      case '/how-it-works':
        return <HowItWorksPage onNavigate={navigate} />;

      case '/explore':
        return (
          <ExplorePage
            onNavigate={navigate}
            initialSelectedContractId={selectedContractId}
          />
        );

      case '/login':
        return <LoginPage onNavigate={navigate} />;

      case '/register':
        return <RegisterPage onNavigate={navigate} />;

      // Farmer Module
      case '/farmer/dashboard':
        return (
          <FarmerDashboard
            onNavigate={navigate}
            onOpenUploadDoc={() => setIsUploadDocOpen(true)}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        );

      case '/farmer/profile':
        return <FarmerProfilePage onOpenUploadDoc={() => setIsUploadDocOpen(true)} />;

      case '/farmer/applications':
        return <FarmerApplicationsPage onNavigate={navigate} />;

      case '/farmer/contracts':
      case '/farmer/active-contracts':
        return <FarmerActiveContractsPage onNavigate={navigate} />;

      // Buyer Module
      case '/buyer/dashboard':
        return (
          <BuyerDashboard
            onNavigate={navigate}
            onOpenUploadDoc={() => setIsUploadDocOpen(true)}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        );

      case '/buyer/profile':
        return <BuyerProfilePage onOpenUploadDoc={() => setIsUploadDocOpen(true)} />;

      case '/buyer/manage-contracts':
      case '/buyer/contracts':
        return <BuyerContractsPage onNavigate={navigate} />;

      case '/buyer/contracts/new':
        return <BuyerContractsPage onNavigate={navigate} openCreateFormDirectly />;

      case '/buyer/active-contracts':
        return <BuyerActiveContractsPage onNavigate={navigate} />;

      // Admin Module
      case '/admin/dashboard':
        return <AdminDashboard onNavigate={navigate} />;

      case '/admin/verifications':
        return <AdminVerificationsPage />;

      case '/admin/reports':
        return <AdminReportsPage onNavigate={navigate} />;

      case '/admin/users':
        return <AdminUsersPage onNavigate={navigate} />;

      case '/admin/audit-logs':
        return <AdminAuditLogsPage onNavigate={navigate} />;

      default:
        return (
          <LandingPage
            onNavigate={navigate}
            onSelectContract={(id) => {
              setSelectedContractId(id);
              navigate('/explore');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf5] text-neutral-900 font-sans selection:bg-emerald-900 selection:text-white">
      {/* MongoDB Atlas Transparency Alert Banner (Never silent) */}
      {dbStatus?.atlasAttempted && !dbStatus?.atlasConnected && !isDbBannerDismissed && (
        <div className="bg-amber-950 text-amber-100 border-b border-amber-900/80 px-4 py-2.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="font-semibold text-white">MongoDB Atlas Connection Status:</strong>{' '}
                Direct Atlas connection failed ({dbStatus.atlasError || 'Authentication failed'}). Active storage: persistent disk daemon (<code>.mongo-data</code>).
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-[11px] text-amber-300 hidden md:inline">
                Target: {dbStatus.maskedUri}
              </span>
              <button
                onClick={() => setIsDbBannerDismissed(true)}
                className="text-amber-300 hover:text-white p-0.5 rounded focus:outline-none"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {dbStatus?.atlasConnected && (
        <div className="bg-emerald-950 text-emerald-100 border-b border-emerald-900/80 px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-medium text-emerald-200">
                Connected to MongoDB Atlas: <span className="font-mono text-emerald-300">{dbStatus.maskedUri}</span>
              </span>
            </div>
            <span className="text-[11px] text-emerald-400/80 font-mono hidden sm:inline">
              Cloud Persistence Verified
            </span>
          </div>
        </div>
      )}

      {/* Primary Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Page Body */}
      <main className="flex-1">{renderContent()}</main>

      {/* Global Modals */}
      <DocumentUploadModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        onSuccess={() => {
          setIsUploadDocOpen(false);
          refreshUser();
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={navigate}
      />

      <SupportTicketModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onSuccess={() => {
          setIsSupportOpen(false);
        }}
      />

      {/* Global Platform Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
