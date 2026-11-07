'use strict';

require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const logger = require('./config/logger');
const requestLogger = require('./middlewares/requestLogger.middleware');
const { noSqlSanitize, xssSanitize } = require('./middlewares/sanitize.middleware');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { NotFoundError } = require('./common/errors');
const apiRoutes = require('./routes');

const app = express();

const allowedOrigins = [
  ...env.cors.allowedOrigins,
  'https://vendra-vfef.vercel.app',
  'https://vendra-rho.vercel.app',
];

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (env.isDev) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1') ||
    origin.startsWith('http://192.168.') ||
    origin.startsWith('http://10.') ||
    origin.startsWith('exp://')
  ) {
    return true;
  }
  // Allow all Vercel deployment and preview URLs (*.vercel.app)
  const host = origin.replace(/^https?:\/\//, '').split(':')[0];
  if (host.endsWith('.vercel.app')) {
    return true;
  }
  return false;
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'https://res.cloudinary.com', 'data:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Idempotency-Key'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(requestLogger);

app.use(noSqlSanitize);
app.use(xssSanitize);

app.use(globalLimiter);

app.use('/api/v1', apiRoutes);

app.use((req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = app;
