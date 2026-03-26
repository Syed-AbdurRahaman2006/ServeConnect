import { create } from 'zustand';
import { chatAPI } from '../services/api';

/**
 * Chat Store — Manages conversations and messaging state
 */
const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  currentConversation: null,
  loading: false,
  typingUsers: {},

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const res = await chatAPI.getConversations();
      set({ conversations: res.data.conversations || [], loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  getOrCreateConversation: async (requestId) => {
    set({ loading: true });
    try {
      const res = await chatAPI.getConversation(requestId);
      set({ currentConversation: res.data.conversation, loading: false });
      return res.data.conversation;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchMessages: async (conversationId, params = {}) => {
    set({ loading: true });
    try {
      const res = await chatAPI.getMessages(conversationId, params);
      set({ messages: res.data.messages || [], loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    const res = await chatAPI.sendMessage({ conversationId, content });
    set((state) => ({
      messages: [...state.messages, res.data.message],
    }));
    return res.data.message;
  },

  // Real-time: new message from socket
  addMessage: (message) => {
    set((state) => {
      // Avoid duplicates
      if (state.messages.some((m) => m._id === message._id)) return state;
      return { messages: [...state.messages, message] };
    });
  },

  markAsSeen: async (conversationId) => {
    await chatAPI.markAsSeen(conversationId);
  },

  setTyping: (conversationId, userId, isTyping) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: isTyping
          ? { ...state.typingUsers[conversationId], [userId]: true }
          : (() => {
              const users = { ...state.typingUsers[conversationId] };
              delete users[userId];
              return users;
            })(),
      },
    }));
  },

  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),

  clearMessages: () => set({ messages: [], currentConversation: null }),
}));

export default useChatStore;
