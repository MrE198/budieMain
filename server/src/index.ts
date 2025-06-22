import { config } from './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import routes from './routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.CLIENT_URL,
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Routes
app.use('/api', routes);

// Socket.io
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Error handling - must be last
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    httpServer.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
  });
});