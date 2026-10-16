import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface IApplication extends MongoDoc {
  contractId: Types.ObjectId;
  farmerId: Types.ObjectId;
  buyerId: Types.ObjectId;
  quantityOfferedTons: number;
  expectedHarvestDate: Date;
  expectedDeliveryDate: Date;
  farmerNotes?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quantityOfferedTons: {
      type: Number,
      required: [true, 'Quantity offered is mandatory'],
      min: [0.1, 'Offered quantity must be at least 0.1 ton'],
    },
    expectedHarvestDate: {
      type: Date,
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    farmerNotes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to strictly prevent duplicate applications by the same farmer to the same contract
ApplicationSchema.index({ contractId: 1, farmerId: 1 }, { unique: true });

export const Application =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
