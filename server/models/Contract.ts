import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export type ContractStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';

export interface IContract extends MongoDoc {
  buyerId: Types.ObjectId;
  title: string;
  cropName: string;
  cropVariety?: string;
  category: 'Cereals & Grains' | 'Pulses' | 'Oilseeds' | 'Vegetables' | 'Fruits' | 'Spices' | 'Cotton & Fiber' | 'Sugarcane & Cash Crops';
  quantityRequiredTons: number;
  minQuantityPerFarmerTons: number;
  allocatedQuantityTons: number;
  pricePerTon: number; // in INR ₹
  qualityStandards: {
    grade: string;
    maxMoisturePercent: number;
    maxForeignMatterPercent: number;
    specificationNotes: string;
  };
  cultivationStartDate: Date;
  expectedHarvestDate: Date;
  deliveryDeadline: Date;
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
  status: ContractStatus;
  isSample: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Contract title is required'],
      trim: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      index: true,
    },
    cropVariety: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'Cereals & Grains',
        'Pulses',
        'Oilseeds',
        'Vegetables',
        'Fruits',
        'Spices',
        'Cotton & Fiber',
        'Sugarcane & Cash Crops',
      ],
      required: true,
      index: true,
    },
    quantityRequiredTons: {
      type: Number,
      required: [true, 'Total quantity required is mandatory'],
      min: [0.1, 'Quantity must be at least 0.1 ton'],
    },
    minQuantityPerFarmerTons: {
      type: Number,
      default: 1,
      min: [0.1, 'Minimum quantity must be at least 0.1 ton'],
    },
    allocatedQuantityTons: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricePerTon: {
      type: Number,
      required: [true, 'Price per ton is mandatory'],
      min: [1, 'Price must be greater than 0'],
    },
    qualityStandards: {
      grade: { type: String, default: 'Grade A - Export / Premium Quality' },
      maxMoisturePercent: { type: Number, default: 12 },
      maxForeignMatterPercent: { type: Number, default: 1.5 },
      specificationNotes: { type: String, default: '' },
    },
    cultivationStartDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      required: true,
    },
    deliveryDeadline: {
      type: Date,
      required: true,
    },
    deliveryLocation: {
      facilityName: { type: String, required: true },
      state: { type: String, required: true },
      district: { type: String, required: true },
      address: { type: String, required: true },
    },
    paymentTerms: {
      advancePercentage: { type: Number, default: 20 },
      onDeliveryPercentage: { type: Number, default: 80 },
      settlementDays: { type: Number, default: 7 },
      notes: { type: String, default: 'Direct RTGS/Bank Transfer upon inspection approval.' },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    isSample: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ContractSchema.index({ status: 1, cropName: 1, category: 1, createdAt: -1 });

export const Contract =
  mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
