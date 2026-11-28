import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

// Background Scheduler
import { startRssCronScheduler } from './workers/rssWorker.js';

const app = express();

// Trust reverse proxy (Nginx) for secure cookies and rate-limiting
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: [
      config.frontendUrl,
      'http://localhost:3010',
      'http://127.0.0.1:3010',
      'http://localhost:3000',
      'http://localhost:3100',
      'https://bnnewsgujarati.com',
      'https://www.bnnewsgujarati.com',
      'https://api.bnnewsgujarati.com',
      'https://bnnews.in',
      'https://www.bnnews.in',
      'https://admin.bnnews.in',
    ].filter(Boolean),
    credentials: true,
  })
);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login requests per windowMs
  message: { success: false, message: 'ઘણા બધા લૉગિન પ્રયાસો. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.' },
});
app.use(['/api/auth/login', '/auth/login'], authLimiter);

// Serve Static Uploads with Cross-Origin headers
app.use(
  ['/uploads', '/api/uploads'],
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(config.uploadDir),
  express.static(path.join(process.cwd(), 'uploads')),
  express.static(path.join(process.cwd(), 'backend', 'uploads'))
);

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BN News Gujarati API',
    environment: config.env,
  });
});

// API Routes - Mounted with both /api and root prefix to handle all proxy configurations
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api', publicRoutes);
app.use('/', publicRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API એન્ડપોઇન્ટ મળ્યો નથી (Route Not Found)' });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 BN News Gujarati API running on port ${config.port}`);
  console.log(`🌐 Environment: ${config.env}`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`===============================================`);

  // Start RSS background scheduler
  startRssCronScheduler();
});

export default app;
