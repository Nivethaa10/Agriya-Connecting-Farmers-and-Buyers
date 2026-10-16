import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { BuyerProfile } from '../models/BuyerProfile.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { Contract } from '../models/Contract.ts';
import { Application } from '../models/Application.ts';
import { ContractRelationship } from '../models/ContractRelationship.ts';
import { ProgressUpdate } from '../models/ProgressUpdate.ts';
import { Harvest } from '../models/Harvest.ts';
import { QualityInspection } from '../models/QualityInspection.ts';
import { Delivery } from '../models/Delivery.ts';
import { Payment } from '../models/Payment.ts';
import { Notification } from '../models/Notification.ts';
import { DocumentModel } from '../models/Document.ts';
import { User } from '../models/User.ts';

export async function getBuyerProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    let profile = await BuyerProfile.findOne({ userId: buyerId });
    if (!profile) {
      profile = await BuyerProfile.create({
        userId: buyerId,
        companyName: `${req.user!.name} Procurement Corp`,
      });
    }

    // Check if documents are uploaded
    const docsCount = await DocumentModel.countDocuments({ userId: buyerId });
    if (docsCount > 0 && profile.documentStatus !== 'uploaded') {
      profile.documentStatus = 'uploaded';
      await profile.save();
    } else if (docsCount === 0 && profile.documentStatus !== 'not_uploaded') {
      profile.documentStatus = 'not_uploaded';
      await profile.save();
    }

    return res.status(200).json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateBuyerProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const {
      companyName,
      businessType,
      registrationNumber,
      gstNumber,
      panNumber,
      address,
      contactPerson,
      procurementInterests,
      annualProcurementBudget,
    } = req.body;

    let profile = await BuyerProfile.findOne({ userId: buyerId });
    if (!profile) {
      profile = new BuyerProfile({ userId: buyerId, companyName: companyName || req.user!.name });
    }

    if (companyName) profile.companyName = companyName;
    if (businessType) profile.businessType = businessType;
    if (registrationNumber !== undefined) profile.registrationNumber = registrationNumber;
    if (gstNumber !== undefined) profile.gstNumber = gstNumber;
    if (panNumber !== undefined) profile.panNumber = panNumber;
    if (address) profile.address = { ...profile.address, ...address };
    if (contactPerson) profile.contactPerson = { ...profile.contactPerson, ...contactPerson };
    if (procurementInterests) profile.procurementInterests = procurementInterests;
    if (annualProcurementBudget !== undefined)
      profile.annualProcurementBudget = Number(annualProcurementBudget);

    await profile.save();
    return res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function requestBuyerVerification(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const profile = await BuyerProfile.findOne({ userId: buyerId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Buyer profile not found' });
    }

    if (profile.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Your account is already verified.',
      });
    }

    if (profile.verificationStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Your verification request is already pending administrator review.',
      });
    }

    // Check mandatory business details
    if (!profile.companyName || !profile.registrationNumber || !profile.address?.state) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your company name, registration number, and address before requesting verification.',
      });
    }

    // Check if required document is uploaded
    const uploadedDocs = await DocumentModel.countDocuments({ userId: buyerId });
    if (uploadedDocs === 0) {
      return res.status(400).json({
        success: false,
        message: 'You must upload at least one verification document (e.g., GST Certificate, Incorporation, or Trade License) before requesting verification.',
      });
    }

    profile.verificationStatus = 'pending';
    profile.verificationRequestedAt = new Date();
    profile.verificationNotes = 'Verification requested by buyer. Pending administrator audit.';
    await profile.save();

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: 'New Buyer Verification Request',
        message: `Buyer "${profile.companyName}" has requested business verification.`,
        type: 'verification',
        link: '/admin/verifications',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification request submitted successfully. AGRIYA administrators will review your credentials.',
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBuyerDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;

    const [
      profile,
      totalContracts,
      publishedContracts,
      draftContracts,
      activeRelationships,
      pendingApplications,
      relationships,
    ] = await Promise.all([
      BuyerProfile.findOne({ userId: buyerId }),
      Contract.countDocuments({ buyerId }),
      Contract.countDocuments({ buyerId, status: 'published' }),
      Contract.countDocuments({ buyerId, status: 'draft' }),
      ContractRelationship.countDocuments({ buyerId, status: 'active' }),
      Application.countDocuments({ buyerId, status: 'pending' }),
      ContractRelationship.find({ buyerId }),
    ]);

    const totalCommittedValue = relationships.reduce((acc, r) => acc + (r.totalAgreedValue || 0), 0);

    const recentContracts = await Contract.find({ buyerId })
      .sort({ createdAt: -1 })
      .limit(4);

    const recentApplications = await Application.find({ buyerId, status: 'pending' })
      .populate('farmerId', 'name email phone')
      .populate('contractId', 'title cropName')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        verificationStatus: profile?.verificationStatus || 'not_submitted',
        totalContracts,
        publishedContracts,
        draftContracts,
        activeRelationships,
        pendingApplications,
        totalCommittedValueINR: totalCommittedValue,
      },
      recentContracts,
      recentApplications,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBuyerContracts(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const contracts = await Contract.find({ buyerId }).sort({ createdAt: -1 });

    // For each contract, get application counts
    const contractSummaries = await Promise.all(
      contracts.map(async (contract) => {
        const [appCount, approvedCount] = await Promise.all([
          Application.countDocuments({ contractId: contract._id }),
          Application.countDocuments({ contractId: contract._id, status: 'approved' }),
        ]);
        return {
          ...contract.toObject(),
          totalApplications: appCount,
          approvedApplications: approvedCount,
        };
      })
    );

    return res.status(200).json({ success: true, contracts: contractSummaries });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createContract(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const {
      title,
      cropName,
      cropVariety,
      category,
      quantityRequiredTons,
      minQuantityPerFarmerTons,
      pricePerTon,
      qualityStandards,
      cultivationStartDate,
      expectedHarvestDate,
      deliveryDeadline,
      deliveryLocation,
      paymentTerms,
      status = 'draft',
    } = req.body;

    if (!title || !cropName || !category || !quantityRequiredTons || !pricePerTon) {
      return res.status(400).json({
        success: false,
        message: 'Title, crop name, category, quantity, and price per ton are mandatory.',
      });
    }

    if (!cultivationStartDate || !expectedHarvestDate || !deliveryDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Cultivation start date, expected harvest date, and delivery deadline are mandatory.',
      });
    }

    if (!deliveryLocation?.facilityName || !deliveryLocation?.state || !deliveryLocation?.district) {
      return res.status(400).json({
        success: false,
        message: 'Delivery facility name, state, and district are mandatory.',
      });
    }

    // STRICT CHECK: Only verified buyers can publish contracts
    const buyerProfile = await BuyerProfile.findOne({ userId: buyerId });
    if (status === 'published') {
      if (!buyerProfile || buyerProfile.verificationStatus !== 'verified') {
        return res.status(403).json({
          success: false,
          message: 'Only administrator-verified buyers are authorized to publish contracts. Please save as draft until your business verification is approved.',
        });
      }
    }

    const contract = await Contract.create({
      buyerId,
      title: title.trim(),
      cropName: cropName.trim(),
      cropVariety: cropVariety || '',
      category,
      quantityRequiredTons: Number(quantityRequiredTons),
      minQuantityPerFarmerTons: Number(minQuantityPerFarmerTons) || 1,
      pricePerTon: Number(pricePerTon),
      qualityStandards: qualityStandards || {
        grade: 'Grade A - Premium Standard',
        maxMoisturePercent: 12,
        maxForeignMatterPercent: 1.5,
        specificationNotes: '',
      },
      cultivationStartDate: new Date(cultivationStartDate),
      expectedHarvestDate: new Date(expectedHarvestDate),
      deliveryDeadline: new Date(deliveryDeadline),
      deliveryLocation,
      paymentTerms: paymentTerms || {
        advancePercentage: 20,
        onDeliveryPercentage: 80,
        settlementDays: 7,
        notes: 'Direct RTGS/Bank Transfer upon delivery inspection.',
      },
      status: status === 'published' ? 'published' : 'draft',
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    return res.status(201).json({
      success: true,
      message: status === 'published' ? 'Contract published successfully!' : 'Contract saved as draft.',
      contract,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateContract(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const { id } = req.params;
    const updates = req.body;

    const contract = await Contract.findOne({ _id: id, buyerId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // STRICT CHECK: If switching status to published, verify buyer status
    if (updates.status === 'published' && contract.status !== 'published') {
      const buyerProfile = await BuyerProfile.findOne({ userId: buyerId });
      if (!buyerProfile || buyerProfile.verificationStatus !== 'verified') {
        return res.status(403).json({
          success: false,
          message: 'Only administrator-verified buyers can publish contracts.',
        });
      }
      contract.publishedAt = new Date();
    }

    // Apply allowed updates
    if (updates.title) contract.title = updates.title;
    if (updates.cropName) contract.cropName = updates.cropName;
    if (updates.cropVariety !== undefined) contract.cropVariety = updates.cropVariety;
    if (updates.category) contract.category = updates.category;
    if (updates.quantityRequiredTons) contract.quantityRequiredTons = Number(updates.quantityRequiredTons);
    if (updates.minQuantityPerFarmerTons) contract.minQuantityPerFarmerTons = Number(updates.minQuantityPerFarmerTons);
    if (updates.pricePerTon) contract.pricePerTon = Number(updates.pricePerTon);
    if (updates.qualityStandards) contract.qualityStandards = { ...contract.qualityStandards, ...updates.qualityStandards };
    if (updates.cultivationStartDate) contract.cultivationStartDate = new Date(updates.cultivationStartDate);
    if (updates.expectedHarvestDate) contract.expectedHarvestDate = new Date(updates.expectedHarvestDate);
    if (updates.deliveryDeadline) contract.deliveryDeadline = new Date(updates.deliveryDeadline);
    if (updates.deliveryLocation) contract.deliveryLocation = { ...contract.deliveryLocation, ...updates.deliveryLocation };
    if (updates.paymentTerms) contract.paymentTerms = { ...contract.paymentTerms, ...updates.paymentTerms };
    if (updates.status) contract.status = updates.status;

    await contract.save();
    return res.status(200).json({
      success: true,
      message: 'Contract updated successfully',
      contract,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function publishDraftContract(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const { id } = req.params;

    const buyerProfile = await BuyerProfile.findOne({ userId: buyerId });
    if (!buyerProfile || buyerProfile.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Only administrator-verified buyers can publish contracts. Your current status is: ' + (buyerProfile?.verificationStatus || 'unverified'),
      });
    }

    const contract = await Contract.findOne({ _id: id, buyerId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    contract.status = 'published';
    contract.publishedAt = new Date();
    await contract.save();

    return res.status(200).json({
      success: true,
      message: `Contract "${contract.title}" is now published and visible to farmers nationwide!`,
      contract,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getContractApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const { id: contractId } = req.params;

    const contract = await Contract.findOne({ _id: contractId, buyerId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    const applications = await Application.find({ contractId })
      .populate('farmerId', 'name email phone avatarUrl')
      .sort({ createdAt: -1 });

    // Attach farmer profiles & documents preview
    const enhancedApplications = await Promise.all(
      applications.map(async (app: any) => {
        const farmerProfile = await FarmerProfile.findOne({ userId: app.farmerId?._id });
        const farmerDocs = await DocumentModel.find({ userId: app.farmerId?._id }).select('title docType fileMimeType uploadedAt');
        return {
          ...app.toObject(),
          farmerProfile,
          farmerDocuments: farmerDocs,
        };
      })
    );

    return res.status(200).json({
      success: true,
      contract,
      applications: enhancedApplications,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function reviewApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const { id: applicationId } = req.params;
    const { decision, rejectionReason } = req.body;

    if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "approved" or "rejected".',
      });
    }

    if (decision === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is mandatory when declining an application.',
      });
    }

    const application = await Application.findOne({ _id: applicationId, buyerId }).populate('contractId');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have permission to review it.',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This application has already been ${application.status}.`,
      });
    }

    const contract: any = application.contractId;

    if (decision === 'rejected') {
      application.status = 'rejected';
      application.rejectionReason = rejectionReason.trim();
      application.reviewedAt = new Date();
      application.reviewedBy = buyerId;
      await application.save();

      // Notify farmer
      await Notification.create({
        userId: application.farmerId,
        title: 'Application Update: Declined',
        message: `Your application for contract "${contract?.title}" was not accepted. Reason: ${rejectionReason.trim()}`,
        type: 'application',
        link: '/farmer/applications',
      });

      return res.status(200).json({
        success: true,
        message: 'Application rejected.',
        application,
      });
    }

    // Decision is APPROVED
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = buyerId;
    await application.save();

    // Check duplicate relationship
    let relationship = await ContractRelationship.findOne({ applicationId });
    if (!relationship) {
      const agreedQuantity = application.quantityOfferedTons;
      const agreedPrice = contract.pricePerTon;
      const totalValue = agreedQuantity * agreedPrice;

      relationship = await ContractRelationship.create({
        contractId: contract._id,
        applicationId: application._id,
        farmerId: application.farmerId,
        buyerId,
        cropName: contract.cropName,
        agreedQuantityTons: agreedQuantity,
        agreedPricePerTon: agreedPrice,
        totalAgreedValue: totalValue,
        lifecycleStage: 'sowing',
        progressPercentage: 10,
        status: 'active',
      });

      // Update contract allocated quantity
      contract.allocatedQuantityTons = (contract.allocatedQuantityTons || 0) + agreedQuantity;
      if (contract.allocatedQuantityTons >= contract.quantityRequiredTons) {
        contract.status = 'in_progress';
      }
      await contract.save();

      // Create initial scheduled delivery entry
      await Delivery.create({
        relationshipId: relationship._id,
        farmerId: application.farmerId,
        buyerId,
        destinationWarehouse: contract.deliveryLocation?.facilityName || 'Central Hub',
        destinationAddress: `${contract.deliveryLocation?.address}, ${contract.deliveryLocation?.district}, ${contract.deliveryLocation?.state}`,
        deliveredQuantityTons: agreedQuantity,
        status: 'scheduled',
      });

      // Create initial pending payment entry
      await Payment.create({
        relationshipId: relationship._id,
        farmerId: application.farmerId,
        buyerId,
        amount: totalValue,
        currency: 'INR',
        status: 'pending',
        paymentType: 'full_lump_sum',
        paymentMethod: 'Direct Bank Transfer',
        notes: `Total agreed contract value for ${agreedQuantity} tons of ${contract.cropName}.`,
        recordedBy: buyerId,
      });

      // Notify farmer
      await Notification.create({
        userId: application.farmerId,
        title: 'Contract Application Approved!',
        message: `Congratulations! Your application for "${contract.title}" has been approved for ${agreedQuantity} tons. Active contract relationship is now established.`,
        type: 'contract',
        link: `/farmer/contracts/active/${relationship._id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application approved! Contract relationship successfully established with farmer.',
      application,
      relationship,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBuyerActiveContracts(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const relationships = await ContractRelationship.find({ buyerId })
      .populate('farmerId', 'name email phone avatarUrl')
      .populate('contractId')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, relationships });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBuyerActiveContractDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const { id } = req.params;

    const relationship = await ContractRelationship.findOne({ _id: id, buyerId })
      .populate('farmerId', 'name email phone')
      .populate('contractId')
      .populate('applicationId');

    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Contract relationship not found' });
    }

    const [farmerProfile, progressUpdates, harvest, qualityInspection, delivery, paymentList] =
      await Promise.all([
        FarmerProfile.findOne({ userId: relationship.farmerId }),
        ProgressUpdate.find({ relationshipId: id }).sort({ recordedAt: -1 }),
        Harvest.findOne({ relationshipId: id }),
        QualityInspection.findOne({ relationshipId: id }),
        Delivery.findOne({ relationshipId: id }),
        Payment.find({ relationshipId: id }).sort({ createdAt: -1 }),
      ]);

    return res.status(200).json({
      success: true,
      relationship,
      farmerProfile,
      progressUpdates,
      harvest,
      qualityInspection,
      delivery,
      payments: paymentList,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function recordBuyerQualityInspection(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const { id } = req.params;
    const {
      inspectorName,
      decision,
      measuredMoisturePercent,
      measuredForeignMatterPercent,
      labTestCertificateNumber,
      inspectorRemarks,
      acceptancePriceAdjustmentPercent,
    } = req.body;

    if (!inspectorName || !decision || !inspectorRemarks) {
      return res.status(400).json({
        success: false,
        message: 'Inspector name, inspection decision, and remarks are mandatory.',
      });
    }

    const relationship = await ContractRelationship.findOne({ _id: id, buyerId });
    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Contract relationship not found' });
    }

    const inspection = await QualityInspection.findOneAndUpdate(
      { relationshipId: id },
      {
        relationshipId: id,
        buyerId,
        inspectorName: inspectorName.trim(),
        inspectionDate: new Date(),
        decision,
        measuredMoisturePercent: Number(measuredMoisturePercent) || 11.5,
        measuredForeignMatterPercent: Number(measuredForeignMatterPercent) || 1.0,
        labTestCertificateNumber: labTestCertificateNumber || '',
        inspectorRemarks: inspectorRemarks.trim(),
        acceptancePriceAdjustmentPercent: Number(acceptancePriceAdjustmentPercent) || 0,
        inspectedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    if (decision === 'rejected') {
      relationship.status = 'disputed';
      relationship.statusReason = `Quality inspection rejected: ${inspectorRemarks}`;
    } else {
      relationship.lifecycleStage = 'quality_inspected';
      relationship.progressPercentage = 85;
    }
    await relationship.save();

    // Notify farmer
    await Notification.create({
      userId: relationship.farmerId,
      title: 'Quality Inspection Completed',
      message: `Quality inspection for ${relationship.cropName} completed: ${decision.replace(/_/g, ' ').toUpperCase()}. Remarks: ${inspectorRemarks}`,
      type: 'progress',
      link: `/farmer/contracts/active/${id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Quality inspection recorded successfully!',
      inspection,
      relationship,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function confirmDeliveryReceipt(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const { id } = req.params;
    const { notes } = req.body;

    const relationship = await ContractRelationship.findOne({ _id: id, buyerId });
    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Contract relationship not found' });
    }

    const delivery = await Delivery.findOne({ relationshipId: id });
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found' });
    }

    delivery.status = 'confirmed';
    delivery.confirmedAt = new Date();
    delivery.confirmedBy = buyerId;
    if (notes) delivery.statusNotes = notes;
    await delivery.save();

    relationship.lifecycleStage = 'delivered';
    relationship.progressPercentage = 95;
    await relationship.save();

    // Notify farmer
    await Notification.create({
      userId: relationship.farmerId,
      title: 'Consignment Delivery Confirmed by Buyer',
      message: `The buyer has confirmed receipt of delivery for ${relationship.cropName}. Payment settlement is in progress.`,
      type: 'delivery',
      link: `/farmer/contracts/active/${id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Delivery confirmed successfully!',
      delivery,
      relationship,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function recordBuyerPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const buyerId = req.user!._id;
    const { id } = req.params;
    const {
      amount,
      paymentType,
      paymentMethod,
      bankReferenceNumber,
      status,
      notes,
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    }

    const relationship = await ContractRelationship.findOne({ _id: id, buyerId });
    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Contract relationship not found' });
    }

    const payment = await Payment.create({
      relationshipId: id,
      farmerId: relationship.farmerId,
      buyerId,
      amount: Number(amount),
      currency: 'INR',
      paymentType: paymentType || 'final_settlement',
      paymentMethod: paymentMethod || 'Direct Bank Transfer',
      bankReferenceNumber: bankReferenceNumber || `UTR_${Date.now()}`,
      status: status || 'paid',
      paidAt: status === 'paid' ? new Date() : undefined,
      notes: notes || 'Payment settlement released through banking channel.',
      recordedBy: buyerId,
    });

    if (status === 'paid') {
      relationship.lifecycleStage = 'completed';
      relationship.progressPercentage = 100;
      relationship.status = 'completed';
      relationship.completedAt = new Date();
      await relationship.save();
    }

    // Notify farmer
    await Notification.create({
      userId: relationship.farmerId,
      title: status === 'paid' ? 'Payment Settlement Recorded (₹' + amount + ')' : 'Payment Status Updated',
      message: `Buyer has recorded payment of ₹${Number(amount).toLocaleString('en-IN')} via ${paymentMethod || 'Bank Transfer'}. Ref: ${bankReferenceNumber || 'N/A'}.`,
      type: 'payment',
      link: `/farmer/contracts/active/${id}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment status recorded successfully!',
      payment,
      relationship,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
