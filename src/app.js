require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectToDatabase } = require('./db/mongo');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const lessonsRouter = require('./routes/lessons');
const ordersRouter = require('./routes/orders');

const app = express();

// Security headers
app.use(helmet());

// CORS
const corsOriginsEnv = process.env.CORS_ORIGINS || '';
const allowedOrigins = corsOriginsEnv
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Rate limiting (basic)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '1mb' }));

// Logger
app.use(logger);

// Static files for lesson images
const publicDir = path.join(__dirname, '..', 'public');
app.use('/public', express.static(publicDir));

// Custom image route to return JSON if missing
app.get('/images/:filename', (req, res) => {
  // Enable CORS for images (cross-origin frontend)
  res.set('Access-Control-Allow-Origin', '*');
  const filePath = path.join(publicDir, 'images', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Routes
app.use('/lessons', lessonsRouter);
// top-level alias required by spec
app.get('/search', require('./routes/lessons').searchHandler);
app.use('/orders', ordersRouter);

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
