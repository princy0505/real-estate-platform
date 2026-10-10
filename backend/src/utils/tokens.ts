import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signAccessToken(user: { id: string; email: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: 'access' },
    env.accessSecret,
    { expiresIn: env.accessExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function signRefreshToken(userId: string) {
  return jwt.sign(
    { sub: userId, type: 'refresh', jti: crypto.randomUUID() },
    env.refreshSecret,
    { expiresIn: `${env.refreshDays}d` }
  );
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
