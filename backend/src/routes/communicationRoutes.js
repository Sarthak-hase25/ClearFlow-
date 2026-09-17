'use strict';

const express = require('express');
const router  = express.Router();

const {
  createCommunication,
  getProjectCommunications,
  getCommunicationById,
  deleteCommunication,
  analyzeCommunicationHandler,
} = require('../controllers/communicationController');

// ── Project-scoped routes ─────────────────────────────────────────────────────
// Mounted under /api — full paths are:
//   POST /api/projects/:projectId/communications
//   GET  /api/projects/:projectId/communications
router.route('/projects/:projectId/communications')
  .post(createCommunication)
  .get(getProjectCommunications);

// ── Individual communication routes ──────────────────────────────────────────
//   GET    /api/communications/:id
//   DELETE /api/communications/:id
router.route('/communications/:id')
  .get(getCommunicationById)
  .delete(deleteCommunication);

// ── Real Gemini AI analysis route (Phase 3D-2) ────────────────────────────────
//   POST   /api/communications/:id/analyze
router.post('/communications/:id/analyze', analyzeCommunicationHandler);

module.exports = router;
