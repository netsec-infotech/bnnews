import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5010', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bn_news_gujarati?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'bnnews_secret_jwt_key_development_2026_gujarati_secure_token',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5010',
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  maxFileSize: Math.max(parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), 26214400), // At least 25 MB (default 50 MB)
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
};
