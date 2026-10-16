import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface ISupportRequest extends MongoDoc {
  userId: Types.ObjectId;
  subject: string;
  category: 'contract_inquiry' | 'payment_issue' | 'crop_dispute' | 'verification_query' | 'technical_support' | 'other';
  message: string;
  status: SupportStatus;
  adminResponse?: string;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupportRequestSchema = new Schema<ISupportRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is mandatory'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['contract_inquiry', 'payment_issue', 'crop_dispute', 'verification_query', 'technical_support', 'other'],
      default: 'contract_inquiry',
    },
    message: {
      type: String,
      required: [true, 'Message description is mandatory'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    adminResponse: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const SupportRequest =
  mongoose.models.SupportRequest || mongoose.model<ISupportRequest>('SupportRequest', SupportRequestSchema);
