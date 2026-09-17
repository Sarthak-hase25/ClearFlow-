const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * GET /api/health
 *
 * Returns the live operational status of the API and the MongoDB connection.
 * The database status reflects the actual Mongoose connection state — never faked.
 *
 * Mongoose readyState values:
 *   0 = disconnected
 *   1 = connected
 *   2 = connecting
 *   3 = disconnecting
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;

  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStatusMap[dbState] || 'unknown';
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy
      ? 'ArchFlow API is running'
      : 'ArchFlow API is running but database is not connected',
    data: {
      status: isHealthy ? 'ok' : 'degraded',
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
