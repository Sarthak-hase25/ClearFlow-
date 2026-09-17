'use strict';

const mongoose = require('mongoose');

/**
 * Decision
 *
 * A decision extracted by AI from a Communication via an Insight.
 *
 * Source traceability chain:
 *   Decision → communicationId → Communication (original content)
 *   Decision → insightId       → Insight       (AI analysis)
 *
 * NULL HANDLING RULE:
 * decidedBy and decisionDate must remain null if not present in the source.
 * Never fabricate missing information.
 */
const decisionSchema = new mongoose.Schema(
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
    },

    insightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Insight',
      required: [true, 'insightId is required'],
    },

    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['open', 'decided'],
        message: 'Status must be open or decided',
      },
      default: 'open',
    },

    /**
     * Name/role of the person who made the decision.
     * null if not identified in the source communication.
     */
    decidedBy: {
      type: String,
      trim: true,
      maxlength: [150, 'decidedBy cannot exceed 150 characters'],
      default: null,
    },

    /**
     * Date the decision was made.
     * null if not mentioned in the source communication.
     */
    decisionDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: most queries filter by project + status
decisionSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model('Decision', decisionSchema);
