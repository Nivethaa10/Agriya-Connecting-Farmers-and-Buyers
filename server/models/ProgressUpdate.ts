import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export interface IProgressUpdate extends MongoDoc {
  relationshipId: Types.ObjectId;
  farmerId: Types.ObjectId;
  stageName: string;
  progressPercentage: number;
  soilCondition: string;
  irrigationStatus: string;
  fertilizerOrNutrientsApplied?: string;
  pestControlMeasures?: string;
  cropHealthRating: 'excellent' | 'good' | 'moderate' | 'attention_needed';
  notes: string;
  recordedAt: Date;
}

const ProgressUpdateSchema = new Schema<IProgressUpdate>(
  {
    relationshipId: {
      type: Schema.Types.ObjectId,
      ref: 'ContractRelationship',
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stageName: {
      type: String,
      required: true,
    },
    progressPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    soilCondition: {
      type: String,
      default: 'Optimal moisture and tilth',
    },
    irrigationStatus: {
      type: String,
      default: 'Regular drip schedule maintained',
    },
    fertilizerOrNutrientsApplied: {
      type: String,
      default: '',
    },
    pestControlMeasures: {
      type: String,
      default: 'Organic neem formulation applied / No critical pests detected',
    },
    cropHealthRating: {
      type: String,
      enum: ['excellent', 'good', 'moderate', 'attention_needed'],
      default: 'excellent',
    },
    notes: {
      type: String,
      required: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ProgressUpdate =
  mongoose.models.ProgressUpdate ||
  mongoose.model<IProgressUpdate>('ProgressUpdate', ProgressUpdateSchema);
