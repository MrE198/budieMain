import { createClient } from 'redis';
import { config } from './env';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: config.REDIS_URL,
});

redisClient.on('error', (err: Error) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};