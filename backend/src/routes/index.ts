import { Router } from 'express';
import authRoutes from './authRoutes';
import alertRoutes from './alertRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/alerts', alertRoutes);

export default router;
