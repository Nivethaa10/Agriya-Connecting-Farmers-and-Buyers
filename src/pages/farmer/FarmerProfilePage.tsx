import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { DocumentItem, FarmerProfile } from '../../types/index.ts';
import {
  User,
  Sprout,
  MapPin,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface FarmerProfilePageProps {
  onOpenUploadDoc: () => void;
}

export const FarmerProfilePage: React.FC<FarmerProfilePageProps> = ({ onOpenUploadDoc }) => {
  const { user, profile, updateProfileState } = useAuth();
  const farmer = profile as FarmerProfile | null;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [farmName, setFarmName] = useState(farmer?.farmName || '');
  const [state, setState] = useState(farmer?.location?.state || 'Madhya Pradesh');
  const [district, setDistrict] = useState(farmer?.location?.district || '');
  const [village, setVillage] = useState(farmer?.location?.village || '');
  const [pincode, setPincode] = useState(farmer?.location?.pincode || '');
  const [experienceYears, setExperienceYears] = useState(farmer?.experienceYears || 5);
  const [farmSizeAcres, setFarmSizeAcres] = useState(farmer?.farmSizeAcres || 5);
  const [soilType, setSoilType] = useState(farmer?.soilType || 'Alluvial Soil');
  const [irrigationSource, setIrrigationSource] = useState(
    farmer?.irrigationSource || 'Drip Irrigation'
  );
  const [productionCapacityTons, setProductionCapacityTons] = useState(
    farmer?.productionCapacityTons || 20
  );
  const [bio, setBio] = useState(farmer?.bio || '');

  // Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setDocsLoading(true);
      const res = await api.get('/documents/my');
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (farmer) {
      setFarmName(farmer.farmName || '');
      setState(farmer.location?.state || 'Madhya Pradesh');
      setDistrict(farmer.location?.district || '');
      setVillage(farmer.location?.village || '');
      setPincode(farmer.location?.pincode || '');
      setExperienceYears(farmer.experienceYears || 0);
      setFarmSizeAcres(farmer.farmSizeAcres || 0);
      setSoilType(farmer.soilType || 'Alluvial Soil');
      setIrrigationSource(farmer.irrigationSource || 'Drip Irrigation');
      setProductionCapacityTons(farmer.productionCapacityTons || 0);
      setBio(farmer.bio || '');
    }
    fetchDocuments();
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await api.put('/farmer/profile', {
        farmName,
        location: { state, district, village, pincode },
        experienceYears: Number(experienceYears),
        farmSizeAcres: Number(farmSizeAcres),
        soilType,
        irrigationSource,
        productionCapacityTons: Number(productionCapacityTons),
        bio,
      });

      if (res.data.success) {
        setSuccess('Farm profile updated and persisted to database!');
        updateProfileState(res.data.profile);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this document and its file?')) {
      return;
    }
    try {
      const res = await api.delete(`/documents/${id}`);
      if (res.data.success) {
        setDocuments((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1">
          Producer Credentials
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
          Farm & Agronomic Profile
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Maintain verified farm acreage, soil characteristics, and legal land records for corporate buyer audits.
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

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="font-heading text-base font-bold text-neutral-900">
              Basic Farm Identity
            </h3>
            <p className="text-xs text-neutral-500">General details about your agricultural holding</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Farm / Collective Name
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Green Valley Organic Acres"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Farming Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="70"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800 tabular-nums"
                required
              />
            </div>
          </div>

          <div className="border-b border-neutral-100 pb-4 pt-2">
            <h3 className="font-heading text-base font-bold text-neutral-900">
              Agronomic Specifications
            </h3>
            <p className="text-xs text-neutral-500">Technical capacity evaluated by institutional buyers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Total Land Size (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={farmSizeAcres}
                onChange={(e) => setFarmSizeAcres(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800 tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Dominant Soil Type
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 bg-white focus:outline-emerald-800"
              >
                <option value="Alluvial Soil">Alluvial Soil (River Basin)</option>
                <option value="Black Cotton Soil">Black Cotton Soil (Regur)</option>
                <option value="Red & Yellow Soil">Red & Yellow Soil</option>
                <option value="Clayey Loam">Clayey Loam</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Laterite Soil">Laterite Soil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Primary Irrigation System
              </label>
              <select
                value={irrigationSource}
                onChange={(e) => setIrrigationSource(e.target.value)}
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 bg-white focus:outline-emerald-800"
              >
                <option value="Drip Irrigation">Micro Drip Fertigation</option>
                <option value="Sprinkler System">Overhead Sprinkler System</option>
                <option value="Canal Irrigation">Perennial Canal Water</option>
                <option value="Deep Tube-well / Borewell">Borewell with Solar Pump</option>
                <option value="Rainfed / Monsoon">Monsoon / Rainfed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Annual Production Capacity (Metric Tons)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={productionCapacityTons}
                onChange={(e) => setProductionCapacityTons(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800 tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 bg-white focus:outline-emerald-800"
              >
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Haryana">Haryana</option>
                <option value="Punjab">Punjab</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Karnal or Sehore"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Village / Tehsil
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Nilokheri"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 132117"
                className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Farm Biography / Agronomic Highlights
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight any specialized crops, mechanization equipment (tractors, harvesters), or organic practices..."
              className="w-full text-xs rounded-xl border border-neutral-300 p-3 text-neutral-900 focus:outline-emerald-800"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-neutral-900">
              Verified Farm Documents
            </h3>
            <p className="text-xs text-neutral-500">
              Land records (Patta / 7/12 extract), identity cards, and soil test certificates
            </p>
          </div>
          <button
            onClick={onOpenUploadDoc}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        </div>

        {docsLoading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-10 text-center space-y-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
            <FileText className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-medium text-neutral-700">No documents uploaded yet</p>
            <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
              Please upload your Land Records (Khatauni / Patta) or Soil Test Reports so that corporate buyers can verify your production capacity.
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
                      {doc.originalName} · {(doc.fileSizeBytes / 1024).toFixed(0)} KB ·{' '}
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
