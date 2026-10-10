import { Router } from 'express';
import { create } from '../controllers/inquiry.controller';
import { requireAuth } from '../middleware/auth';
import { inquiryRateLimit } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { createInquirySchema } from '../validators/inquiry';

const router = Router();

router.post(
  '/:propertyId',
  requireAuth,
  inquiryRateLimit,
  validate(createInquirySchema),
  create
);

export default router;
