export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'buyer' | 'admin';
  isActive: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface FarmerProfile {
  _id?: string;
  userId: string;
  farmName?: string;
  location: {
    state: string;
    district: string;
    village: string;
    pincode: string;
  };
  experienceYears: number;
  farmSizeAcres: number;
  soilType: string;
  irrigationSource: string;
  productionCapacityTons: number;
  primaryCrops: string[];
  certifications?: string[];
  bio?: string;
  documentStatus: 'not_uploaded' | 'uploaded';
}

export interface BuyerProfile {
  _id?: string;
  userId: string;
  companyName: string;
  businessType: string;
  registrationNumber: string;
  gstNumber?: string;
  panNumber?: string;
  address: {
    state: string;
    city: string;
    street: string;
    pincode: string;
  };
  contactPerson: {
    name: string;
    designation: string;
    phone: string;
    email: string;
  };
  procurementInterests: string[];
  annualProcurementBudget?: number;
  verificationStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  documentStatus: 'not_uploaded' | 'uploaded';
  verificationNotes?: string;
  verificationRequestedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Contract {
  _id: string;
  buyerId: any;
  title: string;
  cropName: string;
  cropVariety?: string;
  category: string;
  quantityRequiredTons: number;
  minQuantityPerFarmerTons: number;
  allocatedQuantityTons: number;
  pricePerTon: number;
  qualityStandards: {
    grade: string;
    maxMoisturePercent: number;
    maxForeignMatterPercent: number;
    specificationNotes: string;
  };
  cultivationStartDate: string;
  expectedHarvestDate: string;
  deliveryDeadline: string;
  deliveryLocation: {
    facilityName: string;
    state: string;
    district: string;
    address: string;
  };
  paymentTerms: {
    advancePercentage: number;
    onDeliveryPercentage: number;
    settlementDays: number;
    notes: string;
  };
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  isSample?: boolean;
  publishedAt?: string;
  createdAt: string;
  totalApplications?: number;
  approvedApplications?: number;
}

export interface Application {
  _id: string;
  contractId: any;
  farmerId: any;
  buyerId: any;
  quantityOfferedTons: number;
  expectedHarvestDate: string;
  expectedDeliveryDate: string;
  farmerNotes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  farmerProfile?: FarmerProfile;
  farmerDocuments?: DocumentItem[];
}

export interface ContractRelationship {
  _id: string;
  contractId: any;
  applicationId: any;
  farmerId: any;
  buyerId: any;
  cropName: string;
  agreedQuantityTons: number;
  agreedPricePerTon: number;
  totalAgreedValue: number;
  lifecycleStage:
    | 'sowing'
    | 'vegetative'
    | 'flowering_fruiting'
    | 'mature_harvest_ready'
    | 'harvested'
    | 'quality_inspected'
    | 'dispatch_scheduled'
    | 'in_transit'
    | 'delivered'
    | 'completed';
  progressPercentage: number;
  status: 'active' | 'completed' | 'disputed';
  statusReason?: string;
  activatedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUpdate {
  _id: string;
  relationshipId: string;
  farmerId: string;
  stageName: string;
  progressPercentage: number;
  soilCondition: string;
  irrigationStatus: string;
  fertilizerOrNutrientsApplied?: string;
  pestControlMeasures?: string;
  cropHealthRating: 'excellent' | 'good' | 'moderate' | 'attention_needed';
  notes: string;
  recordedAt: string;
}

export interface Harvest {
  _id: string;
  relationshipId: string;
  farmerId: string;
  harvestDate: string;
  harvestedQuantityTons: number;
  measuredGrade: string;
  moisturePercentage: number;
  packagingDetails: string;
  storageLocation: string;
  specialObservations?: string;
  recordedAt: string;
}

export interface QualityInspection {
  _id: string;
  relationshipId: string;
  buyerId: string;
  inspectorName: string;
  inspectionDate: string;
  decision: 'approved_grade_a' | 'approved_grade_b' | 'conditional_acceptance' | 'rejected';
  measuredMoisturePercent: number;
  measuredForeignMatterPercent: number;
  labTestCertificateNumber?: string;
  inspectorRemarks: string;
  acceptancePriceAdjustmentPercent: number;
  inspectedAt: string;
}

export interface Delivery {
  _id: string;
  relationshipId: string;
  farmerId: string;
  buyerId: string;
  destinationWarehouse: string;
  destinationAddress: string;
  dispatchDate?: string;
  estimatedArrivalDate?: string;
  vehicleRegistrationNumber: string;
  transporterName: string;
  driverContactPhone: string;
  consignmentWaybillNumber: string;
  deliveredQuantityTons: number;
  status: 'scheduled' | 'dispatched' | 'in_transit' | 'delivered' | 'confirmed';
  statusNotes?: string;
  deliveredAt?: string;
  confirmedAt?: string;
}

export interface Payment {
  _id: string;
  relationshipId: string;
  farmerId: string;
  buyerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paymentType: 'advance' | 'milestone' | 'final_settlement' | 'full_lump_sum';
  paymentMethod: string;
  bankReferenceNumber?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface DocumentItem {
  _id: string;
  userId: string;
  docType: string;
  title: string;
  originalName: string;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  userId: any;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminResponse?: string;
  resolvedAt?: string;
  createdAt: string;
}
