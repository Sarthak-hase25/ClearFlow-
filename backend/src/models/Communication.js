'use strict';

const mongoose = require('mongoose');

/**
 * Communication
 *
 * THE most important model in ArchFlow. Represents an original project
 * communication exactly as captured — email, site update, drawing note, etc.
 *
 * CRITICAL: The original `content` field must NEVER be overwritten or replaced
 * with AI-generated text. It must remain available for source traceability.
 * All AI output is stored separately in the Insight model.
 */
const communicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'projectId is required'],
      index: true,
    },

    senderName: {
      type: String,
      trim: true,
      maxlength: [150, 'Sender name cannot exceed 150 characters'],
      default: null,
    },

    senderRole: {
      type: String,
      trim: true,
      maxlength: [100, 'Sender role cannot exceed 100 characters'],
      default: null,
    },

    sourceType: {
      type: String,
      required: [true, 'sourceType is required'],
      enum: {
        values: [
          'client',
          'architect',
          'contractor',
          'supplier',
          'consultant',
          'email',
          'site_update',
          'drawing_update',
          'other',
        ],
        message: 'Invalid sourceType value',
      },
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [500, 'Subject cannot exceed 500 characters'],
      default: null,
    },

    /**
     * The original communication text — immutable after creation.
     * AI summaries/extractions must NEVER be stored here.
     */
    content: {
      type: String,
      required: [true, 'content is required'],
      maxlength: [50000, 'Content cannot exceed 50 000 characters'],
    },

    communicationDate: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: most queries filter by project + sort by date
communicationSchema.index({ projectId: 1, communicationDate: -1 });

module.exports = mongoose.model('Communication', communicationSchema);
