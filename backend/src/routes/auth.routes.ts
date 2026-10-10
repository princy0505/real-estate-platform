import { Router } from 'express';
import { register, login, refresh } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authRateLimit } from '../middleware/rateLimit';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth';

const router = Router();

router.post('/register', authRateLimit, validate(registerSchema), register);
router.post('/login', authRateLimit, validate(loginSchema), login);
router.post('/refresh', authRateLimit, validate(refreshSchema), refresh);

export default router;
