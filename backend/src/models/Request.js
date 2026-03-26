const mongoose = require('mongoose');

/**
 * Request Lifecycle States (Finite State Machine)
 * 
 * Valid transitions:
 *   CREATED   → ACCEPTED, REJECTED, CANCELLED
 *   ACCEPTED  → COMPLETED, CANCELLED
 *   REJECTED  → (terminal)
 *   CANCELLED → (terminal)
 *   COMPLETED → (terminal)
 */
const REQUEST_STATES = {
  CREATED: 'CREATED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Valid state transitions map
const VALID_TRANSITIONS = {
  CREATED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

/**
 * Request Model
 * Tracks the full lifecycle of service requests with FSM-based state management.
 * Uses atomic locking to prevent duplicate provider assignment.
 */
const requestSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATES),
      default: REQUEST_STATES.CREATED,
      index: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    // Location where service is needed
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    // Lifecycle history — records every state transition
    lifecycleHistory: [
      {
        fromState: { type: String },
        toState: { type: String, required: true },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    // Atomic lock: prevents race conditions in provider assignment
    lockVersion: {
      type: Number,
      default: 0,
    },
    // Broadcast tracking
    broadcastedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    scheduledDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

requestSchema.index({ location: '2dsphere' });
requestSchema.index({ requesterId: 1, status: 1 });
requestSchema.index({ providerId: 1, status: 1 });

/**
 * Validate a state transition using the FSM
 * @param {string} fromState - Current state
 * @param {string} toState - Desired new state
 * @returns {boolean} Whether the transition is valid
 */
requestSchema.statics.isValidTransition = function (fromState, toState) {
  const allowed = VALID_TRANSITIONS[fromState];
  return allowed && allowed.includes(toState);
};

requestSchema.statics.REQUEST_STATES = REQUEST_STATES;
requestSchema.statics.VALID_TRANSITIONS = VALID_TRANSITIONS;

module.exports = mongoose.model('Request', requestSchema);
