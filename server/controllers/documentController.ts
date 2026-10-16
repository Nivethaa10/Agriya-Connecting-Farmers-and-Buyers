import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { DocumentModel } from '../models/Document.ts';
import { BuyerProfile } from '../models/BuyerProfile.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';

export async function uploadDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided. Please upload a PDF, PNG, JPG, or JPEG document.',
      });
    }

    const { docType = 'other', title } = req.body;

    const document = await DocumentModel.create({
      userId,
      docType,
      title: title || file.originalname,
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileMimeType: file.mimetype,
      fileSizeBytes: file.size,
      uploadedAt: new Date(),
    });

    // Update profile document status
    if (req.user!.role === 'buyer') {
      await BuyerProfile.findOneAndUpdate({ userId }, { documentStatus: 'uploaded' });
    } else if (req.user!.role === 'farmer') {
      await FarmerProfile.findOneAndUpdate({ userId }, { documentStatus: 'uploaded' });
    }

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and registered successfully!',
      document,
    });
  } catch (err: any) {
    // Cleanup file if DB insert failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMyDocuments(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const documents = await DocumentModel.find({ userId }).sort({ uploadedAt: -1 });
    return res.status(200).json({ success: true, documents });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUserDocuments(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const requester = req.user!;

    // Security check: Only Admin, the user themselves, or authorized counter-party can view
    const isOwner = requester._id.toString() === userId;
    const isAdmin = requester.role === 'admin';
    const isBuyerCheckingFarmer = requester.role === 'buyer';

    if (!isOwner && !isAdmin && !isBuyerCheckingFarmer) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this user documents.',
      });
    }

    const documents = await DocumentModel.find({ userId }).sort({ uploadedAt: -1 });
    return res.status(200).json({ success: true, documents });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function downloadDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const requester = req.user!;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Access control
    const isOwner = requester._id.toString() === document.userId.toString();
    const isAdmin = requester.role === 'admin';
    const isBuyer = requester.role === 'buyer';

    if (!isOwner && !isAdmin && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to confidential document.',
      });
    }

    const resolvedPath = path.resolve(document.filePath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: 'File not found on storage server' });
    }

    res.setHeader('Content-Type', document.fileMimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.originalName)}"`);
    return res.sendFile(resolvedPath);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const requester = req.user!;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Only owner or admin can delete
    if (requester._id.toString() !== document.userId.toString() && requester.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this document.',
      });
    }

    // Delete file from disk
    const resolvedPath = path.resolve(document.filePath);
    if (fs.existsSync(resolvedPath)) {
      try {
        fs.unlinkSync(resolvedPath);
      } catch (e) {
        console.warn('File unlink error:', e);
      }
    }

    // Delete DB record
    await DocumentModel.findByIdAndDelete(id);

    // Check remaining docs
    const remaining = await DocumentModel.countDocuments({ userId: document.userId });
    if (remaining === 0) {
      if (requester.role === 'buyer') {
        await BuyerProfile.findOneAndUpdate({ userId: document.userId }, { documentStatus: 'not_uploaded' });
      } else if (requester.role === 'farmer') {
        await FarmerProfile.findOneAndUpdate({ userId: document.userId }, { documentStatus: 'not_uploaded' });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Document and storage file deleted successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
