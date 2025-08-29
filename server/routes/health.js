import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bahr Checker API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Bahr Checker Backend API',
    version: '1.0.0',
    endpoints: {
      'POST /api/check-bahr': 'Analyze poetry text for Bahr patterns',
      'GET /api/analyses': 'Get all stored analyses',
      'GET /api/health': 'Health check'
    }
  });
});

export default router;
