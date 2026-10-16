import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export interface INotification extends MongoDoc {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'verification' | 'contract' | 'application' | 'progress' | 'delivery' | 'payment' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['verification', 'contract', 'application', 'progress', 'delivery', 'payment', 'system'],
      default: 'system',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
