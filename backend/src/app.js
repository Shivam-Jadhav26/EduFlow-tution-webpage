require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const batchRoutes = require('./routes/batches');
const timetableRoutes = require('./routes/timetable');
const attendanceRoutes = require('./routes/attendance');
const testRoutes = require('./routes/tests');
const resultRoutes = require('./routes/results');
const doubtRoutes = require('./routes/doubts');
const notificationRoutes = require('./routes/notifications');
const feeRoutes = require('./routes/fees');
const announcementRoutes = require('./routes/announcements');
const analyticsRoutes = require('./routes/analytics');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const assignmentRoutes = require('./routes/assignments');
const sourceRoutes = require('./routes/sources');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow Cloudinary images
  contentSecurityPolicy: false, // disable CSP for dev flexibility; enable in production
}));

// ── HTTP Request Logger ───────────────────────────────────────────────────────
app.use(morgan(isProd ? 'combined' : 'dev'));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Global: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// Auth-specific: 10 attempts per 15 minutes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // In production, reject requests with no origin
      // In development, allow no-origin requests (curl, Postman)
      if (!origin && !isProd) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/sources', sourceRoutes);

// ── 404 Fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
