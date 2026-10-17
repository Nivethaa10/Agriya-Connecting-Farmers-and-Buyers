import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api.ts';
import { Contract } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  FileText,
  Plus,
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  ShieldAlert,
  ArrowRight,
  Edit3,
} from 'lucide-react';

interface BuyerContractsPageProps {
  onNavigate: (path: string) => void;
  openCreateFormDirectly?: boolean;
}

export const BuyerContractsPage: React.FC<BuyerContractsPageProps> = ({
  onNavigate,
  openCreateFormDirectly = false,
}) => {
  const { profile } = useAuth();
  const isVerified = (profile as any)?.verificationStatus === 'verified';

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(openCreateFormDirectly);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [cropName, setCropName] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [category, setCategory] = useState('Cereals & Grains');
  const [quantityRequiredTons, setQuantityRequiredTons] = useState('');
  const [minQuantityPerFarmerTons, setMinQuantityPerFarmerTons] = useState('2');
  const [pricePerTon, setPricePerTon] = useState('');

  // Quality Standards
  const [grade, setGrade] = useState('Grade A - Industrial Milling Standard');
  const [maxMoisturePercent, setMaxMoisturePercent] = useState(12);
  const [maxForeignMatterPercent, setMaxForeignMatterPercent] = useState(1.0);
  const [specificationNotes, setSpecificationNotes] = useState('');

  // Dates
  const [cultivationStartDate, setCultivationStartDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deliveryDeadline, setDeliveryDeadline] = useState(
    new Date(Date.now() + 105 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Delivery Location
  const [facilityName, setFacilityName] = useState('');
  const [state, setState] = useState('Haryana');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');

  // Payment Terms
  const [advancePercentage, setAdvancePercentage] = useState(20);
  const [onDeliveryPercentage, setOnDeliveryPercentage] = useState(80);
  const [settlementDays, setSettlementDays] = useState(5);
  const [paymentNotes, setPaymentNotes] = useState(
    'Direct RTGS within 5 business days of digital weighment and moisture report.'
  );

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/buyer/contracts');
      if (res.data.success) {
        setContracts(res.data.contracts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const resetForm = () => {
    setTitle('');
    setCropName('');
    setCropVariety('');
    setCategory('Cereals & Grains');
    setQuantityRequiredTons('');
    setMinQuantityPerFarmerTons('2');
    setPricePerTon('');
    setGrade('Grade A - Industrial Milling Standard');
    setMaxMoisturePercent(12);
    setMaxForeignMatterPercent(1.0);
    setSpecificationNotes('');
    setFacilityName('');
    setState('Haryana');
    setDistrict('');
    setAddress('');
    setAdvancePercentage(20);
    setOnDeliveryPercentage(80);
    setSettlementDays(5);
    setPaymentNotes('Direct RTGS within 5 business days of digital weighment and moisture report.');
    setEditingContractId(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmitContract = async (status: 'draft' | 'published') => {
    if (!title.trim() || !cropName.trim() || !quantityRequiredTons || !pricePerTon) {
      setFormError('Please fill in title, crop name, required quantity, and price.');
      return;
    }

    const quantity = Number(quantityRequiredTons);
    const minimumQuantity = Number(minQuantityPerFarmerTons);
    const price = Number(pricePerTon);
    if (!Number.isFinite(quantity) || quantity < 0.1 || !Number.isFinite(minimumQuantity) ||
      minimumQuantity < 0.1 || minimumQuantity > quantity || !Number.isFinite(price) || price <= 0) {
      setFormError('Enter a valid quantity and price. Minimum farmer quantity must be positive and no greater than total quantity.');
      return;
    }

    if (!facilityName.trim() || !state.trim() || !district.trim() || !address.trim()) {
      setFormError('Please provide complete intake facility location details.');
      return;
    }

    const startDate = Date.parse(cultivationStartDate);
    const harvestDate = Date.parse(expectedHarvestDate);
    const deliveryDate = Date.parse(deliveryDeadline);
    if (!Number.isFinite(startDate) || !Number.isFinite(harvestDate) ||
      !Number.isFinite(deliveryDate) || harvestDate < startDate || deliveryDate < harvestDate) {
      setFormError('Enter valid dates in order: cultivation start, expected harvest, then delivery deadline.');
      return;
    }

    const advance = Number(advancePercentage);
    const onDelivery = Number(onDeliveryPercentage);
    const daysToSettle = Number(settlementDays);
    if (!Number.isFinite(advance) || !Number.isFinite(onDelivery) || advance < 0 ||
      onDelivery < 0 || Math.abs(advance + onDelivery - 100) > 0.001 ||
      !Number.isInteger(daysToSettle) || daysToSettle < 1) {
      setFormError('Payment percentages must total 100%, and settlement days must be a positive whole number.');
      return;
    }

    if (!Number.isFinite(maxMoisturePercent) || maxMoisturePercent < 0 || maxMoisturePercent > 100 ||
      !Number.isFinite(maxForeignMatterPercent) || maxForeignMatterPercent < 0 || maxForeignMatterPercent > 100) {
      setFormError('Quality thresholds must be percentages between 0 and 100.');
      return;
    }

    if (status === 'published' && !isVerified) {
      setFormError(
        'Only administrator-verified buyers may publish contracts. Please save as draft until verification is approved.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      const payload = {
        title: title.trim(),
        cropName: cropName.trim(),
        cropVariety: cropVariety.trim(),
        category,
        quantityRequiredTons: quantity,
        minQuantityPerFarmerTons: minimumQuantity,
        pricePerTon: price,
        qualityStandards: {
          grade,
          maxMoisturePercent: Number(maxMoisturePercent),
          maxForeignMatterPercent: Number(maxForeignMatterPercent),
          specificationNotes,
        },
        cultivationStartDate,
        expectedHarvestDate,
        deliveryDeadline,
        deliveryLocation: {
          facilityName: facilityName.trim(),
          state,
          district: district.trim(),
          address: address.trim(),
        },
        paymentTerms: {
          advancePercentage: advance,
          onDeliveryPercentage: onDelivery,
          settlementDays: daysToSettle,
          notes: paymentNotes.trim(),
        },
        status,
      };

      let res;
      if (editingContractId) {
        res = await api.put(`/buyer/contracts/${editingContractId}`, payload);
      } else {
        res = await api.post('/buyer/contracts', payload);
      }

      if (res.data.success) {
        setFormSuccess(
          status === 'published'
            ? 'Contract published successfully to the marketplace!'
            : 'Contract saved as draft.'
        );
        setTimeout(() => {
          setIsCreating(false);
          resetForm();
          fetchContracts();
        }, 1000);
      } else {
        setFormError(res.data.message || 'The contract demand could not be saved.');
      }
    } catch (err: any) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishDraft = async (contractId: string) => {
    if (!isVerified) {
      alert(
        'Action blocked: Only administrator-verified buyers are permitted to publish contracts.'
      );
      return;
    }
    try {
      const res = await api.post(`/buyer/contracts/${contractId}/publish`);
      if (res.data.success) {
        alert(res.data.message);
        fetchContracts();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1">
            Procurement Management
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
            My Farming Contracts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Create, audit, publish, and review applicant producers for all your institutional procurement demands.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Contract Demand</span>
          </button>
        )}
      </div>

      {/* Contract Creation / Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                {editingContractId ? 'Edit Contract' : 'Create New Contract Demand'}
              </h2>
              <p className="text-xs text-neutral-500">
                Define crop tonnage, price per ton, quality grading cutoffs, and delivery hub
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(false);
                resetForm();
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Contract Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Export Grade Pusa 1121 Basmati Rice Procurement"
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Crop Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 bg-white focus:outline-emerald-800"
                >
                  <option value="Cereals & Grains">Cereals & Grains</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Oilseeds">Oilseeds</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Spices">Spices</option>
                  <option value="Cotton & Fiber">Cotton & Fiber</option>
                  <option value="Sugarcane & Cash Crops">Sugarcane & Cash Crops</option>
                </select>
              </div>
            </div>

            {/* Crop name & variety */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Crop Name
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Basmati Rice, Soybean, Tomato"
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Crop Variety / Hybrid (Optional)
                </label>
                <input
                  type="text"
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  placeholder="e.g. Pusa 1121 / JS-335"
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:outline-emerald-800"
                />
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Total Quantity Demanded (Tons)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={quantityRequiredTons}
                  onChange={(e) => setQuantityRequiredTons(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Min Offer per Farmer (Tons)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={minQuantityPerFarmerTons}
                  onChange={(e) => setMinQuantityPerFarmerTons(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Locked Price (₹ per Metric Ton)
                </label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  value={pricePerTon}
                  onChange={(e) => setPricePerTon(e.target.value)}
                  placeholder="e.g. 48000"
                  className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums bg-white"
                  required
                />
              </div>
            </div>

            {/* Quality specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Quality Grade Name
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Max Permissible Moisture (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={maxMoisturePercent}
                  onChange={(e) => setMaxMoisturePercent(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Max Foreign Matter (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={maxForeignMatterPercent}
                  onChange={(e) => setMaxForeignMatterPercent(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2.5 text-neutral-900 tabular-nums"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Cultivation Start Date
                </label>
                <input
                  type="date"
                  value={cultivationStartDate}
                  onChange={(e) => setCultivationStartDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  value={expectedHarvestDate}
                  onChange={(e) => setExpectedHarvestDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Delivery Deadline
                </label>
                <input
                  type="date"
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                  required
                />
              </div>
            </div>

            {/* Delivery Location */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Intake Center / Facility Name
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g. Karnal Agro-Logistics Terminal"
                  className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Karnal"
                  className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                >
                  <option value="Haryana">Haryana</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Full Street Address of Warehouse
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. NH-44 Sector 33, Grain Terminal Complex"
                  className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  required
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100">
              <div className="text-xs text-neutral-500">
                {!isVerified && (
                  <span className="text-amber-800 font-medium">
                    Note: Unverified buyers can only save as draft until Administrator verifies identity.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitContract('draft')}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitContract('published')}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {submitting ? 'Processing...' : 'Publish Contract Live'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contracts List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-neutral-400">Loading your contracts...</div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center space-y-3">
          <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-heading text-base font-bold text-neutral-900">
            No contracts on file
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Create your first procurement demand contract specifying required crop, quantity, and pricing.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors inline-block mt-2 shadow-xs"
          >
            Create Contract
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5 hover:border-neutral-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                      {c.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        c.status === 'published'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-neutral-900 mt-0.5">
                    {c.title}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Crop: <strong>{c.cropName}</strong> {c.cropVariety ? `(${c.cropVariety})` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {c.status === 'draft' && (
                    <button
                      onClick={() => handlePublishDraft(c._id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors shadow-xs"
                    >
                      Publish Draft
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate(`/buyer/contracts/${c._id}/applications`)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Applications ({c.totalApplications || 0})</span>
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-500 block">Required Volume</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {c.quantityRequiredTons} tons
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Allocated / Committed</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {c.allocatedQuantityTons || 0} tons
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Price per Ton</span>
                  <span className="font-bold text-emerald-950 tabular-nums">
                    ₹{c.pricePerTon.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Deadline</span>
                  <span className="font-bold text-neutral-900">
                    {new Date(c.deliveryDeadline).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500 pt-1">
                <span>
                  Intake Depot: {c.deliveryLocation.facilityName}, {c.deliveryLocation.district}
                </span>
                <span>
                  Created: {new Date(c.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
