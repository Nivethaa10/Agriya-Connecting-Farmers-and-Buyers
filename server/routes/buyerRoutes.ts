import { Router } from 'express';
import {
  getBuyerProfile,
  updateBuyerProfile,
  requestBuyerVerification,
  getBuyerDashboard,
  getBuyerContracts,
  createContract,
  updateContract,
  publishDraftContract,
  getContractApplications,
  reviewApplication,
  getBuyerActiveContracts,
  getBuyerActiveContractDetails,
  recordBuyerQualityInspection,
  confirmDeliveryReceipt,
  recordBuyerPayment,
} from '../controllers/buyerController.ts';
import { verifyToken, requireRole } from '../middleware/auth.ts';

const router = Router();

// Protected Buyer Routes
router.use(verifyToken);
router.use(requireRole('buyer'));

router.get('/profile', getBuyerProfile);
router.put('/profile', updateBuyerProfile);
router.post('/request-verification', requestBuyerVerification);
router.get('/dashboard', getBuyerDashboard);

router.get('/contracts', getBuyerContracts);
router.post('/contracts', createContract);
router.put('/contracts/:id', updateContract);
router.post('/contracts/:id/publish', publishDraftContract);
router.get('/contracts/:id/applications', getContractApplications);

router.post('/applications/:id/review', reviewApplication);

router.get('/active-contracts', getBuyerActiveContracts);
router.get('/active-contracts/:id', getBuyerActiveContractDetails);

router.post('/active-contracts/:id/inspection', recordBuyerQualityInspection);
router.post('/active-contracts/:id/delivery-confirm', confirmDeliveryReceipt);
router.post('/active-contracts/:id/payment', recordBuyerPayment);

export default router;
