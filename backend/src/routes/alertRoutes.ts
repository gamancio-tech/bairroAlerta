import { Router } from 'express';
import { alertController } from '../controllers/alertController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { createAlertSchema } from '../schemas/alertSchemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(alertController.list));
router.get('/:id', asyncHandler(alertController.getById));
router.post('/', authMiddleware, validate(createAlertSchema), asyncHandler(alertController.create));

export default router;
