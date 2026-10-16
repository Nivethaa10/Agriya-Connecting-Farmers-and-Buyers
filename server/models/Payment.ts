import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface IPayment extends MongoDoc {
  relationshipId: Types.ObjectId;
  farmerId: Types.ObjectId;
  buyerId: Types.ObjectId;
  amount: number; // in INR ₹
  currency: string;
  status: PaymentStatus;
  paymentType: 'advance' | 'milestone' | 'final_settlement' | 'full_lump_sum';
  paymentMethod: 'NEFT / RTGS' | 'Direct Bank Transfer' | 'Escrow Release' | 'Cheque' | 'Demand Draft';
  bankReferenceNumber?: string;
  paidAt?: Date;
  notes?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
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
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentType: {
      type: String,
      enum: ['advance', 'milestone', 'final_settlement', 'full_lump_sum'],
      default: 'final_settlement',
    },
    paymentMethod: {
      type: String,
      enum: ['NEFT / RTGS', 'Direct Bank Transfer', 'Escrow Release', 'Cheque', 'Demand Draft'],
      default: 'Direct Bank Transfer',
    },
    bankReferenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
