'use strict';

const mongoose      = require('mongoose');
const Project       = require('../models/Project');
const Communication = require('../models/Communication');
const Insight       = require('../models/Insight');
const Action        = require('../models/Action');
const Decision      = require('../models/Decision');
const Risk          = require('../models/Risk');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true if `id` is a syntactically valid MongoDB ObjectId. */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/** Fields callers are NOT allowed to set directly. */
const BLOCKED_FIELDS = ['_id', 'createdAt', 'updatedAt', '__v'];

/** Strips blocked fields from a plain object. */
function sanitize(body) {
  const clean = { ...body };
  BLOCKED_FIELDS.forEach(f => delete clean[f]);
  return clean;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/projects
 * Create a new project.
 */
async function createProject(req, res, next) {
  try {
    const data = sanitize(req.body);
    const project = await Project.create(data);

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects
 * Return all projects, newest first.
 */
async function getAllProjects(req, res, next) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/:id
 * Return a single project by ID.
 */
async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/projects/:id
 * Update allowed project fields.
 */
async function updateProject(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const updates = sanitize(req.body);

    const project = await Project.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,          // return the updated document
        runValidators: true, // apply schema validation on update
      }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/projects/:id
 * Delete a project and cascade delete all associated communications,
 * insights, actions, decisions, and risks to preserve data integrity.
 */
async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Cascade delete all dependent intelligence and communications
    await Promise.all([
      Communication.deleteMany({ projectId: id }),
      Insight.deleteMany({ projectId: id }),
      Action.deleteMany({ projectId: id }),
      Decision.deleteMany({ projectId: id }),
      Risk.deleteMany({ projectId: id }),
    ]);

    res.json({
      success: true,
      message: 'Project deleted',
      data: { id: project._id },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
