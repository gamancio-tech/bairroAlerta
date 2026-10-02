import { Router } from 'express';
import { alertController } from '../controllers/alertController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, alertController.create.bind(alertController));
router.get('/', alertController.list.bind(alertController));

export default router;
