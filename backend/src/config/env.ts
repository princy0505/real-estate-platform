import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL'),
  accessSecret: required('JWT_ACCESS_SECRET'),
  refreshSecret: required('JWT_REFRESH_SECRET'),
  accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m',
  refreshDays: Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 30),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000'
};
