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
  FarmerProfile,
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

interface BuyerActiveLifecyclePageProps {
  relationshipId: string;
  onNavigate: (path: string) => void;
  onOpenSupport: () => void;
}

export const BuyerActiveLifecyclePage: React.FC<BuyerActiveLifecyclePageProps> = ({
  relationshipId,
  onNavigate,
  onOpenSupport,
}) => {
  const [relationship, setRelationship] = useState<ContractRelationship | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [qualityInspection, setQualityInspection] = useState<QualityInspection | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'inspection' | 'delivery' | 'payments'>(
    'monitoring'
  );

  // Quality Inspection Form
  const [isRecordingInspection, setIsRecordingInspection] = useState(false);
  const [inspectorName, setInspectorName] = useState('Dr. Arvind Joshi (Senior Agronomist)');
  const [decision, setDecision] = useState<
    'approved_grade_a' | 'approved_grade_b' | 'conditional_acceptance' | 'rejected'
  >('approved_grade_a');
  const [measuredMoisture, setMeasuredMoisture] = useState(11.2);
  const [measuredForeignMatter, setMeasuredForeignMatter] = useState(0.8);
  const [labCertificateNumber, setLabCertificateNumber] = useState(`QC-${Date.now().toString().slice(-6)}`);
  const [inspectorRemarks, setInspectorRemarks] = useState(
    'Consignment complies with export specifications. Moisture within 12% ceiling, uniform grain elongation.'
  );
  const [inspectionSaving, setInspectionSaving] = useState(false);

  // Delivery confirmation form
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('Consignment received, gross and tare weight verified at weighbridge.');
  const [deliveryConfirming, setDeliveryConfirming] = useState(false);

  // Payment Form
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'advance' | 'milestone' | 'final_settlement' | 'full_lump_sum'>('final_settlement');
  const [paymentMethod, setPaymentMethod] = useState<'NEFT / RTGS' | 'Direct Bank Transfer' | 'Escrow Release' | 'Cheque'>('NEFT / RTGS');
  const [bankRefNumber, setBankRefNumber] = useState(`UTR${Date.now().toString().slice(-8)}`);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'paid'>('paid');
  const [paymentNotes, setPaymentNotes] = useState('Full contract value settlement released to registered farmer bank account.');
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLifecycle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/buyer/active-contracts/${relationshipId}`);
      if (res.data.success) {
        setRelationship(res.data.relationship);
        setFarmerProfile(res.data.farmerProfile);
        setProgressUpdates(res.data.progressUpdates || []);
        setHarvest(res.data.harvest);
        setQualityInspection(res.data.qualityInspection);
        setDelivery(res.data.delivery);
        setPayments(res.data.payments || []);

        if (res.data.relationship?.totalAgreedValue) {
          setPaymentAmount(String(res.data.relationship.totalAgreedValue));
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

  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setInspectionSaving(true);
      const res = await api.post(`/buyer/active-contracts/${relationshipId}/inspection`, {
        inspectorName,
        decision,
        measuredMoisturePercent: Number(measuredMoisture),
        measuredForeignMatterPercent: Number(measuredForeignMatter),
        labTestCertificateNumber: labCertificateNumber,
        inspectorRemarks,
      });

      if (res.data.success) {
        setNotificationMsg({ type: 'success', text: 'Quality inspection assessment recorded!' });
        setIsRecordingInspection(false);
        await fetchLifecycle();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setInspectionSaving(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDeliveryConfirming(true);
      const res = await api.post(`/buyer/active-contracts/${relationshipId}/delivery-confirm`, {
        notes: deliveryNotes,
      });

      if (res.data.success) {
        setNotificationMsg({ type: 'success', text: 'Delivery intake confirmed at warehouse!' });
        setIsConfirmingDelivery(false);
        await fetchLifecycle();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setDeliveryConfirming(false);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;
    try {
      setPaymentSaving(true);
      const res = await api.post(`/buyer/active-contracts/${relationshipId}/payment`, {
        amount: Number(paymentAmount),
        paymentType,
        paymentMethod,
        bankReferenceNumber: bankRefNumber,
        status: paymentStatus,
        notes: paymentNotes,
      });

      if (res.data.success) {
        setNotificationMsg({
          type: 'success',
          text: 'Payment transaction record updated! Contract lifecycle updated.',
        });
        setIsRecordingPayment(false);
        await fetchLifecycle();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setPaymentSaving(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-neutral-400">Loading contract workspace...</div>;
  }

  if (!relationship) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-neutral-900">Contract Relationship Not Found</h2>
        <button
          onClick={() => onNavigate('/buyer/active-contracts')}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg"
        >
          Back to Active Contracts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                {relationship.cropName} Procurement
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {relationship.lifecycleStage.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
              {relationship.contractId?.title || `${relationship.cropName} Contract`}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Contracted Producer: <strong>{relationship.farmerId?.name}</strong> · Phone:{' '}
              {relationship.farmerId?.phone} · Email: {relationship.farmerId?.email}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Last updated {new Date(relationship.updatedAt).toLocaleString('en-IN')}
            </p>
          </div>

          <button
            onClick={onOpenSupport}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-neutral-500" />
            <span>Support & Dispute</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Lifecycle Progress</span>
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
        </div>

        {/* Agreed Terms Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
          <div>
            <span className="text-neutral-500 block">Agreed Volume</span>
            <span className="font-bold text-neutral-900 tabular-nums">
              {relationship.agreedQuantityTons} tons
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Price per Ton</span>
            <span className="font-bold text-emerald-950 tabular-nums">
              ₹{relationship.agreedPricePerTon.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Total Settlement</span>
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

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-6 text-xs font-semibold text-neutral-600">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`pb-3 transition-colors ${
            activeTab === 'monitoring'
              ? 'text-emerald-950 border-b-2 border-emerald-900 font-bold'
              : 'hover:text-neutral-900'
          }`}
        >
          1. Field Monitoring & Harvest ({progressUpdates.length} logs)
        </button>
        <button
          onClick={() => setActiveTab('inspection')}
          className={`pb-3 transition-colors ${
            activeTab === 'inspection'
              ? 'text-emerald-950 border-b-2 border-emerald-900 font-bold'
              : 'hover:text-neutral-900'
          }`}
        >
          2. Quality Inspection ({qualityInspection ? 'Completed' : 'Pending'})
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 transition-colors ${
            activeTab === 'delivery'
              ? 'text-emerald-950 border-b-2 border-emerald-900 font-bold'
              : 'hover:text-neutral-900'
          }`}
        >
          3. Delivery Reception ({delivery?.status || 'Scheduled'})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 transition-colors ${
            activeTab === 'payments'
              ? 'text-emerald-950 border-b-2 border-emerald-900 font-bold'
              : 'hover:text-neutral-900'
          }`}
        >
          4. Settlement Records ({payments.length})
        </button>
      </div>

      {/* TAB 1: Monitoring & Harvest */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Harvest Card if recorded */}
          {harvest && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-emerald-900" />
                  <h4 className="font-heading text-sm font-bold text-neutral-900">
                    Harvested Yield (Recorded by Farmer)
                  </h4>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Ready for Intake
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-500 block">Actual Harvested Yield</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {harvest.harvestedQuantityTons} metric tons
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Harvest Date</span>
                  <span className="font-bold text-neutral-900">
                    {new Date(harvest.harvestDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Field Moisture</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {harvest.moisturePercentage}%
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Reported Grade</span>
                  <span className="font-bold text-neutral-900">{harvest.measuredGrade}</span>
                </div>
              </div>

              <p className="text-xs text-neutral-600">
                <strong>Packaging & Storage:</strong> {harvest.packagingDetails} · {harvest.storageLocation}
              </p>
              {harvest.specialObservations && (
                <p className="text-xs text-neutral-600">
                  <strong>Farmer Observation:</strong> {harvest.specialObservations}
                </p>
              )}
            </div>
          )}

          {/* Farmer cultivation logs */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-bold text-neutral-900">
              Cultivation Progress Timeline
            </h3>

            {progressUpdates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
                Farmer has not posted any progress logs yet. Sowing or initial vegetative log is expected shortly.
              </div>
            ) : (
              progressUpdates.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                      <h4 className="text-xs font-bold text-neutral-900">{p.stageName}</h4>
                      <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {p.cropHealthRating}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 tabular-nums">
                      {new Date(p.recordedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed">{p.notes}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg">
                    <div>
                      <strong>Soil Condition:</strong> {p.soilCondition}
                    </div>
                    <div>
                      <strong>Pest Controls:</strong> {p.pestControlMeasures}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Quality Inspection */}
      {activeTab === 'inspection' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Buyer Quality Inspection & Lab Certification
              </h3>
              <p className="text-xs text-neutral-500">
                Record laboratory moisture content, foreign matter impurities, and official grade acceptance
              </p>
            </div>
            {!isRecordingInspection && relationship.lifecycleStage === 'harvested' && relationship.status === 'active' && (
              <button
                onClick={() => setIsRecordingInspection(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{qualityInspection ? 'Update Inspection' : 'Record Quality Inspection'}</span>
              </button>
            )}
          </div>

          {/* Form */}
          {isRecordingInspection && (
            <form
              onSubmit={handleSaveInspection}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Perform Quality Assessment
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Inspector / Agronomist Name
                  </label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Inspection Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(e: any) => setDecision(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  >
                    <option value="approved_grade_a">Approved — Grade A Premium</option>
                    <option value="approved_grade_b">Approved — Grade B Standard</option>
                    <option value="conditional_acceptance">Conditional Acceptance</option>
                    <option value="rejected">Rejected — Sub-Standard Consignment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tested Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measuredMoisture}
                    onChange={(e) => setMeasuredMoisture(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Foreign Matter / Dust (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measuredForeignMatter}
                    onChange={(e) => setMeasuredForeignMatter(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Lab Certificate Reference #
                  </label>
                  <input
                    type="text"
                    value={labCertificateNumber}
                    onChange={(e) => setLabCertificateNumber(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Quality Inspector Remarks
                </label>
                <textarea
                  rows={3}
                  value={inspectorRemarks}
                  onChange={(e) => setInspectorRemarks(e.target.value)}
                  placeholder="Detail moisture test results, aroma, grain length or vegetable firmness..."
                  className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 text-neutral-900"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRecordingInspection(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inspectionSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {inspectionSaving ? 'Saving...' : 'Save Inspection Certificate'}
                </button>
              </div>
            </form>
          )}

          {/* Current Inspection Certificate Display */}
          {qualityInspection ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-900" />
                  <h4 className="font-heading text-sm font-bold text-neutral-900">
                    Active Quality Grading Certificate
                  </h4>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    qualityInspection.decision.includes('approved')
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {qualityInspection.decision.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-neutral-500 block">Inspected By</span>
                  <span className="font-bold text-neutral-900">{qualityInspection.inspectorName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Moisture Tested</span>
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
                  <span className="text-neutral-500 block">Certificate #</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    {qualityInspection.labTestCertificateNumber || 'QC-OK'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-700 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                <strong>Remarks:</strong> {qualityInspection.inspectorRemarks}
              </p>
            </div>
          ) : (
            !isRecordingInspection && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500 space-y-2">
                <Scale className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="font-medium text-neutral-700">Quality inspection pending</p>
                <p>Record your inspection once the consignment or farm sample is tested.</p>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 3: Delivery Reception */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Consignment Intake & Delivery Confirmation
              </h3>
              <p className="text-xs text-neutral-500">
                Confirm truck arrival, verify weighbridge slips, and formalize consignment receipt
              </p>
            </div>
            {delivery?.status !== 'confirmed' && !isConfirmingDelivery && relationship.lifecycleStage === 'in_transit' && relationship.status === 'active' && (
              <button
                onClick={() => setIsConfirmingDelivery(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Consignment Receipt</span>
              </button>
            )}
          </div>

          {isConfirmingDelivery && (
            <form
              onSubmit={handleConfirmDelivery}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Confirm Warehouse Consignment Intake
              </h4>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Intake & Weighbridge Notes
                </label>
                <textarea
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Confirm gross weighment, net metric tons received, bag count..."
                  className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 text-neutral-900"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelivery(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deliveryConfirming}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {deliveryConfirming ? 'Confirming...' : 'Formalize Receipt'}
                </button>
              </div>
            </form>
          )}

          {/* Delivery Record View */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-900" />
                <h4 className="font-heading text-sm font-bold text-neutral-900">
                  Consignment Dispatch Record
                </h4>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {delivery?.status || 'Scheduled'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-neutral-500 block">Vehicle #</span>
                <span className="font-bold text-neutral-900">
                  {delivery?.vehicleRegistrationNumber || 'Awaiting Dispatch'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Transporter</span>
                <span className="font-bold text-neutral-900">
                  {delivery?.transporterName || 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Driver Phone</span>
                <span className="font-bold text-neutral-900">
                  {delivery?.driverContactPhone || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Waybill Number</span>
                <span className="font-bold text-neutral-900 font-mono">
                  {delivery?.consignmentWaybillNumber || 'N/A'}
                </span>
              </div>
            </div>

            <div className="text-xs text-neutral-600 space-y-1">
              <p>
                <strong>Delivery Warehouse:</strong> {delivery?.destinationWarehouse} (
                {delivery?.destinationAddress})
              </p>
              {delivery?.confirmedAt && (
                <p className="text-emerald-900 font-semibold">
                  Intake confirmed on: {new Date(delivery.confirmedAt).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Settlement Records */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Direct Banking Settlement Records
              </h3>
              <p className="text-xs text-neutral-500">
                Record banking RTGS/NEFT transaction references and settlement milestones
              </p>
            </div>
            {!isRecordingPayment && relationship.lifecycleStage === 'delivered' && relationship.status === 'active' && (
              <button
                onClick={() => setIsRecordingPayment(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Record Payment Entry</span>
              </button>
            )}
          </div>

          {/* Form to record payment */}
          {isRecordingPayment && (
            <form
              onSubmit={handleSavePayment}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Record Bank Payment Entry
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e: any) => setPaymentType(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  >
                    <option value="final_settlement">Final Settlement</option>
                    <option value="advance">Input Advance</option>
                    <option value="milestone">Cultivation Milestone</option>
                    <option value="full_lump_sum">Full Lump Sum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  >
                    <option value="NEFT / RTGS">NEFT / RTGS</option>
                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    <option value="Escrow Release">Escrow Release</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Bank UTR / Reference Number
                  </label>
                  <input
                    type="text"
                    value={bankRefNumber}
                    onChange={(e) => setBankRefNumber(e.target.value)}
                    placeholder="e.g. UTR202610148921"
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e: any) => setPaymentStatus(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 bg-white"
                  >
                    <option value="paid">Paid — Bank Transfer Complete</option>
                    <option value="processing">Processing in Bank Queue</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Accounting Remarks
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRecordingPayment(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {paymentSaving ? 'Saving...' : 'Record Payment Record'}
                </button>
              </div>
            </form>
          )}

          {/* Payment History */}
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
                  {p.notes && <p className="text-[11px] text-neutral-500">{p.notes}</p>}
                </div>

                <div className="text-right text-xs text-neutral-400 tabular-nums">
                  {p.paidAt
                    ? `Paid on ${new Date(p.paidAt).toLocaleDateString('en-IN')}`
                    : `Created on ${new Date(p.createdAt).toLocaleDateString('en-IN')}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
