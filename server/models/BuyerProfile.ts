import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export type BuyerVerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';
export type BuyerDocumentStatus = 'not_uploaded' | 'uploaded';

export interface IBuyerProfile extends MongoDoc {
  userId: Types.ObjectId;
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
  verificationStatus: BuyerVerificationStatus;
  documentStatus: BuyerDocumentStatus;
  verificationNotes?: string;
  verificationRequestedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BuyerProfileSchema = new Schema<IBuyerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company / Organization name is required'],
      trim: true,
    },
    businessType: {
      type: String,
      enum: [
        'Agri Processing & Milling',
        'Wholesaler / Exporter',
        'Supermarket Retail Chain',
        'FMCG Food Manufacturer',
        'Farmers Producer Org / Cooperative',
        'Seed & Grain Trading House',
        'Contract Farming Integrator',
        'Other Institutional Buyer',
      ],
      default: 'Agri Processing & Milling',
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    gstNumber: {
      type: String,
      trim: true,
      default: '',
    },
    panNumber: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      state: { type: String, default: '' },
      city: { type: String, default: '' },
      street: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    contactPerson: {
      name: { type: String, default: '' },
      designation: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    procurementInterests: {
      type: [String],
      default: [],
    },
    annualProcurementBudget: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'not_submitted',
      index: true,
    },
    documentStatus: {
      type: String,
      enum: ['not_uploaded', 'uploaded'],
      default: 'not_uploaded',
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    verificationRequestedAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const BuyerProfile =
  mongoose.models.BuyerProfile || mongoose.model<IBuyerProfile>('BuyerProfile', BuyerProfileSchema);
