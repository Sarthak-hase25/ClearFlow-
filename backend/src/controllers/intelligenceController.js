'use strict';

const mongoose = require('mongoose');
const Project  = require('../models/Project');
const Insight  = require('../models/Insight');
const Action   = require('../models/Action');
const Decision = require('../models/Decision');
const Risk     = require('../models/Risk');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/** Verify a project exists; returns the project or sends 404. */
async function requireProject(projectId, res) {
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return null;
  }
  return project;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/projects/:projectId/intelligence
 *
 * Return all AI intelligence records (Insights, Actions, Decisions, Risks)
 * strictly belonging to the requested project in a single response.
 */
async function getProjectIntelligence(req, res, next) {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await requireProject(projectId, res);
    if (!project) return;

    const [insights, actions, decisions, risks] = await Promise.all([
      Insight.find({ projectId }).sort({ createdAt: -1 }),
      Action.find({ projectId }).sort({ createdAt: -1 }),
      Decision.find({ projectId }).sort({ createdAt: -1 }),
      Risk.find({ projectId }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        insights,
        actions,
        decisions,
        risks,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/:projectId/insights
 *
 * Return all Insights for a project.
 */
async function getProjectInsights(req, res, next) {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await requireProject(projectId, res);
    if (!project) return;

    const insights = await Insight.find({ projectId }).sort({ createdAt: -1 });

    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/:projectId/actions
 *
 * Return all Actions for a project.
 */
async function getProjectActions(req, res, next) {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await requireProject(projectId, res);
    if (!project) return;

    const actions = await Action.find({ projectId }).sort({ createdAt: -1 });

    res.json({ success: true, data: actions });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/:projectId/decisions
 *
 * Return all Decisions for a project.
 */
async function getProjectDecisions(req, res, next) {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await requireProject(projectId, res);
    if (!project) return;

    const decisions = await Decision.find({ projectId }).sort({ createdAt: -1 });

    res.json({ success: true, data: decisions });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/:projectId/risks
 *
 * Return all Risks for a project.
 */
async function getProjectRisks(req, res, next) {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await requireProject(projectId, res);
    if (!project) return;

    const risks = await Risk.find({ projectId }).sort({ createdAt: -1 });

    res.json({ success: true, data: risks });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/insights/:id
 *
 * Return a single Insight by its own ID or by its communicationId.
 */
async function getInsightById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid insight ID' });
    }

    let insight = await Insight.findById(id);
    if (!insight) {
      // Fallback: check if id is a communicationId
      insight = await Insight.findOne({ communicationId: id });
    }

    if (!insight) {
      return res.status(404).json({ success: false, message: 'Insight not found' });
    }

    res.json({ success: true, data: insight });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/actions/:id/status
 *
 * Update an Action's status ('pending', 'in-progress', 'completed').
 */
async function updateActionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid action ID' });
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const action = await Action.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!action) {
      return res.status(404).json({ success: false, message: 'Action not found' });
    }

    res.json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/decisions/:id/status
 *
 * Update a Decision's status ('open', 'decided', or 'confirmed').
 */
async function updateDecisionStatus(req, res, next) {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid decision ID' });
    }

    // Map frontend 'confirmed' to schema 'decided'
    if (status === 'confirmed') status = 'decided';
    if (status === 'pending') status = 'open';

    const validStatuses = ['open', 'decided'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: open, decided, confirmed',
      });
    }

    const decision = await Decision.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!decision) {
      return res.status(404).json({ success: false, message: 'Decision not found' });
    }

    res.json({ success: true, data: decision });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectIntelligence,
  getProjectInsights,
  getProjectActions,
  getProjectDecisions,
  getProjectRisks,
  getInsightById,
  updateActionStatus,
  updateDecisionStatus,
};
