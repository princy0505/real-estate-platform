import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { hashToken, signAccessToken, signRefreshToken } from '../utils/tokens';

type UserRow = { id: string; name: string; email: string; password_hash: string };

async function issueTokens(user: Pick<UserRow, 'id' | 'email'>) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  const tokenHash = hashToken(refreshToken);

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + ($3 || ' days')::interval)`,
    [user.id, tokenHash, env.refreshDays]
  );

  return { accessToken, refreshToken };
}

export async function register(name: string, email: string, password: string) {
  const exists = await query(`SELECT id FROM users WHERE email = $1`, [email]);
  if (exists.rowCount) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query<UserRow>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, password_hash`,
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  return { user: { id: user.id, name: user.name, email: user.email }, ...(await issueTokens(user)) };
}

export async function login(email: string, password: string) {
  const result = await query<UserRow>(
    `SELECT id, name, email, password_hash FROM users WHERE email = $1`,
    [email]
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  return { user: { id: user.id, name: user.name, email: user.email }, ...(await issueTokens(user)) };
}

export async function refresh(refreshToken: string) {
  let payload: { sub: string; type: 'refresh' };
  try {
    payload = jwt.verify(refreshToken, env.refreshSecret) as typeof payload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const tokenHash = hashToken(refreshToken);
  const result = await query<{ id: string; name: string; email: string }>(
    `SELECT u.id, u.name, u.email
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1
       AND rt.revoked_at IS NULL
       AND rt.expires_at > NOW()
       AND u.id = $2`,
    [tokenHash, payload.sub]
  );

   const user = result.rows[0];
  if (!user) {
    
    const reused = await query(
      `SELECT user_id FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NOT NULL`,
      [tokenHash]
    );
    if (reused.rowCount) {
      
      await query(
        `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
        [reused.rows[0].user_id]
      );
      throw new AppError('Token reuse detected. All sessions revoked.', 401, 'TOKEN_REUSE');
    }
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  await query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`, [tokenHash]);

  return { user, ...(await issueTokens(user)) };

}
