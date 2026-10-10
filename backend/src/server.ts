import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { query } from './db/pool';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import inquiryRoutes from './routes/inquiry.routes';
import { errorHandler } from './middleware/error';
import { swaggerSpec } from './docs/swagger';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: false }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  await query('SELECT 1');
  res.json({ success: true, status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.use((_req, res) => res.status(404).json({
  success: false,
  code: 'NOT_FOUND',
  message: 'Route not found'
}));

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API running at http://localhost:${env.port}`);
  console.log(`Swagger at http://localhost:${env.port}/api-docs`);
});
