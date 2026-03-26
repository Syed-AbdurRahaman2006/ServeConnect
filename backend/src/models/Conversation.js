const mongoose = require('mongoose');

/**
 * Conversation Model
 * Links a service request to a chat between user and provider.
 * Each request can have at most one conversation.
 */
const conversationSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      content: { type: String },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one conversation per request
conversationSchema.index({ requestId: 1 }, { unique: true });
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
