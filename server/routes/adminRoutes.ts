import { Router } from 'express';
import {
  getAdminDashboard,
  getUsers,
  toggleUserStatus,
  getBuyerVerifications,
  reviewBuyerVerification,
  getAllContractsAdmin,
  getAllActiveContractsAdmin,
  getAllSupportRequestsAdmin,
  updateSupportTicketAdmin,
  getAdminReports,
  getAdminReportDetails,
  getAdminAuditLogs,
} from '../controllers/adminController.ts';
import { verifyToken, requireRole } from '../middleware/auth.ts';

const router = Router();

// Protected Admin Routes
router.use(verifyToken);
router.use(requireRole('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);

router.get('/verifications', getBuyerVerifications);
router.post('/verifications/:id/decision', reviewBuyerVerification);

router.get('/contracts', getAllContractsAdmin);
router.get('/active-contracts', getAllActiveContractsAdmin);

router.get('/support', getAllSupportRequestsAdmin);
router.put('/support/:id', updateSupportTicketAdmin);

router.get('/reports', getAdminReports);
router.get('/reports/details', getAdminReportDetails);
router.get('/audit-logs', getAdminAuditLogs);

export default router;
