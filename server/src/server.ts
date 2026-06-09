import app from './app';
import { ENV } from './config/env';

const PORT = parseInt(ENV.PORT, 10);

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${ENV.NODE_ENV}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});
