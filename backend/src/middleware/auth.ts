import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

type AccessPayload = { sub: string; email: string; type: 'access' };

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  try {
    const token = header.substring(7);
    const payload = jwt.verify(token, env.accessSecret) as AccessPayload;

    if (payload.type !== 'access') throw new Error('Invalid token type');

    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError('Invalid or expired access token', 401, 'UNAUTHORIZED'));
  }
};
