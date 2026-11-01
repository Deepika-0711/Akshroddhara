import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import documentRoutes, { flexibleUpload } from './routes/documentRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';
import recoveryRoutes from './routes/recoveryRoutes.js';
import { enhanceDocument } from './controllers/documentController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// CORS configuration for development frontend
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
);

// Sensible payload size limits for JSON and URL-encoded data
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Aksharoddhaara API (ಅಕ್ಷರೋದ್ಧಾರ)',
    tagline: 'ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ',
    documentation: '/api/health',
  });
});

// Primary Endpoint explicitly requested: POST /api/enhance
app.post('/api/enhance', flexibleUpload, enhanceDocument);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/recovery', recoveryRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
