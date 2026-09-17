'use strict';

const mongoose = require('mongoose');

/**
 * Insight
 *
 * Represents the AI-generated analysis produced from a single Communication.
 * One Communication → One Insight (1:1 relationship).
 *
 * - Insight stores the AI-generated summary for a Communication.
 * - Gemini analysis is implemented in Phase 3D-2.
 * - Each Insight is linked to its source Communication through communicationId.
 *
 * The extracted Action, Decision, and Risk documents each reference this
 * Insight, creating a full traceability chain:
 *
 *   Action / Decision / Risk → Insight → Communication → original content
 */
const insightSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'projectId is required'],
      index: true,
    },

    communicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      required: [true, 'communicationId is required'],
      unique: true, // 1:1 — one Insight per Communication, enforced at DB level
    },

    /**
     * Short AI-generated summary of the communication.
     * Populated during AI analysis phase.
     */
    summary: {
      type: String,
      trim: true,
      maxlength: [5000, 'Summary cannot exceed 5000 characters'],
      default: null,
    },

    /**
     * The AI model/version used to produce this insight.
     * e.g. "gemini-1.5-pro", "gemini-2.0-flash"
     */
    model: {
      type: String,
      trim: true,
      maxlength: [100, 'Model name cannot exceed 100 characters'],
      default: null,
    },

    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: look up insight by project + communication efficiently.
// communicationId is already unique, so this compound index supports
// the common query pattern of filtering by projectId.
insightSchema.index({ projectId: 1, communicationId: 1 }, { unique: true });

module.exports = mongoose.model('Insight', insightSchema);
