'use strict';

const mongoose = require('mongoose');

/**
 * Action
 *
 * An action item extracted by AI from a Communication via an Insight.
 *
 * Source traceability chain:
 *   Action → communicationId → Communication (original content)
 *   Action → insightId       → Insight       (AI analysis)
 *
 * NULL HANDLING RULE:
 * If the original communication does not specify assignee, deadline, or
 * priority — those fields remain null. Never fabricate missing information.
 */
const actionSchema = new mongoose.Schema(
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
     * Person responsible for this action.
     * null if not specified in the source communication.
     */
    assignee: {
      type: String,
      trim: true,
      maxlength: [150, 'Assignee name cannot exceed 150 characters'],
      default: null,
    },

    /**
     * Priority extracted from the communication.
     * null if not specified — do NOT default to 'medium' as a fabrication.
     */
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', null],
        message: 'Priority must be low, medium, high, or null',
      },
      default: null,
    },

    /**
     * Deadline date extracted from the communication.
     * null if not mentioned in the source.
     */
    deadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'in_progress', 'completed'],
        message: 'Status must be pending, in_progress, or completed',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: most queries filter by project + status
actionSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model('Action', actionSchema);
