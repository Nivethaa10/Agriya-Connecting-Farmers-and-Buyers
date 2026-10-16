import mongoose, { Schema, Document as MongoDoc, Types } from 'mongoose';

export interface IDocument extends MongoDoc {
  userId: Types.ObjectId;
  docType:
    | 'land_records'
    | 'aadhaar_id'
    | 'bank_passbook'
    | 'soil_test_report'
    | 'gst_certificate'
    | 'company_incorporation'
    | 'trade_license'
    | 'fssai_license'
    | 'quality_spec_sheet'
    | 'contract_agreement'
    | 'other';
  title: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileMimeType: string;
  fileSizeBytes: number;
  uploadedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    docType: {
      type: String,
      enum: [
        'land_records',
        'aadhaar_id',
        'bank_passbook',
        'soil_test_report',
        'gst_certificate',
        'company_incorporation',
        'trade_license',
        'fssai_license',
        'quality_spec_sheet',
        'contract_agreement',
        'other',
      ],
      default: 'other',
    },
    title: {
      type: String,
      trim: true,
      default: 'Uploaded Document',
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileMimeType: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
