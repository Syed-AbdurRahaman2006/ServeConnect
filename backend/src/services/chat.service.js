const chatRepository = require('../repositories/chat.repository');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Chat Service — Business logic for real-time messaging
 */
class ChatService {
  /**
   * Get or create a conversation for a request
   */
  async getOrCreateConversation(requestId, participants) {
    return chatRepository.findOrCreateConversation(requestId, participants);
  }

  /**
   * Get a conversation by ID (with access check)
   */
  async getConversation(conversationId, userId) {
    const conversation = await chatRepository.getConversationById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new AppError('Not authorized to access this conversation', 403);
    }

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId) {
    return chatRepository.getUserConversations(userId);
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId, senderId, content) {
    // Verify conversation exists and user is participant
    await this.getConversation(conversationId, senderId);

    const message = await chatRepository.createMessage({
      conversationId,
      senderId,
      content,
    });

    // Update last message on conversation
    await chatRepository.updateLastMessage(conversationId, {
      content,
      senderId,
      timestamp: new Date(),
    });

    return message;
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(conversationId, userId, options) {
    // Verify access
    await this.getConversation(conversationId, userId);
    return chatRepository.getMessages(conversationId, options);
  }

  /**
   * Mark messages as seen
   */
  async markAsSeen(conversationId, userId) {
    return chatRepository.markAsSeen(conversationId, userId);
  }

  /**
   * Mark a message as delivered
   */
  async markAsDelivered(messageId) {
    return chatRepository.markAsDelivered(messageId);
  }
}

module.exports = new ChatService();
