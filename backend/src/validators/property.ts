import { z } from 'zod';

const propertyType = z.enum(['APARTMENT', 'VILLA', 'HOUSE', 'PLOT', 'OFFICE', 'SHOP']);

export const propertyBody = z.object({
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().min(2).max(5000),
  city: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(180),
  propertyType,
  price: z.coerce.number().nonnegative(),
  bedrooms: z.coerce.number().int().nonnegative().nullable().optional(),
  bathrooms: z.coerce.number().int().nonnegative().nullable().optional(),
  areaSqft: z.coerce.number().int().positive(),
  images: z.array(z.string().url()).max(20).default([])
});

export const createPropertySchema = z.object({
  body: propertyBody,
  query: z.record(z.string(), z.string()).optional().default({}),
  params: z.record(z.string(), z.string()).optional().default({})
});

export const updatePropertySchema = createPropertySchema;

export const listPropertiesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    city: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    propertyType: z.string().optional(),
    bedrooms: z.coerce.number().optional(),
    ownerId: z.string().uuid().optional(), 
    sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
    limit: z.coerce.number().min(1).max(50).default(12),
    cursor: z.string().optional(),
  })
});
