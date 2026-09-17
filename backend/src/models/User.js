'use strict';

const mongoose = require('mongoose');

/**
 * User
 *
 * Stores identity information for ArchFlow users.
 * Authentication (passwords, sessions, tokens) is NOT implemented here —
 * this model exists only to support project ownership and future auth.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      maxlength: [255, 'Email cannot exceed 255 characters'],
    },

    role: {
      type: String,
      enum: {
        values: ['admin', 'member'],
        message: 'Role must be admin or member',
      },
      default: 'member',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('User', userSchema);
