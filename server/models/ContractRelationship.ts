import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export type LifecycleStage =
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

export type RelationshipStatus = 'active' | 'completed' | 'disputed';

export interface IContractRelationship extends MongoDoc {
  contractId: Types.ObjectId;
  applicationId: Types.ObjectId;
  farmerId: Types.ObjectId;
  buyerId: Types.ObjectId;
  cropName: string;
  agreedQuantityTons: number;
  agreedPricePerTon: number;
  totalAgreedValue: number;
  lifecycleStage: LifecycleStage;
  progressPercentage: number;
  status: RelationshipStatus;
  statusReason?: string;
  activatedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractRelationshipSchema = new Schema<IContractRelationship>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
      index: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
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
    cropName: {
      type: String,
      required: true,
    },
    agreedQuantityTons: {
      type: Number,
      required: true,
      min: 0.1,
    },
    agreedPricePerTon: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAgreedValue: {
      type: Number,
      required: true,
    },
    lifecycleStage: {
      type: String,
      enum: [
        'sowing',
        'vegetative',
        'flowering_fruiting',
        'mature_harvest_ready',
        'harvested',
        'quality_inspected',
        'dispatch_scheduled',
        'in_transit',
        'delivered',
        'completed',
      ],
      default: 'sowing',
    },
    progressPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'disputed'],
      default: 'active',
      index: true,
    },
    statusReason: {
      type: String,
      default: '',
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ContractRelationship =
  mongoose.models.ContractRelationship ||
  mongoose.model<IContractRelationship>('ContractRelationship', ContractRelationshipSchema);
