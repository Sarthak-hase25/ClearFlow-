'use strict';

const mongoose = require('mongoose');

/**
 * Project
 *
 * Top-level entity in ArchFlow. All communications, insights, actions,
 * decisions, and risks belong to a project.
 */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'archived'],
        message: 'Status must be active, completed, or archived',
      },
      default: 'active',
    },

    clientName: {
      type: String,
      trim: true,
      maxlength: [200, 'Client name cannot exceed 200 characters'],
      default: null,
    },

    location: {
      type: String,
      trim: true,
      maxlength: [300, 'Location cannot exceed 300 characters'],
      default: null,
    },

    type: {
      type: String,
      trim: true,
      default: 'Residential',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null until authentication is implemented
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
