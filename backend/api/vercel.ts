import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { initDatabase } from '../config/database';
import authRoutes from '../routes/authRoutes';
import calculationRoutes from '../routes/calculationRoutes';
import { errorHandler } from '../middleware/errorHandler';

// Initialize database on cold start
let dbInitialized = false;

const initDbOnce = async () => {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
};

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calculations', calculationRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize database on first request
  await initDbOnce();
  
  // Handle the request with Express
  return app(req as any, res as any);
}

