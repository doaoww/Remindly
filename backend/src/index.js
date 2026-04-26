require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const flashcardsRoutes = require('./routes/flashcards.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const tagsRoutes = require('./routes/tags.routes');

const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, try again later.' },
});
app.use(limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, try again later.' },
});

// ── Health Check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tags', tagsRoutes);
app.use(cors({
  origin: ['http://localhost:3000', 'http://172.20.10.4:3000'],
  credentials: true,
}));

// ── Error Handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Remindly API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;