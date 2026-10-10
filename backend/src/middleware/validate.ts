import { RequestHandler } from 'express';
import { ZodType, z } from 'zod';

export const validate = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.parse({
    body: req.body,
    query: req.query,
    params: req.params
  }) as { body: any; query: any; params: any };
  
  req.body = result.body;
  req.query = result.query as any;
  req.params = result.params as any;
  next();
};