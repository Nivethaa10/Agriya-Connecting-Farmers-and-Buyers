import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export type InspectionDecision =
  | 'approved_grade_a'
  | 'approved_grade_b'
  | 'conditional_acceptance'
  | 'rejected';

export interface IQualityInspection extends MongoDoc {
  relationshipId: Types.ObjectId;
  buyerId: Types.ObjectId;
  inspectorName: string;
  inspectionDate: Date;
  decision: InspectionDecision;
  measuredMoisturePercent: number;
  measuredForeignMatterPercent: number;
  labTestCertificateNumber?: string;
  inspectorRemarks: string;
  acceptancePriceAdjustmentPercent: number;
  inspectedAt: Date;
}

const QualityInspectionSchema = new Schema<IQualityInspection>(
  {
    relationshipId: {
      type: Schema.Types.ObjectId,
      ref: 'ContractRelationship',
      required: true,
      unique: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inspectorName: {
      type: String,
      required: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    decision: {
      type: String,
      enum: ['approved_grade_a', 'approved_grade_b', 'conditional_acceptance', 'rejected'],
      required: true,
    },
    measuredMoisturePercent: {
      type: Number,
      required: true,
    },
    measuredForeignMatterPercent: {
      type: Number,
      required: true,
    },
    labTestCertificateNumber: {
      type: String,
      default: '',
    },
    inspectorRemarks: {
      type: String,
      required: true,
    },
    acceptancePriceAdjustmentPercent: {
      type: Number,
      default: 0,
    },
    inspectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const QualityInspection =
  mongoose.models.QualityInspection ||
  mongoose.model<IQualityInspection>('QualityInspection', QualityInspectionSchema);
