'use strict';

const express = require('express');
const router  = express.Router();

const {
  getProjectIntelligence,
  getProjectInsights,
  getProjectActions,
  getProjectDecisions,
  getProjectRisks,
  getInsightById,
} = require('../controllers/intelligenceController');

// ── Project-scoped intelligence routes ────────────────────────────────────────
// Mounted under /api — full paths are:
//   GET /api/projects/:projectId/intelligence
//   GET /api/projects/:projectId/insights
//   GET /api/projects/:projectId/actions
//   GET /api/projects/:projectId/decisions
//   GET /api/projects/:projectId/risks
router.get('/projects/:projectId/intelligence', getProjectIntelligence);
router.get('/projects/:projectId/insights',     getProjectInsights);
router.get('/projects/:projectId/actions',      getProjectActions);
router.get('/projects/:projectId/decisions',    getProjectDecisions);
router.get('/projects/:projectId/risks',        getProjectRisks);

// ── Single insight route ──────────────────────────────────────────────────────
//   GET /api/insights/:id
router.get('/insights/:id', getInsightById);

module.exports = router;
