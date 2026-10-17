import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api.ts';
import { ContractLifecycleHistory } from '../../components/ContractLifecycleHistory.tsx';
import {
  ContractRelationship,
  ProgressUpdate,
  Harvest,
  QualityInspection,
  Delivery,
  Payment,
} from '../../types/index.ts';
import {
  Sprout,
  Wheat,
  Scale,
  Truck,
  CreditCard,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  FileText,
  LifeBuoy,
} from 'lucide-react';

const cultivationStages = [
  { stage: 'sowing', label: 'Sowing & Emergence', min: 10, max: 24 },
  { stage: 'vegetative', label: 'Vegetative Growth & Tiller Development', min: 25, max: 49 },
  { stage: 'flowering_fruiting', label: 'Flowering & Pod / Grain Formation', min: 50, max: 69 },
  { stage: 'mature_harvest_ready', label: 'Ripening & Mature Harvest Ready', min: 70, max: 79 },
] as const;

interface FarmerActiveLifecyclePageProps {
  relationshipId: string;
  onNavigate: (path: string) => void;
  onOpenSupport: () => void;
}

export const FarmerActiveLifecyclePage: React.FC<FarmerActiveLifecyclePageProps> = ({
  relationshipId,
  onNavigate,
  onOpenSupport,
}) => {
  const [relationship, setRelationship] = useState<ContractRelationship | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [qualityInspection, setQualityInspection] = useState<QualityInspection | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'harvest' | 'delivery' | 'payments'>(
    'progress'
  );

  // Forms states
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [stageName, setStageName] = useState('Vegetative Growth & Tiller Development');
  const [progressPercentage, setProgressPercentage] = useState(40);
  const [soilCondition, setSoilCondition] = useState('Optimum moisture, organic mulch active');
  const [irrigationStatus, setIrrigationStatus] = useState('Drip cycle 3 hrs every alternate day');
  const [pestControlMeasures, setPestControlMeasures] = useState(
    'Preventive neem oil application; no stem borer signs'
  );
  const [cropHealthRating, setCropHealthRating] = useState<
    'excellent' | 'good' | 'moderate' | 'attention_needed'
  >('excellent');
  const [progressNotes, setProgressNotes] = useState('');
  const [progressSaving, setProgressSaving] = useState(false);

  // Harvest form
  const [isRecordingHarvest, setIsRecordingHarvest] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvestedQuantity, setHarvestedQuantity] = useState('');
  const [measuredGrade, setMeasuredGrade] = useState('Grade A1 Premium');
  const [moisturePercentage, setMoisturePercentage] = useState(11.5);
  const [packagingDetails, setPackagingDetails] = useState('50kg standard food-grade bags');
  const [storageLocation, setStorageLocation] = useState('Ventilated farm grain silo');
  const [harvestNotes, setHarvestNotes] = useState('');
  const [harvestSaving, setHarvestSaving] = useState(false);

  // Delivery form
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [consignmentWaybill, setConsignmentWaybill] = useState('');
  const [deliveredQuantity, setDeliveredQuantity] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliverySaving, setDeliverySaving] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLifecycle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/farmer/active-contracts/${relationshipId}`);
      if (res.data.success) {
        setRelationship(res.data.relationship);
        const currentStageIndex = cultivationStages.findIndex(
          (stage) => stage.stage === res.data.relationship?.lifecycleStage
        );
        const nextStage = cultivationStages[Math.max(0, Math.min(currentStageIndex + 1, cultivationStages.length - 1))];
        if (nextStage) {
          setStageName(nextStage.label);
          setProgressPercentage(Math.max(nextStage.min, res.data.relationship.progressPercentage));
        }
        setProgressUpdates(res.data.progressUpdates || []);
        setHarvest(res.data.harvest);
        setQualityInspection(res.data.qualityInspection);
        setDelivery(res.data.delivery);
        setPayments(res.data.payment || []);
        if (res.data.relationship?.agreedQuantityTons) {
          setHarvestedQuantity(String(res.data.relationship.agreedQuantityTons));
          setDeliveredQuantity(String(res.data.relationship.agreedQuantityTons));
        }
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLifecycle();
  }, [relationshipId]);

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressNotes) return;
    try {
      setProgressSaving(true);
      const res = await api.post(`/farmer/active-contracts/${relationshipId}/progress`, {
        stageName,
        progressPercentage: Number(progressPercentage),
        soilCondition,
        irrigationStatus,
        pestControlMeasures,
        cropHealthRating,
        notes: progressNotes,
      });
      if (res.data.success) {
        setNotificationMsg({ type: 'success', text: 'Cultivation progress logged and updated!' });
        setIsAddingProgress(false);
        setProgressNotes('');
        await fetchLifecycle();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setProgressSaving(false);
    }
  };

  const handleSaveHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestedQuantity) return;
    try {
      setHarvestSaving(true);
      const res = await api.post(`/farmer/active-contracts/${relationshipId}/harvest`, {
        harvestDate,
        harvestedQuantityTons: Number(harvestedQuantity),
        measuredGrade,
        moisturePercentage: Number(moisturePercentage),
        packagingDetails,
        storageLocation,
        specialObservations: harvestNotes,
      });
      if (res.data.success) {
        setNotificationMsg({
          type: 'success',
          text: 'Harvest details recorded! Buyer notified for quality inspection.',
        });
        setIsRecordingHarvest(false);
        await fetchLifecycle();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setHarvestSaving(false);
    }
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDeliverySaving(true);
      const res = await api.post(`/farmer/active-contracts/${relationshipId}/delivery`, {
        dispatchDate,
        vehicleRegistrationNumber: vehicleNumber,
        transporterName,
        driverContactPhone: driverContact,
        consignmentWaybillNumber: consignmentWaybill,
        deliveredQuantityTons: Number(deliveredQuantity) || relationship?.agreedQuantityTons,
        status: 'dispatched',
      });
      if (res.data.success) {
        setNotificationMsg({
          type: 'success',
          text: 'Consignment dispatch logged! Tracking details sent to buyer.',
        });
        setIsUpdatingDelivery(false);
        await fetchLifecycle();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setDeliverySaving(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-neutral-400">Loading contract workspace...</div>;
  }

  if (!relationship) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-neutral-900">Contract Workspace Not Found</h2>
        <p className="text-xs text-neutral-500">You may not have permission to view this contract.</p>
        <button
          onClick={() => onNavigate('/farmer/active-contracts')}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg"
        >
          Back to Active Contracts
        </button>
      </div>
    );
  }

  const currentGrowthIndex = cultivationStages.findIndex(
    (stage) => stage.stage === relationship.lifecycleStage
  );
  const selectedGrowthStage =
    cultivationStages.find((stage) => stage.label === stageName) || cultivationStages[1];
  const allowedGrowthStages = cultivationStages.filter(
    (_, index) => index >= currentGrowthIndex && index <= currentGrowthIndex + 1
  );
  const canLogProgress =
    relationship.status === 'active' && currentGrowthIndex >= 0 && currentGrowthIndex < cultivationStages.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                {relationship.cropName} Contract
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {relationship.lifecycleStage.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
              {relationship.contractId?.title || `${relationship.cropName} Farming Contract`}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Contracted Buyer: <strong>{relationship.buyerId?.name || 'Institutional Partner'}</strong> · Contact:{' '}
              {relationship.buyerId?.phone || 'N/A'}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Last updated {new Date(relationship.updatedAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSupport}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-neutral-500" />
              <span>Raise Support Issue</span>
            </button>
          </div>
        </div>

        {/* Global Lifecycle Step Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Contract Lifecycle Progress</span>
            <span className="font-bold text-neutral-900 tabular-nums">
              {relationship.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-800 rounded-full transition-all"
              style={{ width: `${relationship.progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-neutral-400 uppercase tracking-wider pt-1">
            <span>Sowing</span>
            <span>Cultivation</span>
            <span>Harvest</span>
            <span>Inspection</span>
            <span>Delivery</span>
            <span>Settled</span>
          </div>
        </div>

        {/* Core Financial Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
          <div>
            <span className="text-neutral-500 block">Agreed Volume</span>
            <span className="font-bold text-neutral-900 tabular-nums">
              {relationship.agreedQuantityTons} tons
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Agreed Price</span>
            <span className="font-bold text-emerald-950 tabular-nums">
              ₹{relationship.agreedPricePerTon.toLocaleString('en-IN')} / ton
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Total Contract Value</span>
            <span className="font-bold text-emerald-950 tabular-nums">
              ₹{relationship.totalAgreedValue.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Status</span>
            <span className="font-bold text-neutral-900 capitalize">{relationship.status}</span>
          </div>
        </div>
      </div>

      <ContractLifecycleHistory entries={relationship.lifecycleHistory} />

      {notificationMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notificationMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-neutral-200 gap-6 text-xs font-semibold text-neutral-600">
        <button
          onClick={() => setActiveTab('progress')}
          className={`pb-3 transition-colors ${
            activeTab === 'progress'
              ? 'text-emerald-950 border-b-2 border-emerald-900 font-bold'
              : 'hover:text-neutral-900'
          }`}
        >
          1. Cultivation Logs ({progressUpdates.length})
        </button>
        <button
          onClick={() => setActiveTab('harvest')}
          className={`pb-3 transition-colors ${
            activeTab === 'harvest'
              ? 'text-emerald-950 border-b-2 border-emerald-900 font-bold'
              : 'hover:text-neutral-900'
          }`}
        >
          2. Harvest & Quality ({harvest ? 'Recorded' : 'Pending'})
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 transition-colors ${
            activeTab === 'delivery'
              ? 'text-emerald-950 border-b-2 border-emerald-900 font-bold'
              : 'hover:text-neutral-900'
          }`}
        >
          3. Dispatch & Delivery ({delivery?.status || 'Scheduled'})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 transition-colors ${
            activeTab === 'payments'
              ? 'text-emerald-950 border-b-2 border-emerald-900 font-bold'
              : 'hover:text-neutral-900'
          }`}
        >
          4. Payments ({payments.length})
        </button>
      </div>

      {/* TAB 1: Cultivation Progress Logs */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Cultivation Progress Journal
              </h3>
              <p className="text-xs text-neutral-500">
                Post field milestones to demonstrate crop health and build buyer trust
              </p>
            </div>
            {!isAddingProgress && canLogProgress && (
              <button
                onClick={() => setIsAddingProgress(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Progress Entry</span>
              </button>
            )}
          </div>

          {/* Form to add progress */}
          {isAddingProgress && (
            <form
              onSubmit={handleSaveProgress}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Add Field Cultivation Log
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Current Growth Stage
                  </label>
                  <select
                    value={stageName}
                    onChange={(e) => {
                      const selected = cultivationStages.find((stage) => stage.label === e.target.value);
                      if (!selected) return;
                      setStageName(selected.label);
                      setProgressPercentage(Math.max(selected.min, Math.min(selected.max, progressPercentage)));
                    }}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  >
                    {allowedGrowthStages.map((stage) => (
                      <option key={stage.stage} value={stage.label}>{stage.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Progress Percentage ({progressPercentage}%)
                  </label>
                  <input
                    type="range"
                    min={selectedGrowthStage.min}
                    max={selectedGrowthStage.max}
                    step="5"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="w-full accent-emerald-900 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Soil & Moisture Condition
                  </label>
                  <input
                    type="text"
                    value={soilCondition}
                    onChange={(e) => setSoilCondition(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Crop Health Evaluation
                  </label>
                  <select
                    value={cropHealthRating}
                    onChange={(e: any) => setCropHealthRating(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  >
                    <option value="excellent">Excellent — Vigorous Growth</option>
                    <option value="good">Good — Normal Development</option>
                    <option value="moderate">Moderate — Minor Stress</option>
                    <option value="attention_needed">Attention Needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Pest & Nutrient Interventions
                </label>
                <input
                  type="text"
                  value={pestControlMeasures}
                  onChange={(e) => setPestControlMeasures(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Field Observations & Remarks
                </label>
                <textarea
                  rows={3}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Describe crop stand, canopy closure, weather impact, or estimated harvest readiness..."
                  className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 text-neutral-900"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingProgress(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={progressSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {progressSaving ? 'Saving...' : 'Post Progress Entry'}
                </button>
              </div>
            </form>
          )}

          {/* Timeline of progress entries */}
          {progressUpdates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-2">
              <Sprout className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">No progress updates logged yet</p>
              <p className="text-[11px] text-neutral-500">
                Log the first sowing or vegetative progress update above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progressUpdates.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                      <h4 className="text-xs font-bold text-neutral-900">{p.stageName}</h4>
                      <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {p.cropHealthRating}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 tabular-nums">
                      {new Date(p.recordedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed">{p.notes}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg">
                    <div>
                      <strong>Soil / Moisture:</strong> {p.soilCondition}
                    </div>
                    <div>
                      <strong>Pest Management:</strong> {p.pestControlMeasures}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Harvest & Quality Inspection */}
      {activeTab === 'harvest' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Harvest Record & Quality Grading
              </h3>
              <p className="text-xs text-neutral-500">
                Record actual harvested yield for intake and review buyer lab quality certificates
              </p>
            </div>
            {!harvest && !isRecordingHarvest && relationship.lifecycleStage === 'mature_harvest_ready' && relationship.status === 'active' && (
              <button
                onClick={() => setIsRecordingHarvest(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Record Actual Harvest</span>
              </button>
            )}
          </div>

          {/* Form to record harvest */}
          {isRecordingHarvest && (
            <form
              onSubmit={handleSaveHarvest}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Record Actual Crop Harvest
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Harvested Quantity (Metric Tons)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={harvestedQuantity}
                    onChange={(e) => setHarvestedQuantity(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePercentage}
                    onChange={(e) => setMoisturePercentage(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Packaging Details
                  </label>
                  <input
                    type="text"
                    value={packagingDetails}
                    onChange={(e) => setPackagingDetails(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Storage Depot Location
                  </label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Special Harvest Observations
                </label>
                <textarea
                  rows={2}
                  value={harvestNotes}
                  onChange={(e) => setHarvestNotes(e.target.value)}
                  placeholder="Note weather conditions during harvest, threshing details, grain appearance..."
                  className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 text-neutral-900"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRecordingHarvest(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={harvestSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {harvestSaving ? 'Saving...' : 'Save Harvest Record'}
                </button>
              </div>
            </form>
          )}

          {/* Harvest Display */}
          {harvest ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-emerald-900" />
                  <h4 className="font-heading text-sm font-bold text-neutral-900">
                    Official Harvest Yield Record
                  </h4>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Harvest Complete
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-500 block">Quantity</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {harvest.harvestedQuantityTons} tons
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Harvest Date</span>
                  <span className="font-bold text-neutral-900">
                    {new Date(harvest.harvestDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Moisture Level</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {harvest.moisturePercentage}%
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Grade</span>
                  <span className="font-bold text-neutral-900">{harvest.measuredGrade}</span>
                </div>
              </div>

              <p className="text-xs text-neutral-600">
                <strong>Storage & Packaging:</strong> {harvest.packagingDetails} · {harvest.storageLocation}
              </p>
            </div>
          ) : (
            !isRecordingHarvest && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-2">
                <Wheat className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-xs font-medium text-neutral-700">Harvest not yet recorded</p>
                <p className="text-[11px] text-neutral-500">
                  When the crop reaches maturity, record your yield to schedule inspection and dispatch.
                </p>
              </div>
            )
          )}

          {/* Quality Inspection Assessment from Buyer */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-900" />
                <h4 className="font-heading text-sm font-bold text-neutral-900">
                  Buyer Quality Grading Certificate
                </h4>
              </div>
              {qualityInspection ? (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    qualityInspection.decision.includes('approved')
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {qualityInspection.decision.replace(/_/g, ' ').toUpperCase()}
                </span>
              ) : (
                <span className="text-xs text-neutral-400">Awaiting Consignment Inspection</span>
              )}
            </div>

            {qualityInspection ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-neutral-500 block">Inspector</span>
                    <span className="font-bold text-neutral-900">{qualityInspection.inspectorName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Tested Moisture</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {qualityInspection.measuredMoisturePercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Foreign Matter</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {qualityInspection.measuredForeignMatterPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Lab Certificate #</span>
                    <span className="font-bold text-neutral-900">
                      {qualityInspection.labTestCertificateNumber || 'CERT-AGR-OK'}
                    </span>
                  </div>
                </div>

                <div className="text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  <strong className="text-neutral-800">Inspector Findings:</strong>{' '}
                  {qualityInspection.inspectorRemarks}
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                The institutional buyer will perform laboratory testing for moisture, foreign matter, and grade upon consignment delivery.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Dispatch & Delivery */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Consignment Logistics & Dispatch
              </h3>
              <p className="text-xs text-neutral-500">
                Provide transporter and vehicle registration details to coordinate delivery to the buyer's depot
              </p>
            </div>
            {!isUpdatingDelivery && ['quality_inspected', 'dispatch_scheduled'].includes(relationship.lifecycleStage) && relationship.status === 'active' && (
              <button
                onClick={() => setIsUpdatingDelivery(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Update Dispatch Details</span>
              </button>
            )}
          </div>

          {/* Form to update delivery */}
          {isUpdatingDelivery && (
            <form
              onSubmit={handleSaveDelivery}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Log Consignment Dispatch
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Dispatch Date
                  </label>
                  <input
                    type="date"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Vehicle Registration Number
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. HR-05-AB-4921"
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Dispatched Quantity (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={deliveredQuantity}
                    onChange={(e) => setDeliveredQuantity(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Transporter / Freight Carrier
                  </label>
                  <input
                    type="text"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    placeholder="e.g. Kisan Logistics Express"
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Driver Phone Number
                  </label>
                  <input
                    type="tel"
                    value={driverContact}
                    onChange={(e) => setDriverContact(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Consignment Waybill / Bilty Number
                </label>
                <input
                  type="text"
                  value={consignmentWaybill}
                  onChange={(e) => setConsignmentWaybill(e.target.value)}
                  placeholder="e.g. WB-2026-9042"
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsUpdatingDelivery(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deliverySaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {deliverySaving ? 'Saving...' : 'Confirm Dispatch Details'}
                </button>
              </div>
            </form>
          )}

          {/* Current Delivery Status Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-900" />
                <h4 className="font-heading text-sm font-bold text-neutral-900">
                  Delivery Status & Warehouse Destination
                </h4>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {delivery?.status || 'Scheduled'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-neutral-500 block">Intake Depot</span>
                <span className="font-bold text-neutral-900">
                  {delivery?.destinationWarehouse || 'Central Processing Hub'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Vehicle #</span>
                <span className="font-bold text-neutral-900">
                  {delivery?.vehicleRegistrationNumber || 'Pending Dispatch'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Waybill #</span>
                <span className="font-bold text-neutral-900">
                  {delivery?.consignmentWaybillNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Confirmation</span>
                <span className="font-bold text-neutral-900">
                  {delivery?.confirmedAt
                    ? `Confirmed on ${new Date(delivery.confirmedAt).toLocaleDateString('en-IN')}`
                    : 'Pending Receipt'}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-600">
              <strong>Warehouse Address:</strong>{' '}
              {delivery?.destinationAddress || 'As specified in contract terms'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: Payments & Settlements */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-neutral-900">
              Bank Settlement & Payment Records
            </h3>
            <p className="text-xs text-neutral-500">
              Direct banking transfer entries and statutory UTR tracking managed by corporate buyer
            </p>
          </div>

          {payments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-2">
              <CreditCard className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">No payment records logged yet</p>
              <p className="text-[11px] text-neutral-500">
                Payment settlements will be recorded by the buyer upon consignment confirmation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-emerald-950 tabular-nums">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                          p.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Channel: {p.paymentMethod} · Type: {p.paymentType?.replace(/_/g, ' ')}
                    </p>
                    {p.bankReferenceNumber && (
                      <p className="text-[11px] text-neutral-600 font-mono">
                        UTR / Bank Ref: {p.bankReferenceNumber}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-neutral-400 tabular-nums">
                    {p.paidAt
                      ? `Settled: ${new Date(p.paidAt).toLocaleDateString('en-IN')}`
                      : `Created: ${new Date(p.createdAt).toLocaleDateString('en-IN')}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
