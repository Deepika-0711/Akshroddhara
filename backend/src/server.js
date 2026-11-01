import app from './app.js';
import { terminateWorker } from './services/ocrService.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara) Backend Server Started  `);
  console.log(`  Tagline: ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ                 `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Listening on: http://localhost:${PORT}             `);
  console.log(`  Health Check: http://localhost:${PORT}/api/health  `);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  await terminateWorker();
  server.close(() => {
    console.log('HTTP server closed cleanly.');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server...');
  await terminateWorker();
  server.close(() => {
    console.log('HTTP server closed cleanly.');
    process.exit(0);
  });
});

export default server;
