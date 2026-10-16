import { Router } from 'express';
import {
  getFarmerProfile,
  updateFarmerProfile,
  getFarmerDashboard,
  browseContracts,
  getContractDetails,
  applyForContract,
  getFarmerApplications,
  getFarmerActiveContracts,
  getActiveContractLifecycle,
  addCultivationProgress,
  recordFarmerHarvest,
  updateFarmerDelivery,
} from '../controllers/farmerController.ts';
import { verifyToken, requireRole } from '../middleware/auth.ts';

const router = Router();

// Public / Semi-public contract browsing
router.get('/contracts', browseContracts);
router.get('/contracts/:id', getContractDetails);

// Protected Farmer Routes
router.use(verifyToken);
router.use(requireRole('farmer'));

router.get('/profile', getFarmerProfile);
router.put('/profile', updateFarmerProfile);
router.get('/dashboard', getFarmerDashboard);

router.post('/contracts/:id/apply', applyForContract);
router.get('/applications', getFarmerApplications);

router.get('/active-contracts', getFarmerActiveContracts);
router.get('/active-contracts/:id', getActiveContractLifecycle);

router.post('/active-contracts/:id/progress', addCultivationProgress);
router.post('/active-contracts/:id/harvest', recordFarmerHarvest);
router.post('/active-contracts/:id/delivery', updateFarmerDelivery);

export default router;
