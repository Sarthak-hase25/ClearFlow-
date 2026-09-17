/**
 * Model import verification script — development only.
 *
 * Verifies that all Mongoose schemas compile correctly and that
 * every model can be imported without errors.
 *
 * Run:  node scripts/verify-models.js
 *
 * This script does NOT write any data to the database.
 * It is safe to run against a live Atlas cluster.
 */
'use strict';

require('dotenv').config();

console.log('\n🔍  ArchFlow — Model Verification\n');

// ─── 1. Import all models ─────────────────────────────────────────────────────
const models = {
  User:          () => require('../src/models/User'),
  Project:       () => require('../src/models/Project'),
  Communication: () => require('../src/models/Communication'),
  Insight:       () => require('../src/models/Insight'),
  Action:        () => require('../src/models/Action'),
  Decision:      () => require('../src/models/Decision'),
  Risk:          () => require('../src/models/Risk'),
};

let allPassed = true;

for (const [name, loader] of Object.entries(models)) {
  try {
    const Model = loader();

    // Check the model has an associated Mongoose schema
    if (!Model.schema) throw new Error('No schema found on model');

    // Print the field names defined in the schema
    const fields = Object.keys(Model.schema.paths).filter(f => !f.startsWith('_'));
    console.log(`  ✅  ${name.padEnd(14)} — fields: ${fields.join(', ')}`);
  } catch (err) {
    console.error(`  ❌  ${name.padEnd(14)} — FAILED: ${err.message}`);
    allPassed = false;
  }
}

console.log('\n' + (allPassed
  ? '✅  All models imported and compiled successfully.'
  : '❌  One or more models failed to compile.'));

console.log('\n⚠️   No database writes were performed.\n');
process.exit(allPassed ? 0 : 1);
