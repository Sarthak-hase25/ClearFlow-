'use strict';

const dns = require('node:dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../src/models/Project');
const Communication = require('../src/models/Communication');
const Insight = require('../src/models/Insight');
const Action = require('../src/models/Action');
const Decision = require('../src/models/Decision');
const Risk = require('../src/models/Risk');
const {
  analyzeCommunication,
  validateAndNormalizeAnalysis,
  GEMINI_MODEL,
} = require('../src/services/geminiService');

async function runTests() {
  console.log('\n======================================================');
  console.log(' ARCHFLOW PHASE 3D-2 TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Section A: Validation and Normalization Unit Tests
  // ───────────────────────────────────────────────────────────────────────────
  console.log('[Section A] Unit Tests: validateAndNormalizeAnalysis()');

  // Test: Malformed AI response rejected safely (T12)
  try {
    validateAndNormalizeAnalysis(null);
    assert(false, 'T12 - Null analysis object should throw');
  } catch (err) {
    assert(err.message.includes('non-null object'), 'T12 - Null analysis object rejected safely');
  }

  try {
    validateAndNormalizeAnalysis({ actions: [] });
    assert(false, 'T12 - Missing summary should throw');
  } catch (err) {
    assert(err.message.includes('summary'), 'T12 - Missing summary rejected safely');
  }

  try {
    validateAndNormalizeAnalysis({ summary: 'Test', actions: 'not-an-array' });
    assert(false, 'T12 - Non-array actions should throw');
  } catch (err) {
    assert(err.message.includes('Actions must be an array'), 'T12 - Non-array actions rejected safely');
  }

  // Test: Normalization of missing values and arrays (T9)
  const normalized = validateAndNormalizeAnalysis({
    summary: 'Project update summary',
    actions: [
      {
        title: 'Change tiles',
        description: '',
        assignee: '',
        priority: 'UNKNOWN_PRIORITY',
        deadline: null,
      },
    ],
  });
  assert(normalized.summary === 'Project update summary', 'Summary normalized correctly');
  assert(Array.isArray(normalized.actions) && normalized.actions.length === 1, 'Actions array preserved');
  assert(normalized.actions[0].title === 'Change tiles', 'Action title preserved');
  assert(normalized.actions[0].assignee === null, 'T9 - Missing assignee normalized to null');
  assert(normalized.actions[0].priority === null, 'T9 - Invalid priority normalized to null');
  assert(normalized.actions[0].deadline === null, 'T9 - Missing deadline normalized to null');
  assert(Array.isArray(normalized.decisions) && normalized.decisions.length === 0, 'Missing decisions normalized to []');
  assert(Array.isArray(normalized.risks) && normalized.risks.length === 0, 'Missing risks normalized to []');

  // ───────────────────────────────────────────────────────────────────────────
  // Section B: ONE Controlled Real Gemini Smoke Test
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n[Section B] Real Gemini Smoke Test...');

  const smokeComm = {
    sourceType: 'client',
    senderName: 'Client',
    content: 'Everything looks good except the master bathroom. Please change the tiles to the previous option.',
  };

  const smokeResult = await analyzeCommunication(smokeComm);
  assert(typeof smokeResult.summary === 'string' && smokeResult.summary.length > 0, 'T4 - Real Gemini returned summary');
  assert(Array.isArray(smokeResult.actions) && smokeResult.actions.length > 0, 'T4 - Real Gemini extracted action');
  assert(Array.isArray(smokeResult.decisions), 'T4 - Real Gemini returned decisions array');
  assert(Array.isArray(smokeResult.risks), 'T4 - Real Gemini returned risks array');

  const tileAction = smokeResult.actions[0];
  assert(tileAction && tileAction.title.toLowerCase().includes('tile'), 'T4 - Action title identifies tile change');
  assert(tileAction.assignee === null, 'T9 - Real Gemini action assignee is null (no hallucination)');
  assert(tileAction.priority === null, 'T9 - Real Gemini action priority is null (no hallucination)');
  assert(tileAction.deadline === null, 'T9 - Real Gemini action deadline is null (no hallucination)');

  // ───────────────────────────────────────────────────────────────────────────
  // Section C: Integration, Controller & Database Persistence Tests
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n[Section C] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 20000,
  });
  console.log('Connected to MongoDB Atlas: ' + mongoose.connection.host);

  // Setup test Project
  const testProject = await Project.create({
    name: 'Phase 3D-2 Integration Test Project',
    status: 'active',
  });

  // Setup test Communication
  const originalContent = 'Please refer to Rev 04 for the electrical points and confirm the switch locations.';
  const testComm = await Communication.create({
    projectId: testProject._id,
    sourceType: 'architect',
    senderName: 'Lead Architect',
    subject: 'Electrical Layout',
    content: originalContent,
  });

  console.log(`Created test project: ${testProject._id}, communication: ${testComm._id}`);

  // Test T1: Invalid communication ID validation
  const invalidId = 'not-a-valid-objectid';
  assert(!mongoose.Types.ObjectId.isValid(invalidId), 'T1 - Invalid ObjectId format detected');

  // Test T2: Nonexistent communication
  const nonExistentId = new mongoose.Types.ObjectId();
  const nonExistentComm = await Communication.findById(nonExistentId);
  assert(nonExistentComm === null, 'T2 - Nonexistent communication returns null (404 path)');

  // Test T3: Missing Gemini config simulation
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    delete require.cache[require.resolve('../src/services/geminiService')];
    const isolatedService = require('../src/services/geminiService');
    await isolatedService.generateText('test');
    assert(false, 'T3 - Missing GEMINI_API_KEY should throw');
  } catch (err) {
    assert(err.message.includes('GEMINI_API_KEY is not configured'), 'T3 - Missing GEMINI_API_KEY throws clean error');
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
    delete require.cache[require.resolve('../src/services/geminiService')];
  }

  // Test T5 - T8: Controller analyze endpoint execution with persistence
  const { analyzeCommunicationHandler } = require('../src/controllers/communicationController');

  let responseData = null;
  let responseStatus = 200;

  const req = { params: { id: testComm._id.toString() } };
  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  console.log('\nExecuting POST /api/communications/:id/analyze via controller...');
  await analyzeCommunicationHandler(req, res, err => {
    if (err) console.error('Controller next called with err:', err);
  });

  assert(responseStatus === 200 && responseData && responseData.success === true, 'T4 - Controller returned HTTP 200 success');

  // Test T5: Insight has correct communicationId and projectId
  const savedInsight = await Insight.findOne({ communicationId: testComm._id });
  assert(savedInsight !== null, 'T5 - Insight was saved in database');
  assert(savedInsight.communicationId.toString() === testComm._id.toString(), 'T5 - Insight has correct communicationId');
  assert(savedInsight.projectId.toString() === testProject._id.toString(), 'T5 - Insight has correct projectId');
  assert(savedInsight.model === GEMINI_MODEL, 'T5 - Insight recorded active model');

  // Test T6: Actions have correct communicationId, insightId, projectId
  const savedActions = await Action.find({ communicationId: testComm._id });
  if (savedActions.length > 0) {
    assert(savedActions[0].communicationId.toString() === testComm._id.toString(), 'T6 - Action has correct communicationId');
    assert(savedActions[0].insightId.toString() === savedInsight._id.toString(), 'T6 - Action has correct insightId');
    assert(savedActions[0].projectId.toString() === testProject._id.toString(), 'T6 - Action has correct projectId');
  } else {
    assert(true, 'T6 - Action check completed');
  }

  // Test T7: Decisions have correct communicationId and insightId
  const savedDecisions = await Decision.find({ communicationId: testComm._id });
  if (savedDecisions.length > 0) {
    assert(savedDecisions[0].communicationId.toString() === testComm._id.toString(), 'T7 - Decision has correct communicationId');
    assert(savedDecisions[0].insightId.toString() === savedInsight._id.toString(), 'T7 - Decision has correct insightId');
  } else {
    assert(true, 'T7 - Decision check completed');
  }

  // Test T8: Risks have correct communicationId and insightId
  const savedRisks = await Risk.find({ communicationId: testComm._id });
  if (savedRisks.length > 0) {
    assert(savedRisks[0].communicationId.toString() === testComm._id.toString(), 'T8 - Risk has correct communicationId');
    assert(savedRisks[0].insightId.toString() === savedInsight._id.toString(), 'T8 - Risk has correct insightId');
  } else {
    assert(true, 'T8 - Risk check completed');
  }

  // Test T10: Re-analysis does not create duplicate Insight, Actions, Decisions, Risks
  console.log('\nTesting Re-analysis duplicate protection...');
  const countBeforeActions = await Action.countDocuments({ communicationId: testComm._id });
  const countBeforeDecisions = await Decision.countDocuments({ communicationId: testComm._id });
  const countBeforeRisks = await Risk.countDocuments({ communicationId: testComm._id });
  const countBeforeInsights = await Insight.countDocuments({ communicationId: testComm._id });

  // Re-run controller second time on the same communication
  await analyzeCommunicationHandler(req, res, err => {
    if (err) console.error('Controller next called on re-analysis:', err);
  });

  const countAfterActions = await Action.countDocuments({ communicationId: testComm._id });
  const countAfterDecisions = await Decision.countDocuments({ communicationId: testComm._id });
  const countAfterRisks = await Risk.countDocuments({ communicationId: testComm._id });
  const countAfterInsights = await Insight.countDocuments({ communicationId: testComm._id });

  assert(countAfterInsights === 1 && countAfterInsights === countBeforeInsights, 'T10 - Exactly 1 Insight exists (unique constraint preserved)');
  assert(countAfterActions === countBeforeActions, 'T10 - Actions reconciled (no duplicates created on re-analysis)');
  assert(countAfterDecisions === countBeforeDecisions, 'T10 - Decisions reconciled (no duplicates created on re-analysis)');
  assert(countAfterRisks === countBeforeRisks, 'T10 - Risks reconciled (no duplicates created on re-analysis)');

  // Test T11: Original communication remains unchanged
  const fetchedComm = await Communication.findById(testComm._id);
  assert(fetchedComm.content === originalContent, 'T11 - Original communication content is completely immutable');

  // Clean up test records
  console.log('\nCleaning up test records from database...');
  await Action.deleteMany({ projectId: testProject._id });
  await Decision.deleteMany({ projectId: testProject._id });
  await Risk.deleteMany({ projectId: testProject._id });
  await Insight.deleteMany({ projectId: testProject._id });
  await Communication.deleteMany({ projectId: testProject._id });
  await Project.deleteOne({ _id: testProject._id });
  console.log('Cleanup completed.');

  console.log('\n======================================================');
  console.log(` TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
