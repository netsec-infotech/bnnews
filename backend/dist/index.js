"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const index_js_1 = require("./config/index.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
// Import Routes
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const publicRoutes_js_1 = __importDefault(require("./routes/publicRoutes.js"));
// Background Scheduler
const rssWorker_js_1 = require("./workers/rssWorker.js");
const app = (0, express_1.default)();
// Trust reverse proxy (Nginx) for secure cookies and rate-limiting
app.set('trust proxy', 1);
// Security Headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: [
        index_js_1.config.frontendUrl,
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
}));
// Request Parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (index_js_1.config.env === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Rate Limiting for Auth
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 login requests per windowMs
    message: { success: false, message: 'ઘણા બધા લૉગિન પ્રયાસો. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.' },
});
app.use(['/api/auth/login', '/auth/login'], authLimiter);
// Serve Static Uploads with Cross-Origin headers
app.use(['/uploads', '/api/uploads'], (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(index_js_1.config.uploadDir), express_1.default.static(path_1.default.join(process.cwd(), 'uploads')), express_1.default.static(path_1.default.join(process.cwd(), 'backend', 'uploads')));
// Health Check
app.get(['/api/health', '/health'], (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'BN News Gujarati API',
        environment: index_js_1.config.env,
    });
});
// API Routes - Mounted with both /api and root prefix to handle all proxy configurations
app.use('/api/auth', authRoutes_js_1.default);
app.use('/auth', authRoutes_js_1.default);
app.use('/api/admin', adminRoutes_js_1.default);
app.use('/admin', adminRoutes_js_1.default);
app.use('/api', publicRoutes_js_1.default);
app.use('/', publicRoutes_js_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API એન્ડપોઇન્ટ મળ્યો નથી (Route Not Found)' });
});
// Centralized Error Handling
app.use(errorHandler_js_1.errorHandler);
// Start Server
const server = app.listen(index_js_1.config.port, () => {
    console.log(`===============================================`);
    console.log(`🚀 BN News Gujarati API running on port ${index_js_1.config.port}`);
    console.log(`🌐 Environment: ${index_js_1.config.env}`);
    console.log(`📡 URL: http://localhost:${index_js_1.config.port}`);
    console.log(`===============================================`);
    // Start RSS background scheduler
    (0, rssWorker_js_1.startRssCronScheduler)();
});
exports.default = app;
