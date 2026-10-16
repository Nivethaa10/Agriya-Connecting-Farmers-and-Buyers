import { Router } from 'express';
import {
  uploadDocument,
  getMyDocuments,
  getUserDocuments,
  downloadDocument,
  deleteDocument,
} from '../controllers/documentController.ts';
import { verifyToken } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';

const router = Router();

router.use(verifyToken);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/my', getMyDocuments);
router.get('/user/:userId', getUserDocuments);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);

export default router;
