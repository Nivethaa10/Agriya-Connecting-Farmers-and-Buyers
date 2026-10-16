import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export interface IHarvest extends MongoDoc {
  relationshipId: Types.ObjectId;
  farmerId: Types.ObjectId;
  harvestDate: Date;
  harvestedQuantityTons: number;
  measuredGrade: string;
  moisturePercentage: number;
  packagingDetails: string;
  storageLocation: string;
  specialObservations?: string;
  recordedAt: Date;
}

const HarvestSchema = new Schema<IHarvest>(
  {
    relationshipId: {
      type: Schema.Types.ObjectId,
      ref: 'ContractRelationship',
      required: true,
      unique: true, // One harvest record per relationship
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    harvestDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    harvestedQuantityTons: {
      type: Number,
      required: true,
      min: 0.1,
    },
    measuredGrade: {
      type: String,
      default: 'Grade A1 Premium',
    },
    moisturePercentage: {
      type: Number,
      required: true,
      default: 11.5,
    },
    packagingDetails: {
      type: String,
      default: '50kg food-grade jute bags with tamper tags',
    },
    storageLocation: {
      type: String,
      default: 'On-farm ventilated warehouse depot',
    },
    specialObservations: {
      type: String,
      default: '',
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

export const Harvest =
  mongoose.models.Harvest || mongoose.model<IHarvest>('Harvest', HarvestSchema);
