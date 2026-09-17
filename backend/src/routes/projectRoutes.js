'use strict';

const express = require('express');
const router  = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

// POST   /api/projects       — create project
// GET    /api/projects       — list all projects
router.route('/')
  .post(createProject)
  .get(getAllProjects);

// GET    /api/projects/:id   — get single project
// PUT    /api/projects/:id   — update project
// DELETE /api/projects/:id   — delete project & cascade cleanup
router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
