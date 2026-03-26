const express = require('express');
const router = express.Router();
const {
  getConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markAsSeen,
} = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { sendMessageRules, validate } = require('../middlewares/validate.middleware');

// All chat routes require authentication
router.use(authenticate);

// Get user's conversations
router.get('/conversations', getUserConversations);

// Get or create conversation for a request
router.get('/request/:requestId', getConversation);

// Get messages for a conversation
router.get('/:conversationId/messages', getMessages);

// Send a message
router.post('/messages', sendMessageRules, validate, sendMessage);

// Mark messages as seen
router.put('/:conversationId/seen', markAsSeen);

module.exports = router;
