import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../schemas/authSchemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));

export default router;
