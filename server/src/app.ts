import express from 'express';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env';
import './config/database';
import authRoutes from './routes/auth';

const app = express();

// Middleware
app.use(cors({
  origin: ENV.NODE_ENV === 'production'
    ? true
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);

// Serve static files from the React app
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// Handle React routing, return all requests to React app
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({
    error: ENV.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

export default app;
