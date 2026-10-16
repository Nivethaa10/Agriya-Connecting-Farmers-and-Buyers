import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export interface IFarmerProfile extends MongoDoc {
  userId: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    farmName: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      village: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
      max: 70,
    },
    farmSizeAcres: {
      type: Number,
      default: 0,
      min: 0,
    },
    soilType: {
      type: String,
      default: 'Alluvial Soil',
    },
    irrigationSource: {
      type: String,
      default: 'Drip Irrigation',
    },
    productionCapacityTons: {
      type: Number,
      default: 0,
      min: 0,
    },
    primaryCrops: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    documentStatus: {
      type: String,
      enum: ['not_uploaded', 'uploaded'],
      default: 'not_uploaded',
    },
  },
  {
    timestamps: true,
  }
);

export const FarmerProfile =
  mongoose.models.FarmerProfile || mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);
