import app from './app';
import { ENV } from './config/env';

const PORT = parseInt(ENV.PORT, 10);

if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`[Server] Invalid PORT value: "${ENV.PORT}". Must be a number between 1 and 65535.`);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${ENV.NODE_ENV}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} is already in use. Choose a different port or stop the other process.`);
  } else if (error.code === 'EACCES') {
    console.error(`[Server] Permission denied for port ${PORT}. Try a port above 1024 or run with elevated privileges.`);
  } else {
    console.error('[Server] Failed to start:', error.message);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
  process.exit(1);
});
