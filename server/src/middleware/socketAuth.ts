import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export const socketAuth = async (socket: Socket, next: any) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Socket connection attempted without token');
      return next(new Error('Authentication required'));
    }

    // Verify the token
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    if (decoded.type !== 'access') {
      logger.warn('Socket connection attempted with invalid token type');
      return next(new Error('Invalid token type'));
    }

    // Attach user ID to socket for future use
    socket.data.userId = decoded.userId;
    
    logger.info(`Socket authenticated for user: ${decoded.userId}`);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Socket connection attempted with expired token');
      return next(new Error('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Socket connection attempted with invalid token');
      return next(new Error('Invalid token'));
    }
    
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

// Middleware to ensure socket is authenticated for specific events
export const requireSocketAuth = (socket: Socket, next: any) => {
  if (!socket.data.userId) {
    return next(new Error('Not authenticated'));
  }
  next();
};