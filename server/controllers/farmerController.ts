import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
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
import {
  growthStageForProgress,
  recordLifecycleUpdate,
  validateGrowthUpdate,
} from '../utils/contractLifecycle.ts';

export async function getFarmerProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const farmerId = req.user!._id;
    let profile = await FarmerProfile.findOne({ userId: farmerId });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: farmerId,
        farmName: `${req.user!.name}'s Farm`,
      });
    }
    return res.status(200).json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateFarmerProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const farmerId = req.user!._id;
    const {
      farmName,
      location,
      experienceYears,
      farmSizeAcres,
      soilType,
      irrigationSource,
      productionCapacityTons,
      primaryCrops,
      certifications,
      bio,
    } = req.body;

    let profile = await FarmerProfile.findOne({ userId: farmerId });
    if (!profile) {
      profile = new FarmerProfile({ userId: farmerId });
    }

    if (farmName !== undefined) profile.farmName = farmName;
    if (location) profile.location = { ...profile.location, ...location };
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (farmSizeAcres !== undefined) profile.farmSizeAcres = Number(farmSizeAcres);
    if (soilType !== undefined) profile.soilType = soilType;
    if (irrigationSource !== undefined) profile.irrigationSource = irrigationSource;
    if (productionCapacityTons !== undefined)
      profile.productionCapacityTons = Number(productionCapacityTons);
    if (primaryCrops !== undefined) profile.primaryCrops = primaryCrops;
    if (certifications !== undefined) profile.certifications = certifications;
    if (bio !== undefined) profile.bio = bio;

    await profile.save();
    return res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getFarmerDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const farmerId = req.user!._id;

    const [
      activeRelationships,
      completedRelationships,
      pendingApplications,
      totalApplications,
      payments,
    ] = await Promise.all([
      ContractRelationship.countDocuments({ farmerId, status: 'active' }),
      ContractRelationship.countDocuments({ farmerId, status: 'completed' }),
      Application.countDocuments({ farmerId, status: 'pending' }),
      Application.countDocuments({ farmerId }),
      Payment.find({ farmerId }),
    ]);

    const totalEarned = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = payments
      .filter((p) => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + p.amount, 0);

    const recentRelationships = await ContractRelationship.find({ farmerId })
      .populate('contractId', 'title cropName category deliveryDeadline')
      .populate('buyerId', 'name email phone')
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentApplications = await Application.find({ farmerId })
      .populate('contractId', 'title cropName pricePerTon deliveryDeadline')
      .populate('buyerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        activeContractsCount: activeRelationships,
        completedContractsCount: completedRelationships,
        pendingApplicationsCount: pendingApplications,
        totalApplicationsCount: totalApplications,
        totalEarnedINR: totalEarned,
        pendingPaymentINR: pendingPayments,
      },
      recentRelationships,
      recentApplications,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function browseContracts(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, category, state, minPrice, maxPrice, page = 1, limit = 9 } = req.query;

    const query: any = { status: 'published' };

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { cropName: searchRegex },
        { title: searchRegex },
        { cropVariety: searchRegex },
        { 'deliveryLocation.district': searchRegex },
        { 'deliveryLocation.state': searchRegex },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (state && state !== 'all') {
      query['deliveryLocation.state'] = state;
    }

    if (minPrice || maxPrice) {
      query.pricePerTon = {};
      if (minPrice) query.pricePerTon.$gte = Number(minPrice);
      if (maxPrice) query.pricePerTon.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * pageSize;

    const [contracts, total] = await Promise.all([
      Contract.find(query)
        .populate('buyerId', 'name')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Contract.countDocuments(query),
    ]);

    // Check application status for current farmer if logged in
    const farmerId = req.user?._id;
    let appliedContractIds: string[] = [];
    if (farmerId) {
      const apps = await Application.find({ farmerId }).select('contractId status');
      appliedContractIds = apps.map((a) => a.contractId.toString());
    }

    return res.status(200).json({
      success: true,
      contracts,
      appliedContractIds,
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

export async function getContractDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id).populate('buyerId', 'name email phone');
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    const farmerId = req.user?._id;
    let existingApplication = null;
    if (farmerId) {
      existingApplication = await Application.findOne({ contractId: id, farmerId });
    }

    return res.status(200).json({
      success: true,
      contract,
      existingApplication,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function applyForContract(req: AuthenticatedRequest, res: Response) {
  try {
    const farmerId = req.user!._id;
    const { id: contractId } = req.params;
    const { quantityOfferedTons, expectedHarvestDate, expectedDeliveryDate, farmerNotes } = req.body;

    if (!quantityOfferedTons || !expectedHarvestDate || !expectedDeliveryDate) {
      return res.status(400).json({
        success: false,
        message: 'Quantity offered, expected harvest date, and expected delivery date are required.',
      });
    }

    const parsedQuantity = Number(quantityOfferedTons);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid offered quantity in tons.',
      });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    if (contract.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Applications are only accepted on currently published contracts.',
      });
    }

    if (parsedQuantity < contract.minQuantityPerFarmerTons) {
      return res.status(400).json({
        success: false,
        message: `Offered quantity (${parsedQuantity} tons) is lower than the minimum allowed (${contract.minQuantityPerFarmerTons} tons).`,
      });
    }

    // Check duplicate application
    const existing = await Application.findOne({ contractId, farmerId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this contract. Duplicate applications are not allowed.',
      });
    }

    const application = await Application.create({
      contractId,
      farmerId,
      buyerId: contract.buyerId,
      quantityOfferedTons: parsedQuantity,
      expectedHarvestDate: new Date(expectedHarvestDate),
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      farmerNotes: farmerNotes || '',
      status: 'pending',
    });

    // Notify buyer
    await Notification.create({
      userId: contract.buyerId,
      title: 'New Contract Application Received',
      message: `Farmer ${req.user!.name} applied for contract "${contract.title}" offering ${parsedQuantity} tons of ${contract.cropName}.`,
      type: 'application',
      link: `/buyer/contracts/${contractId}/applications`,
    });

    return res.status(201).json({
      success: true,
      message: 'Your application has been submitted successfully to the buyer!',
      application,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this contract.',
      });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getFarmerApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const farmerId = req.user!._id;
    const applications = await Application.find({ farmerId })
      .populate('contractId')
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, applications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getFarmerActiveContracts(req: AuthenticatedRequest, res: Response) {
  try {
    const farmerId = req.user!._id;
    const relationships = await ContractRelationship.find({ farmerId })
      .populate('contractId')
      .populate('buyerId', 'name email phone')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, relationships });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getActiveContractLifecycle(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const farmerId = req.user!._id;

    const relationship = await ContractRelationship.findOne({
      _id: id,
      farmerId,
    })
      .populate('contractId')
      .populate('buyerId', 'name email phone')
      .populate('applicationId');

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Active contract not found or you do not have permission to view it.',
      });
    }

    const [progressUpdates, harvest, qualityInspection, delivery, payment] = await Promise.all([
      ProgressUpdate.find({ relationshipId: id }).sort({ recordedAt: -1 }),
      Harvest.findOne({ relationshipId: id }),
      QualityInspection.findOne({ relationshipId: id }),
      Delivery.findOne({ relationshipId: id }),
      Payment.find({ relationshipId: id }).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      relationship,
      progressUpdates,
      harvest,
      qualityInspection,
      delivery,
      payment,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function addCultivationProgress(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const farmerId = req.user!._id;
    const {
      stageName,
      progressPercentage,
      soilCondition,
      irrigationStatus,
      fertilizerOrNutrientsApplied,
      pestControlMeasures,
      cropHealthRating,
      notes,
    } = req.body;

    if (!stageName || progressPercentage === undefined || !notes) {
      return res.status(400).json({
        success: false,
        message: 'Stage name, progress percentage, and progress notes are mandatory.',
      });
    }

    const relationship = await ContractRelationship.findOne({ _id: id, farmerId });
    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Contract relationship not found.' });
    }

    const lifecycleStage = growthStageForProgress(stageName);
    const numericProgress = Number(progressPercentage);
    if (!lifecycleStage) {
      return res.status(400).json({
        success: false,
        message: 'Select one of the supported cultivation stages.',
      });
    }
    const validationError = validateGrowthUpdate(relationship, lifecycleStage, numericProgress);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const progress = await ProgressUpdate.create({
      relationshipId: id,
      farmerId,
      stageName,
      progressPercentage: numericProgress,
      soilCondition: soilCondition || 'Optimal',
      irrigationStatus: irrigationStatus || 'Scheduled',
      fertilizerOrNutrientsApplied: fertilizerOrNutrientsApplied || '',
      pestControlMeasures: pestControlMeasures || 'Standard organic management',
      cropHealthRating: cropHealthRating || 'excellent',
      notes,
    });

    recordLifecycleUpdate(relationship, lifecycleStage, numericProgress, farmerId, 'farmer', notes);
    await relationship.save();

    // Notify buyer
    await Notification.create({
      userId: relationship.buyerId,
      title: 'Cultivation Progress Update',
      message: `Farmer ${req.user!.name} posted a progress update for ${relationship.cropName} (${progressPercentage}% complete - ${stageName}).`,
      type: 'progress',
      link: `/buyer/lifecycle/${id}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Cultivation progress logged successfully!',
      progress,
      relationship,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function recordFarmerHarvest(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const farmerId = req.user!._id;
    const {
      harvestDate,
      harvestedQuantityTons,
      measuredGrade,
      moisturePercentage,
      packagingDetails,
      storageLocation,
      specialObservations,
    } = req.body;

    if (!harvestedQuantityTons || !harvestDate) {
      return res.status(400).json({
        success: false,
        message: 'Harvest date and harvested quantity in tons are required.',
      });
    }

    const relationship = await ContractRelationship.findOne({ _id: id, farmerId });
    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Contract relationship not found.' });
    }

    const quantity = Number(harvestedQuantityTons);
    const parsedHarvestDate = new Date(harvestDate);
    if (
      relationship.status !== 'active' ||
      relationship.lifecycleStage !== 'mature_harvest_ready' ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      quantity > relationship.agreedQuantityTons ||
      Number.isNaN(parsedHarvestDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Harvest requires an active, mature contract and a valid quantity within the agreed amount.',
      });
    }

    const harvest = await Harvest.findOneAndUpdate(
      { relationshipId: id },
      {
        relationshipId: id,
        farmerId,
        harvestDate: parsedHarvestDate,
        harvestedQuantityTons: quantity,
        measuredGrade: measuredGrade || 'Grade A1 Premium',
        moisturePercentage: Number(moisturePercentage) || 12,
        packagingDetails: packagingDetails || 'Food-grade breathable sacks',
        storageLocation: storageLocation || 'Farm shaded storage',
        specialObservations: specialObservations || '',
        recordedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    recordLifecycleUpdate(
      relationship,
      'harvested',
      80,
      farmerId,
      'farmer',
      specialObservations || 'Harvest recorded'
    );
    await relationship.save();

    // Notify buyer that harvest is ready for inspection/scheduling
    await Notification.create({
      userId: relationship.buyerId,
      title: 'Harvest Recorded — Quality Inspection Required',
      message: `Farmer ${req.user!.name} recorded ${harvestedQuantityTons} tons of harvest for ${relationship.cropName}. Please review and conduct quality inspection.`,
      type: 'progress',
      link: `/buyer/lifecycle/${id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Harvest details recorded successfully!',
      harvest,
      relationship,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateFarmerDelivery(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const farmerId = req.user!._id;
    const {
      destinationWarehouse,
      destinationAddress,
      dispatchDate,
      estimatedArrivalDate,
      vehicleRegistrationNumber,
      transporterName,
      driverContactPhone,
      consignmentWaybillNumber,
      deliveredQuantityTons,
      statusNotes,
    } = req.body;

    const relationship = await ContractRelationship.findOne({ _id: id, farmerId }).populate('contractId');
    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Contract relationship not found.' });
    }

    const quantity = Number(deliveredQuantityTons || relationship.agreedQuantityTons);
    const parsedDispatchDate = dispatchDate ? new Date(dispatchDate) : new Date();
    const dispatchScheduled = parsedDispatchDate.getTime() > Date.now();
    if (
      relationship.status !== 'active' ||
      !['quality_inspected', 'dispatch_scheduled'].includes(relationship.lifecycleStage) ||
      !Number.isFinite(quantity) ||
      quantity < 0.1 ||
      quantity > relationship.agreedQuantityTons ||
      Number.isNaN(parsedDispatchDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Dispatch scheduling requires an approved quality inspection and a valid quantity and date.',
      });
    }

    const contract: any = relationship.contractId;
    const delivery = await Delivery.findOneAndUpdate(
      { relationshipId: id },
      {
        relationshipId: id,
        farmerId,
        buyerId: relationship.buyerId,
        destinationWarehouse: destinationWarehouse || contract?.deliveryLocation?.facilityName || 'Central Processing Depot',
        destinationAddress: destinationAddress || contract?.deliveryLocation?.address || 'Buyer Logistics Hub',
        dispatchDate: parsedDispatchDate,
        estimatedArrivalDate: estimatedArrivalDate ? new Date(estimatedArrivalDate) : undefined,
        vehicleRegistrationNumber: vehicleRegistrationNumber || '',
        transporterName: transporterName || '',
        driverContactPhone: driverContactPhone || '',
        consignmentWaybillNumber: consignmentWaybillNumber || '',
        deliveredQuantityTons: quantity,
        status: dispatchScheduled ? 'scheduled' : 'dispatched',
        statusNotes: statusNotes || '',
      },
      { upsert: true, new: true }
    );

    recordLifecycleUpdate(
      relationship,
      dispatchScheduled ? 'dispatch_scheduled' : 'in_transit',
      dispatchScheduled ? 88 : 90,
      farmerId,
      'farmer',
      statusNotes || (dispatchScheduled ? 'Consignment dispatch scheduled' : 'Consignment dispatched')
    );
    await relationship.save();

    // Notify buyer
    await Notification.create({
      userId: relationship.buyerId,
      title: dispatchScheduled ? 'Consignment Dispatch Scheduled' : 'Consignment Dispatched',
      message: dispatchScheduled
        ? `Dispatch of ${quantity} tons of ${relationship.cropName} is scheduled for ${parsedDispatchDate.toLocaleDateString()}.`
        : `Consignment of ${quantity} tons of ${relationship.cropName} has been dispatched (Vehicle: ${vehicleRegistrationNumber || 'N/A'}).`,
      type: 'delivery',
      link: `/buyer/lifecycle/${id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Delivery details updated successfully!',
      delivery,
      relationship,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
