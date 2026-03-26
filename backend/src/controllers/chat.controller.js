const chatService = require('../services/chat.service');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Chat Controller — Handles messaging HTTP endpoints
 */
const getConversation = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  // Need requesterId and providerId to create participants list
  const requestService = require('../services/request.service');
  const request = await requestService.getById(requestId);

  const participants = [
    request.requesterId._id || request.requesterId,
    request.providerId._id || request.providerId,
  ];

  const conversation = await chatService.getOrCreateConversation(
    requestId,
    participants
  );

  res.status(200).json({
    success: true,
    data: { conversation },
  });
});

const getUserConversations = asyncHandler(async (req, res) => {
  const conversations = await chatService.getUserConversations(req.user._id);

  res.status(200).json({
    success: true,
    data: { conversations },
  });
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page, limit } = req.query;

  const result = await chatService.getMessages(
    conversationId,
    req.user._id,
    { page: parseInt(page) || 1, limit: parseInt(limit) || 50 }
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;

  const message = await chatService.sendMessage(
    conversationId,
    req.user._id,
    content
  );

  // Emit via Socket.io
  const io = req.app.get('io');
  if (io) {
    const conversation = await chatService.getConversation(
      conversationId,
      req.user._id
    );
    conversation.participants.forEach((participant) => {
      if (participant._id.toString() !== req.user._id.toString()) {
        io.to(`user:${participant._id}`).emit('message:new', { message });
      }
    });
  }

  res.status(201).json({
    success: true,
    data: { message },
  });
});

const markAsSeen = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  await chatService.markAsSeen(conversationId, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Messages marked as seen',
  });
});

module.exports = {
  getConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markAsSeen,
};
