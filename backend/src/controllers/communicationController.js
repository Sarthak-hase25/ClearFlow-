'use strict';

const mongoose      = require('mongoose');
const Project       = require('../models/Project');
const Communication = require('../models/Communication');
const Insight       = require('../models/Insight');
const Action        = require('../models/Action');
const Decision      = require('../models/Decision');
const Risk          = require('../models/Risk');
const { analyzeCommunication, GEMINI_MODEL } = require('../services/geminiService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const BLOCKED_FIELDS = ['_id', 'projectId', 'createdAt', 'updatedAt', '__v'];

function sanitize(body) {
  const clean = { ...body };
  BLOCKED_FIELDS.forEach(f => delete clean[f]);
  return clean;
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

/**
 * Persists the validated analysis (Insight, Actions, Decisions, Risks) with
 * duplicate protection and transactional / rollback safety.
 */
async function persistAnalysis(communication, analysis) {
  let session = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (txErr) {
    if (session) {
      session.endSession();
      session = null;
    }
  }

  const sessionOpt = useTransaction ? { session } : {};

  try {
    // 1. Find or create the 1:1 Insight for this communication
    let insight = await Insight.findOne(
      { communicationId: communication._id },
      null,
      sessionOpt
    );

    if (insight) {
      // Re-analysis: Update existing insight
      insight.summary = analysis.summary;
      insight.model = GEMINI_MODEL;
      insight.analyzedAt = new Date();
      await insight.save(sessionOpt);

      // Clean up previous AI results to prevent duplicates
      await Action.deleteMany({ communicationId: communication._id }, sessionOpt);
      await Decision.deleteMany({ communicationId: communication._id }, sessionOpt);
      await Risk.deleteMany({ communicationId: communication._id }, sessionOpt);
    } else {
      if (useTransaction) {
        const created = await Insight.create(
          [
            {
              projectId: communication.projectId,
              communicationId: communication._id,
              summary: analysis.summary,
              model: GEMINI_MODEL,
              analyzedAt: new Date(),
            },
          ],
          sessionOpt
        );
        insight = created[0];
      } else {
        insight = await Insight.create({
          projectId: communication.projectId,
          communicationId: communication._id,
          summary: analysis.summary,
          model: GEMINI_MODEL,
          analyzedAt: new Date(),
        });
      }
    }

    // 2. Persist Actions
    let actions = [];
    if (analysis.actions && analysis.actions.length > 0) {
      const actionDocs = analysis.actions.map(a => ({
        projectId: communication.projectId,
        communicationId: communication._id,
        insightId: insight._id,
        title: a.title,
        description: a.description || null,
        assignee: a.assignee || null,
        priority: a.priority || null,
        deadline: a.deadline ? new Date(a.deadline) : null,
        status: 'pending',
      }));
      actions = await Action.insertMany(actionDocs, sessionOpt);
    }

    // 3. Persist Decisions
    let decisions = [];
    if (analysis.decisions && analysis.decisions.length > 0) {
      const decisionDocs = analysis.decisions.map(d => ({
        projectId: communication.projectId,
        communicationId: communication._id,
        insightId: insight._id,
        title: d.title,
        description: d.description || null,
        decidedBy: d.decidedBy || null,
        decisionDate: d.decisionDate ? new Date(d.decisionDate) : null,
        status: 'open',
      }));
      decisions = await Decision.insertMany(decisionDocs, sessionOpt);
    }

    // 4. Persist Risks
    let risks = [];
    if (analysis.risks && analysis.risks.length > 0) {
      const riskDocs = analysis.risks.map(r => ({
        projectId: communication.projectId,
        communicationId: communication._id,
        insightId: insight._id,
        title: r.title,
        description: r.description || null,
        severity: r.severity || null,
        impact: r.impact || null,
        status: 'open',
      }));
      risks = await Risk.insertMany(riskDocs, sessionOpt);
    }

    if (useTransaction) {
      await session.commitTransaction();
    }

    return { insight, actions, decisions, risks };
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    } else {
      // Safe fallback rollback: delete any partial results created for this communication
      try {
        await Action.deleteMany({ communicationId: communication._id });
        await Decision.deleteMany({ communicationId: communication._id });
        await Risk.deleteMany({ communicationId: communication._id });
      } catch (cleanupErr) {
        console.error('[analyze-controller] Fallback rollback error:', cleanupErr.message);
      }
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/projects/:projectId/communications
 *
 * Create a communication under a project.
 * The `content` field is stored exactly as submitted — no AI processing here.
 */
async function createCommunication(req, res, next) {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await requireProject(projectId, res);
    if (!project) return; // response already sent

    const data = sanitize(req.body);

    const communication = await Communication.create({
      ...data,
      projectId,
    });

    res.status(201).json({ success: true, data: communication });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/:projectId/communications
 *
 * Return all communications for a project, newest first.
 */
async function getProjectCommunications(req, res, next) {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await requireProject(projectId, res);
    if (!project) return;

    const [communications, insights] = await Promise.all([
      Communication.find({ projectId }).sort({ createdAt: -1 }).lean(),
      Insight.find({ projectId }).select('_id communicationId').lean(),
    ]);

    const insightMap = new Map(
      insights.map(i => [i.communicationId.toString(), i._id.toString()])
    );

    const enrichedComms = communications.map(c => ({
      ...c,
      hasInsight: insightMap.has(c._id.toString()),
      insightId: insightMap.get(c._id.toString()) || null,
    }));

    res.json({ success: true, data: enrichedComms });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/communications/:id
 *
 * Return a single communication by its own ID.
 */
async function getCommunicationById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid communication ID' });
    }

    const communication = await Communication.findById(id).lean();
    if (!communication) {
      return res.status(404).json({ success: false, message: 'Communication not found' });
    }

    const insight = await Insight.findOne({ communicationId: id }).select('_id').lean();
    const enrichedComm = {
      ...communication,
      hasInsight: Boolean(insight),
      insightId: insight ? insight._id : null,
    };

    res.json({ success: true, data: enrichedComm });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/communications/:id
 *
 * Delete a single communication and cascade deletion to dependent AI records
 * (Insight, Actions, Decisions, Risks) to maintain source traceability integrity.
 */
async function deleteCommunication(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid communication ID' });
    }

    const communication = await Communication.findByIdAndDelete(id);
    if (!communication) {
      return res.status(404).json({ success: false, message: 'Communication not found' });
    }

    // Cascade delete any associated AI intelligence records
    await Promise.all([
      Insight.deleteMany({ communicationId: id }),
      Action.deleteMany({ communicationId: id }),
      Decision.deleteMany({ communicationId: id }),
      Risk.deleteMany({ communicationId: id }),
    ]);

    res.json({
      success: true,
      message: 'Communication deleted',
      data: { id: communication._id },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/communications/:id/analyze
 *
 * Runs Gemini AI communication analysis, extracts Actions, Decisions, and Risks,
 * creates/updates the 1:1 Insight record, and persists all extracted items with
 * full source traceability.
 */
async function analyzeCommunicationHandler(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid communication ID' });
    }

    const communication = await Communication.findById(id);
    if (!communication) {
      return res.status(404).json({ success: false, message: 'Communication not found' });
    }

    // Call the Gemini service layer
    let analysis;
    try {
      analysis = await analyzeCommunication(communication);
    } catch (aiErr) {
      console.error('[analyze-controller] AI analysis error:', aiErr.message);
      const isConfigError = aiErr.message.includes('GEMINI_API_KEY');
      return res.status(isConfigError ? 500 : 502).json({
        success: false,
        message: isConfigError
          ? 'Gemini API key is not configured on the server'
          : 'Failed to analyze communication with Gemini: ' + aiErr.message,
      });
    }

    // Persist Insight, Actions, Decisions, and Risks with duplicate protection
    const persisted = await persistAnalysis(communication, analysis);

    return res.json({
      success: true,
      data: {
        communication,
        insight: persisted.insight,
        actions: persisted.actions,
        decisions: persisted.decisions,
        risks: persisted.risks,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCommunication,
  getProjectCommunications,
  getCommunicationById,
  deleteCommunication,
  analyzeCommunicationHandler,
};
