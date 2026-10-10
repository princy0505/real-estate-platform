import { z } from 'zod';

const email = z.string().trim().email().max(255);
const password = z.string().min(8).max(72);

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email,
    password
  }),
  query: z.record(z.string(), z.string()).optional().default({}),
  params: z.record(z.string(), z.string()).optional().default({})
});

export const loginSchema = z.object({
  body: z.object({ email, password }),
  query: z.record(z.string(), z.string()).optional().default({}),
  params: z.record(z.string(), z.string()).optional().default({})
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(20) }),
  query: z.record(z.string(), z.string()).optional().default({}),
  params: z.record(z.string(), z.string()).optional().default({})
});
