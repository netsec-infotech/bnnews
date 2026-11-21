import Redis from 'ioredis';
import { config } from './index.js';

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let redisWarningLogged = false;

try {
  redisClient = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    autoResubscribe: false,
    connectTimeout: 2000,
    retryStrategy(times) {
      if (times > 1) {
        // Discontinue retries if Redis is not running locally
        if (!redisWarningLogged) {
          redisWarningLogged = true;
          console.log('ℹ️ Redis is offline or not installed locally. BullMQ will gracefully use the in-process cron scheduler.');
        }
        return null;
      }
      return 1000;
    },
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis successfully (BullMQ Queue active)');
    isRedisAvailable = true;
  });

  redisClient.on('error', (_err) => {
    isRedisAvailable = false;
    if (!redisWarningLogged) {
      redisWarningLogged = true;
      console.log('ℹ️ Redis is offline or not installed locally. BullMQ will gracefully use the in-process cron scheduler.');
    }
  });
} catch (error) {
  if (!redisWarningLogged) {
    redisWarningLogged = true;
    console.log('ℹ️ Redis unavailable. Using automated in-process Cron fallback for RSS news.');
  }
}

export { redisClient, isRedisAvailable };
