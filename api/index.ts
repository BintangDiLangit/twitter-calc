// Vercel serverless function entry point
// This file should be in /api/index.ts for Vercel to recognize it

import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { initDatabase } from '../backend/src/config/database';
import authRoutes from '../backend/src/routes/authRoutes';
import calculationRoutes from '../backend/src/routes/calculationRoutes';
import { errorHandler } from '../backend/src/middleware/errorHandler';

// Initialize database on cold start
let dbInitialized = false;

const initDbOnce = async () => {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Database initialization error:', error);
    }
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

