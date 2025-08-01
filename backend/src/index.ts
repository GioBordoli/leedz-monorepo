import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// API routes
app.get('/api', (_req, res) => {
  res.json({ message: 'Leedz API Server - Ready for lead generation!' });
});

// Authentication routes
app.use('/auth', authRoutes);

// User management routes (protected)
app.use('/api/user', userRoutes);

// Error handling middleware
// FIXME: SECURITY - Error handler may leak sensitive information in stack traces
// TODO: Implement proper error logging service (e.g., Sentry, LogRocket)
// TODO: Add rate limiting middleware to prevent DoS attacks
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  // TODO: Don't expose stack traces in production
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Leedz Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app; 