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

// 404 handler for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Handle React routing, return all requests to React app
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('[App] Failed to serve index.html:', err.message);
      if (!res.headersSent) {
        res.status(500).send('Application failed to load. Please try again later.');
      }
    }
  });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = ENV.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Unknown error';

  console.error(`[Error] ${statusCode} -`, err.message || err);
  if (ENV.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  if (!res.headersSent) {
    res.status(statusCode).json({ error: message });
  }
});

export default app;
