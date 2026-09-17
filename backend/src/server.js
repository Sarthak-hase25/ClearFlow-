/**
 * ArchFlow Backend — server.js
 *
 * Startup sequence:
 *   1. Load environment variables
 *   2. Create Express app
 *   3. Configure middleware (JSON, CORS)
 *   4. Connect to MongoDB Atlas
 *   5. Register routes
 *   6. Register error handlers
 *   7. Start listening
 */

'use strict';

// ─── 1. Environment Variables ─────────────────────────────────────────────────
require('dotenv').config();

// ─── 2. Imports ───────────────────────────────────────────────────────────────
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/database');

// Middleware
const notFound     = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Routes
const healthRoutes        = require('./routes/health');
const projectRoutes       = require('./routes/projectRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const intelligenceRoutes  = require('./routes/intelligenceRoutes');

// ─── 3. Express App ───────────────────────────────────────────────────────────
const app = express();

// ─── 4. Core Middleware ───────────────────────────────────────────────────────

// CORS — restrict to the configured client origin
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['ETag'],
}));

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded bodies (for form submissions if needed)
app.use(express.urlencoded({ extended: true }));

// ─── 5. Routes ────────────────────────────────────────────────────────────────
app.use('/api/health',    healthRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api',           communicationRoutes); // handles /api/projects/:id/communications and /api/communications/:id
app.use('/api',           intelligenceRoutes);  // handles /api/projects/:id/intelligence, insights, actions, decisions, risks

// ─── 6. Error Handling ────────────────────────────────────────────────────────
// 404 for any unmatched /api/* route
app.use('/api', notFound);

// Central error handler (must be last)
app.use(errorHandler);

// ─── 7. Server Startup ────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;

async function startServer() {
  try {
    // Connect to MongoDB before opening the server port
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀  ArchFlow API running on http://localhost:${PORT}`);
      console.log(`📡  Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐  CORS origin:  ${clientUrl}`);
      console.log(`⚙️   Environment:  ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('\n💥  Server failed to start:', err.message);
    process.exit(1);
  }
}

startServer();
