import { z } from 'zod';

export const createInquirySchema = z.object({
  body: z.object({
    message: z.string().trim().min(5).max(1000)
  }),
  query: z.record(z.string(), z.string()).optional().default({}),
  params: z.object({ propertyId: z.string().uuid() })
});
