import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import calculationRoutes from './routes/calculationRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: CORS_ORIGIN,
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

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS enabled for: ${CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

