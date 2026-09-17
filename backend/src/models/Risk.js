'use strict';

const mongoose = require('mongoose');

/**
 * Risk
 *
 * A risk extracted by AI from a Communication via an Insight.
 *
 * Source traceability chain:
 *   Risk → communicationId → Communication (original content)
 *   Risk → insightId       → Insight       (AI analysis)
 *
 * NULL HANDLING RULE:
 * impact and severity remain null if not specified in the source.
 * Never fabricate or assume missing information.
 */
const riskSchema = new mongoose.Schema(
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

    /**
     * Severity level of the risk.
     * null if the source communication does not indicate severity.
     */
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical', null],
        message: 'Severity must be low, medium, high, critical, or null',
      },
      default: null,
    },

    /**
     * Short human-readable description of the potential impact.
     * null if not specified in the source.
     */
    impact: {
      type: String,
      trim: true,
      maxlength: [1000, 'Impact cannot exceed 1000 characters'],
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['open', 'monitoring', 'resolved'],
        message: 'Status must be open, monitoring, or resolved',
      },
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: most queries filter by project + status
riskSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model('Risk', riskSchema);
