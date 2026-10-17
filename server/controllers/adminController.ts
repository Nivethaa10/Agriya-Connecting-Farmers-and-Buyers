import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { User } from '../models/User.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { BuyerProfile } from '../models/BuyerProfile.ts';
import { Contract } from '../models/Contract.ts';
import { Application } from '../models/Application.ts';
import { ContractRelationship } from '../models/ContractRelationship.ts';
import { Payment } from '../models/Payment.ts';
import { SupportRequest } from '../models/SupportRequest.ts';
import { AuditLog } from '../models/AuditLog.ts';
import { Notification } from '../models/Notification.ts';
import { DocumentModel } from '../models/Document.ts';
import { ProgressUpdate } from '../models/ProgressUpdate.ts';

export async function getAdminDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      verifiedBuyers,
      pendingVerifications,
      totalContracts,
      publishedContracts,
      activeRelationships,
      completedRelationships,
      disputedRelationships,
      totalApplications,
      openSupportTickets,
      payments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'buyer' }),
      BuyerProfile.countDocuments({ verificationStatus: 'verified' }),
      BuyerProfile.countDocuments({ verificationStatus: 'pending' }),
      Contract.countDocuments(),
      Contract.countDocuments({ status: 'published' }),
      ContractRelationship.countDocuments({ status: 'active' }),
      ContractRelationship.countDocuments({ status: 'completed' }),
      ContractRelationship.countDocuments({ status: 'disputed' }),
      Application.countDocuments(),
      SupportRequest.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Payment.find(),
    ]);

    const totalTradeVolume = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const paidTradeVolume = payments
      .filter((p) => p.status === 'paid')
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const recentPendingVerifications = await BuyerProfile.find({ verificationStatus: 'pending' })
      .populate('userId', 'name email phone createdAt')
      .sort({ verificationRequestedAt: -1 })
      .limit(5);

    const recentAuditLogs = await AuditLog.find()
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFarmers,
        totalBuyers,
        verifiedBuyers,
        pendingVerifications,
        totalContracts,
        publishedContracts,
        activeRelationships,
        completedRelationships,
        disputedRelationships,
        totalApplications,
        openSupportTickets,
        totalTradeVolumeINR: totalTradeVolume,
        paidTradeVolumeINR: paidTradeVolume,
      },
      recentPendingVerifications,
      recentAuditLogs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const { role, search, status, page = 1, limit = 15 } = req.query;

    const query: any = {};
    if (role && role !== 'all') query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search) {
      const regex = new RegExp(String(search).trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      User.countDocuments(query),
    ]);

    // Attach profile summaries
    const enhancedUsers = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === 'farmer') {
          profile = await FarmerProfile.findOne({ userId: u._id }).select('farmSizeAcres soilType location');
        } else if (u.role === 'buyer') {
          profile = await BuyerProfile.findOne({ userId: u._id }).select('companyName businessType verificationStatus');
        }
        return {
          ...u.toObject(),
          profile,
        };
      })
    );

    return res.status(200).json({
      success: true,
      users: enhancedUsers,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = req.user!._id;
    const { id } = req.params;
    const { isActive, reason } = req.body;

    if (id === adminId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot deactivate your own administrative account.',
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    targetUser.isActive = Boolean(isActive);
    await targetUser.save();

    await AuditLog.create({
      action: targetUser.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      performedBy: adminId,
      targetId: id,
      targetType: 'User',
      details: {
        targetEmail: targetUser.email,
        targetRole: targetUser.role,
        reason: reason || 'Administrative status change',
      },
    });

    return res.status(200).json({
      success: true,
      message: `User account has been ${targetUser.isActive ? 'activated' : 'deactivated'}.`,
      user: targetUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBuyerVerifications(req: AuthenticatedRequest, res: Response) {
  try {
    const { status = 'all' } = req.query;
    const query: any = {};
    if (status !== 'all') {
      query.verificationStatus = status;
    }

    const profiles = await BuyerProfile.find(query)
      .populate('userId', 'name email phone createdAt isActive')
      .populate('verifiedBy', 'name email')
      .sort({ verificationRequestedAt: -1, createdAt: -1 });

    // Attach documents for each buyer profile
    const enhancedProfiles = await Promise.all(
      profiles.map(async (p) => {
        const documents = await DocumentModel.find({ userId: p.userId?._id });
        return {
          ...p.toObject(),
          documents,
        };
      })
    );

    return res.status(200).json({ success: true, verificationRequests: enhancedProfiles });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function reviewBuyerVerification(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = req.user!._id;
    const { id } = req.params; // buyer profile id
    const { decision, reason } = req.body;

    if (!decision || (decision !== 'verified' && decision !== 'rejected')) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "verified" or "rejected".',
      });
    }

    if (decision === 'rejected' && (!reason || !reason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory to guide the buyer for resubmission.',
      });
    }

    const profile = await BuyerProfile.findById(id).populate('userId');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Buyer profile not found' });
    }

    profile.verificationStatus = decision;
    profile.verificationNotes = reason || (decision === 'verified' ? 'Identity and legal documents verified by administrator.' : 'Verification declined.');
    profile.verifiedAt = new Date();
    profile.verifiedBy = adminId;
    await profile.save();

    // Audit log
    await AuditLog.create({
      action: decision === 'verified' ? 'BUYER_VERIFIED' : 'BUYER_REJECTED',
      performedBy: adminId,
      targetId: id,
      targetType: 'BuyerProfile',
      details: {
        companyName: profile.companyName,
        buyerUserId: profile.userId?._id,
        reason: reason || 'Administrator review completed',
      },
    });

    // Notify buyer
    await Notification.create({
      userId: profile.userId._id,
      title: decision === 'verified' ? 'Business Verification Approved!' : 'Business Verification Declined',
      message:
        decision === 'verified'
          ? 'Your business verification has been approved by AGRIYA admin. You are now authorized to publish contracts and engage with farmers.'
          : `Your business verification was declined. Reason: ${reason}. You may correct your details/documents and resubmit.`,
      type: 'verification',
      link: '/buyer/profile',
    });

    return res.status(200).json({
      success: true,
      message: `Buyer profile has been marked as ${decision}.`,
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllContractsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      const regex = new RegExp(String(search).trim(), 'i');
      query.$or = [{ title: regex }, { cropName: regex }, { category: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * pageSize;

    const [contracts, total] = await Promise.all([
      Contract.find(query)
        .populate('buyerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Contract.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      contracts,
      pagination: { total, page: pageNum, totalPages: Math.ceil(total / pageSize), limit: pageSize },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllActiveContractsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const relationships = await ContractRelationship.find()
      .populate('farmerId', 'name email phone')
      .populate('buyerId', 'name email phone')
      .populate('contractId')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, relationships });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllSupportRequestsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;

    const tickets = await SupportRequest.find(query)
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, tickets });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateSupportTicketAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = req.user!._id;
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const ticket = await SupportRequest.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = adminId;
    }
    await ticket.save();

    // Notify ticket owner
    await Notification.create({
      userId: ticket.userId,
      title: `Support Ticket Updated: ${ticket.subject}`,
      message: `Admin response: ${adminResponse || 'Status changed to ' + ticket.status}`,
      type: 'system',
    });

    return res.status(200).json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAdminReports(req: AuthenticatedRequest, res: Response) {
  try {
    const [contractsByCrop, contractsByStatus, paymentsByStatus, relationshipsByStage] =
      await Promise.all([
        Contract.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 }, totalTons: { $sum: '$quantityRequiredTons' } } },
          { $sort: { count: -1 } },
        ]),
        Contract.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Payment.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
        ]),
        ContractRelationship.aggregate([
          { $group: { _id: '$lifecycleStage', count: { $sum: 1 } } },
        ]),
      ]);

    return res.status(200).json({
      success: true,
      reports: {
        contractsByCategory: contractsByCrop,
        contractsByStatus,
        paymentsByStatus,
        relationshipsByStage,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAdminReportDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const { type, value } = req.query;
    if (typeof value !== 'string' || !value.trim() || value.length > 120) {
      return res.status(400).json({ success: false, message: 'A report filter value is required.' });
    }

    if (type === 'contractCategory' || type === 'contractStatus') {
      const filter = type === 'contractCategory' ? { category: value } : { status: value };
      const contracts = await Contract.find(filter)
        .populate('buyerId', 'name')
        .sort({ createdAt: -1 });
      const buyerIds = contracts.map((contract) => contract.buyerId?._id).filter(Boolean);
      const buyerProfiles = await BuyerProfile.find({ userId: { $in: buyerIds } })
        .select('userId companyName')
        .lean();
      const organizationByBuyerId = new Map(
        buyerProfiles.map((profile) => [String(profile.userId), profile.companyName])
      );
      const records = contracts.map((contract) => {
        const record = contract.toObject();
        const buyer =
          record.buyerId && typeof record.buyerId === 'object' && 'name' in record.buyerId
            ? record.buyerId
            : null;
        const buyerId = buyer && '_id' in buyer ? String(buyer._id) : '';
        const buyerName = buyer && typeof buyer.name === 'string' ? buyer.name : 'Unknown buyer';
        return {
          ...record,
          buyerName,
          buyerOrganization: buyer
            ? organizationByBuyerId.get(buyerId) || buyerName
            : 'Unknown organization',
        };
      });

      return res.status(200).json({
        success: true,
        type,
        value,
        count: records.length,
        totalTons: records.reduce((total, contract) => total + contract.quantityRequiredTons, 0),
        records,
      });
    }

    if (type === 'paymentStatus') {
      if (!['pending', 'processing', 'paid', 'failed'].includes(value)) {
        return res.status(400).json({ success: false, message: 'Unsupported payment report filter.' });
      }

      const records = await Payment.find({ status: value })
        .populate('farmerId', 'name')
        .populate('buyerId', 'name')
        .populate({
          path: 'relationshipId',
          populate: [
            { path: 'contractId', select: 'title cropName' },
            { path: 'farmerId', select: 'name' },
            { path: 'buyerId', select: 'name' },
          ],
        })
        .sort({ createdAt: -1 });
      const totalAmount = records.reduce((total, payment) => total + payment.amount, 0);
      return res.status(200).json({
        success: true,
        type,
        value,
        count: records.length,
        totalAmount,
        records,
      });
    }

    if (type === 'lifecycleStage') {
      const allowedStages = [
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
      ];
      if (!allowedStages.includes(value)) {
        return res.status(400).json({ success: false, message: 'Unsupported lifecycle report filter.' });
      }

      const relationships = await ContractRelationship.find({ lifecycleStage: value })
        .populate('contractId', 'title cropName category')
        .populate('farmerId', 'name')
        .populate('buyerId', 'name')
        .sort({ updatedAt: -1 });
      const relationshipIds = relationships.map((relationship) => relationship._id);
      const progressUpdates = await ProgressUpdate.find({ relationshipId: { $in: relationshipIds } })
        .sort({ recordedAt: -1 })
        .lean();
      const latestProgressByRelationship = new Map<string, (typeof progressUpdates)[number]>();
      for (const progress of progressUpdates) {
        const relationshipId = String(progress.relationshipId);
        if (!latestProgressByRelationship.has(relationshipId)) {
          latestProgressByRelationship.set(relationshipId, progress);
        }
      }
      const records = relationships.map((relationship) => ({
        ...relationship.toObject(),
        latestProgress: latestProgressByRelationship.get(String(relationship._id)) || null,
      }));

      return res.status(200).json({ success: true, type, value, count: records.length, records });
    }

    return res.status(400).json({ success: false, message: 'Unsupported report detail type.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAdminAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(50);

    return res.status(200).json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
