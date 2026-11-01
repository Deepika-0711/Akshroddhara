/**
 * Health controller providing application runtime status.
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Aksharoddhaara (ಅಕ್ಷರೋದ್ಧಾರ) API',
    tagline: 'ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};
