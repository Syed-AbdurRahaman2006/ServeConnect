const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * Chat Repository — Data access layer for Conversation and Message models.
 */
class ChatRepository {
  // ─── Conversations ──────────────────────────────────────────────

  async findOrCreateConversation(requestId, participants) {
    let conversation = await Conversation.findOne({ requestId });
    if (!conversation) {
      conversation = await Conversation.create({ requestId, participants });
    }
    return conversation.populate('participants', 'name email avatar isOnline');
  }

  async getConversationById(conversationId) {
    return Conversation.findById(conversationId)
      .populate('participants', 'name email avatar isOnline');
  }

  async getUserConversations(userId) {
    return Conversation.find({ participants: userId })
      .populate('participants', 'name email avatar isOnline')
      .sort({ updatedAt: -1 });
  }

  async updateLastMessage(conversationId, messageData) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: messageData },
      { new: true }
    );
  }

  // ─── Messages ───────────────────────────────────────────────────

  async createMessage(data) {
    const message = await Message.create(data);
    return message.populate('senderId', 'name email avatar');
  }

  async getMessages(conversationId, options = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .populate('senderId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversationId }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async markAsDelivered(messageId) {
    return Message.findByIdAndUpdate(
      messageId,
      { deliveredAt: new Date() },
      { new: true }
    );
  }

  async markAsSeen(conversationId, userId) {
    return Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        seenAt: null,
      },
      { seenAt: new Date() }
    );
  }
}

module.exports = new ChatRepository();
