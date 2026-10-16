import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { BuyerProfile, DocumentItem } from '../../types/index.ts';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
} from 'lucide-react';

interface BuyerProfilePageProps {
  onOpenUploadDoc: () => void;
}

export const BuyerProfilePage: React.FC<BuyerProfilePageProps> = ({ onOpenUploadDoc }) => {
  const { user, profile, updateProfileState, refreshUser } = useAuth();
  const buyerProfile = profile as BuyerProfile | null;

  const [companyName, setCompanyName] = useState(buyerProfile?.companyName || '');
  const [businessType, setBusinessType] = useState(
    buyerProfile?.businessType || 'Agri Processing & Milling'
  );
  const [registrationNumber, setRegistrationNumber] = useState(
    buyerProfile?.registrationNumber || ''
  );
  const [gstNumber, setGstNumber] = useState(buyerProfile?.gstNumber || '');
  const [panNumber, setPanNumber] = useState(buyerProfile?.panNumber || '');
  const [state, setState] = useState(buyerProfile?.address?.state || 'Delhi');
  const [city, setCity] = useState(buyerProfile?.address?.city || '');
  const [street, setStreet] = useState(buyerProfile?.address?.street || '');
  const [pincode, setPincode] = useState(buyerProfile?.address?.pincode || '');

  // Contact Person
  const [contactName, setContactName] = useState(buyerProfile?.contactPerson?.name || '');
  const [contactDesignation, setContactDesignation] = useState(
    buyerProfile?.contactPerson?.designation || 'Procurement Director'
  );
  const [contactPhone, setContactPhone] = useState(buyerProfile?.contactPerson?.phone || '');
  const [contactEmail, setContactEmail] = useState(buyerProfile?.contactPerson?.email || '');

  // Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [requestingVerif, setRequestingVerif] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setDocsLoading(true);
      const res = await api.get('/documents/my');
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (buyerProfile) {
      setCompanyName(buyerProfile.companyName || '');
      setBusinessType(buyerProfile.businessType || 'Agri Processing & Milling');
      setRegistrationNumber(buyerProfile.registrationNumber || '');
      setGstNumber(buyerProfile.gstNumber || '');
      setPanNumber(buyerProfile.panNumber || '');
      setState(buyerProfile.address?.state || 'Delhi');
      setCity(buyerProfile.address?.city || '');
      setStreet(buyerProfile.address?.street || '');
      setPincode(buyerProfile.address?.pincode || '');
      setContactName(buyerProfile.contactPerson?.name || '');
      setContactDesignation(buyerProfile.contactPerson?.designation || 'Procurement Director');
      setContactPhone(buyerProfile.contactPerson?.phone || '');
      setContactEmail(buyerProfile.contactPerson?.email || '');
    }
    fetchDocuments();
  }, [buyerProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await api.put('/buyer/profile', {
        companyName,
        businessType,
        registrationNumber,
        gstNumber,
        panNumber,
        address: { state, city, street, pincode },
        contactPerson: {
          name: contactName,
          designation: contactDesignation,
          phone: contactPhone,
          email: contactEmail,
        },
      });

      if (res.data.success) {
        setSuccess('Corporate profile saved successfully!');
        updateProfileState(res.data.profile);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    try {
      setRequestingVerif(true);
      setError(null);
      setSuccess(null);

      const res = await api.post('/buyer/request-verification');
      if (res.data.success) {
        setSuccess(res.data.message);
        updateProfileState(res.data.profile);
        await refreshUser();
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setRequestingVerif(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await api.delete(`/documents/${id}`);
      if (res.data.success) {
        setDocuments((prev) => prev.filter((d) => d._id !== id));
        await refreshUser();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  const verificationStatus = buyerProfile?.verificationStatus || 'not_submitted';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1">
          Corporate Identity
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
          Buyer Profile & Legal Verification
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Complete mandatory statutory details and upload commercial licenses to obtain verified contracting authority.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Verification Status Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                verificationStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-900'
                  : verificationStatus === 'pending'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">
                Verification Status
              </span>
              <span className="text-base font-bold text-neutral-900 capitalize">
                {verificationStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {verificationStatus === 'verified' ? (
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorized to Publish Contracts</span>
              </span>
            ) : verificationStatus === 'pending' ? (
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Under Review by Administrator</span>
              </span>
            ) : (
              <button
                onClick={handleRequestVerification}
                disabled={requestingVerif}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{requestingVerif ? 'Submitting...' : 'Submit Verification Request'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification notes or feedback */}
        {buyerProfile?.verificationNotes && (
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
            <strong className="text-neutral-800 block">Administrator Audit Notes:</strong>
            <p className="text-neutral-600 leading-relaxed">{buyerProfile.verificationNotes}</p>
          </div>
        )}

        <div className="text-xs text-neutral-500 leading-relaxed space-y-1">
          <p>
            <strong>Strict Verification Rules:</strong> Registration and file uploads change document status only. They NEVER automatically verify a buyer.
          </p>
          <p>
            To publish contracts and receive farmer applications, you must complete your company details, upload at least one valid license (GST, CIN, or APMC), and click &quot;Submit Verification Request&quot; for Administrator review.
          </p>
        </div>
      </div>

      {/* Corporate Profile Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="font-heading text-base font-bold text-neutral-900">
              Company Registration & Legal Entity
            </h3>
            <p className="text-xs text-neutral-500">Official statutory credentials of your enterprise</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Corporate Entity Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Navratan Agro Mills Ltd."
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Business Type / Sector
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 bg-white focus:outline-emerald-800"
              >
                <option value="Agri Processing & Milling">Agri Processing & Milling</option>
                <option value="Wholesaler / Exporter">Wholesaler / Exporter</option>
                <option value="Supermarket Retail Chain">Supermarket Retail Chain</option>
                <option value="FMCG Food Manufacturer">FMCG Food Manufacturer</option>
                <option value="Farmers Producer Org / Cooperative">FPO / Cooperative</option>
                <option value="Seed & Grain Trading House">Trading House</option>
                <option value="Contract Farming Integrator">Contract Farming Integrator</option>
                <option value="Other Institutional Buyer">Other Institutional Buyer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                MCA Incorporation / CIN
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. U01100DL2018PTC334812"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800 uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                GSTIN Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="e.g. 07AAACB2194L1Z9"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                PAN Number
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="e.g. AAACB2194L"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800 uppercase font-mono"
              />
            </div>
          </div>

          <div className="border-b border-neutral-100 pb-4 pt-2">
            <h3 className="font-heading text-base font-bold text-neutral-900">
              Registered Office Address
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Street Address / Facility
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 14 Barakhamba Road, Connaught Place"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New Delhi"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 bg-white focus:outline-emerald-800"
              >
                <option value="Delhi">Delhi</option>
                <option value="Haryana">Haryana</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Punjab">Punjab</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>
          </div>

          <div className="border-b border-neutral-100 pb-4 pt-2">
            <h3 className="font-heading text-base font-bold text-neutral-900">
              Procurement Contact Person
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Vikramaditya Sengupta"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Designation</label>
              <input
                type="text"
                value={contactDesignation}
                onChange={(e) => setContactDesignation(e.target.value)}
                placeholder="e.g. Procurement Manager"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91..."
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="procurement@company.com"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
            >
              {saving ? 'Saving...' : 'Save Corporate Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Verification Documents */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-neutral-900">
              Statutory Verification Documents
            </h3>
            <p className="text-xs text-neutral-500">
              GST Certificates, Certificate of Incorporation, FSSAI, or Mandi Trade Licenses
            </p>
          </div>
          <button
            onClick={onOpenUploadDoc}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Verification File</span>
          </button>
        </div>

        {docsLoading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-10 text-center space-y-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
            <FileText className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-medium text-neutral-700">No documents uploaded yet</p>
            <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
              Please upload your GST Registration Certificate or Certificate of Incorporation so administrators can verify your enterprise.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-emerald-800" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">{doc.title}</p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {doc.docType.replace(/_/g, ' ').toUpperCase()} · {doc.originalName} ·{' '}
                      {(doc.fileSizeBytes / 1024).toFixed(0)} KB ·{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/api/documents/${doc._id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-neutral-600 hover:text-emerald-900 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="View Document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc._id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
