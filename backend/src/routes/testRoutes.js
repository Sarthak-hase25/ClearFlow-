'use strict';

/**
 * DEV/TEST ROUTES — NOT production features.
 *
 * These routes exist only to validate integrations during development.
 * They should be removed or placed behind auth before any public deployment.
 */

const express = require('express');
const router  = express.Router();

const { testGeminiConnection } = require('../controllers/geminiTestController');

// GET /api/test/gemini
router.get('/gemini', testGeminiConnection);

module.exports = router;
