import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export type DeliveryStatus = 'scheduled' | 'dispatched' | 'in_transit' | 'delivered' | 'confirmed';

export interface IDelivery extends MongoDoc {
  relationshipId: Types.ObjectId;
  farmerId: Types.ObjectId;
  buyerId: Types.ObjectId;
  destinationWarehouse: string;
  destinationAddress: string;
  dispatchDate?: Date;
  estimatedArrivalDate?: Date;
  vehicleRegistrationNumber: string;
  transporterName: string;
  driverContactPhone: string;
  consignmentWaybillNumber: string;
  deliveredQuantityTons: number;
  status: DeliveryStatus;
  statusNotes?: string;
  deliveredAt?: Date;
  confirmedAt?: Date;
  confirmedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    relationshipId: {
      type: Schema.Types.ObjectId,
      ref: 'ContractRelationship',
      required: true,
      unique: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destinationWarehouse: {
      type: String,
      required: true,
    },
    destinationAddress: {
      type: String,
      required: true,
    },
    dispatchDate: {
      type: Date,
    },
    estimatedArrivalDate: {
      type: Date,
    },
    vehicleRegistrationNumber: {
      type: String,
      default: '',
    },
    transporterName: {
      type: String,
      default: '',
    },
    driverContactPhone: {
      type: String,
      default: '',
    },
    consignmentWaybillNumber: {
      type: String,
      default: '',
    },
    deliveredQuantityTons: {
      type: Number,
      required: true,
      min: 0.1,
    },
    status: {
      type: String,
      enum: ['scheduled', 'dispatched', 'in_transit', 'delivered', 'confirmed'],
      default: 'scheduled',
      index: true,
    },
    statusNotes: {
      type: String,
      default: '',
    },
    deliveredAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    confirmedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Delivery =
  mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);
