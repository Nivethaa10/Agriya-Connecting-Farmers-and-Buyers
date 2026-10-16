import { Router } from 'express';
import { createSupportRequest, getMySupportRequests } from '../controllers/supportController.ts';
import { verifyToken } from '../middleware/auth.ts';

const router = Router();

router.use(verifyToken);

router.post('/', createSupportRequest);
router.get('/my', getMySupportRequests);

export default router;
