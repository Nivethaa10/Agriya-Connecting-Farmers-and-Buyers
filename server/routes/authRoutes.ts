import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController.ts';
import { verifyToken } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

export default router;
