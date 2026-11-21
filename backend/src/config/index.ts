import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bn_news_gujarati?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'bnnews_secret_jwt_key_development_2026_gujarati_secure_token',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '262144000', 10), // 250 MB
};
