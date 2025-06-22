import { Router } from 'express';
import authRoutes from './auth.routes';
// Import other routes as they are created

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
router.use('/auth', authRoutes);
// Add other routes here as they are created

export default router;