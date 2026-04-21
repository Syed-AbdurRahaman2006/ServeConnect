import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import useRequestStore from '../store/requestStore';
import { socketService } from '../services/socket';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Send, MessageSquare, ArrowLeft, CheckCheck, Check, Search
} from 'lucide-react';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('requestId');
  const {
    conversations, messages, currentConversation, loading,
    fetchConversations, getOrCreateConversation, fetchMessages,
    sendMessage, addMessage, markAsSeen, setCurrentConversation,
    clearMessages, typingUsers, setTyping,
  } = useChatStore();
  const { user } = useAuthStore();
  const { requests } = useRequestStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Redirect users if they don't have active bookings
  useEffect(() => {
    if (user?.role === 'USER') {
      const activeBookings = requests.filter(r => ['CREATED', 'ACCEPTED'].includes(r.status));
      if (activeBookings.length === 0 && !requestId) {
        navigate('/dashboard#bookings');
      }
    }
  }, [user, requests, requestId, navigate]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
    return () => clearMessages();
  }, []);

  // Auto-open conversation from requestId query param
  useEffect(() => {
    if (requestId) {
      openConversation(requestId);
    }
  }, [requestId]);

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = ({ message }) => {
      addMessage(message);
    };
    const handleTyping = ({ userId: typingUserId, conversationId }) => {
      if (typingUserId !== user?.id) {
        setTyping(conversationId, typingUserId, true);
        setTimeout(() => setTyping(conversationId, typingUserId, false), 3000);
      }
    };
    const handleStopTyping = ({ userId: typingUserId }) => {
      if (currentConversation) {
        setTyping(currentConversation._id, typingUserId, false);
      }
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('message:typing', handleTyping);
    socketService.on('message:stopTyping', handleStopTyping);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:typing', handleTyping);
      socketService.off('message:stopTyping', handleStopTyping);
    };
  }, [currentConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (reqId) => {
    try {
      const conv = await getOrCreateConversation(reqId);
      if (conv) {
        await fetchMessages(conv._id);
        socketService.joinConversation(conv._id);
        markAsSeen(conv._id);
      }
    } catch (err) {
      console.error('Failed to open conversation:', err);
    }
  };

  const selectConversation = async (conv) => {
    if (currentConversation) {
      socketService.leaveConversation(currentConversation._id);
    }
    setCurrentConversation(conv);
    await fetchMessages(conv._id);
    socketService.joinConversation(conv._id);
    markAsSeen(conv._id);
  };

  const handleSend = async () => {
    if (!input.trim() || !currentConversation) return;
    setSending(true);
    try {
      const message = await sendMessage(currentConversation._id, input);
      socketService.emit('message:new', {
        conversationId: currentConversation._id,
        message,
      });
      setInput('');
      socketService.stopTyping(currentConversation._id);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (currentConversation) {
      socketService.sendTyping(currentConversation._id);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socketService.stopTyping(currentConversation._id);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => (p._id || p) !== user?.id);
  };

  const isTypingInConversation = currentConversation &&
    typingUsers[currentConversation._id] &&
    Object.keys(typingUsers[currentConversation._id]).length > 0;

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-64px)] flex bg-surface-50">
      {/* Conversations Sidebar */}
      <div className={`w-96 border-r border-surface-200 flex flex-col bg-white ${currentConversation ? 'hidden lg:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-surface-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-surface-900">Messages</h2>
                <p className="text-xs text-surface-500 font-medium">{conversations.length} conversations</p>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-surface-400" />
              </div>
              <p className="text-surface-500 font-semibold text-sm">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-surface-400 text-xs mt-1">
                {searchQuery ? 'Try a different search' : 'Start chatting with providers'}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isActive = currentConversation?._id === conv._id;
                const hasUnread = false; // You can implement unread logic
                
                return (
                  <motion.button
                    key={conv._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 rounded-2xl transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-sm' 
                        : 'hover:bg-surface-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-base">
                          {other?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      {other?.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      )}
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-indigo-900' : 'text-surface-900'}`}>
                          {other?.name || 'User'}
                        </p>
                        <span className="text-[10px] text-surface-400 font-medium">
                          {conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${isActive ? 'text-indigo-600 font-medium' : 'text-surface-500'}`}>
                        {conv.lastMessage?.content || 'Start chatting...'}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!currentConversation ? 'hidden lg:flex' : 'flex'}`}>
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 flex items-center gap-4 border-b border-surface-200 bg-white">
              <button
                onClick={() => { setCurrentConversation(null); clearMessages(); }}
                className="lg:hidden w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center hover:bg-surface-200 transition"
              >
                <ArrowLeft size={18} className="text-surface-600" />
              </button>
              
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-base">
                    {getOtherParticipant(currentConversation)?.name?.charAt(0) || '?'}
                  </span>
                </div>
                {getOtherParticipant(currentConversation)?.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1">
                <p className="font-bold text-surface-900 text-base">
                  {getOtherParticipant(currentConversation)?.name || 'User'}
                </p>
                <p className="text-xs font-medium">
                  {isTypingInConversation ? (
                    <span className="text-indigo-600 flex items-center gap-1">
                      <span className="animate-pulse">●</span> typing...
                    </span>
                  ) : getOtherParticipant(currentConversation)?.isOnline ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span>●</span> Online
                    </span>
                  ) : (
                    <span className="text-surface-400">Offline</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center hover:bg-surface-200 transition">
                  <Search size={18} className="text-surface-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-surface-50">
              {loading ? (
                <LoadingSpinner text="Loading messages..." />
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
                    <MessageSquare size={36} className="text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-black text-surface-900 mb-2">Start the conversation!</h3>
                  <p className="text-surface-500 font-medium text-center max-w-sm">
                    Send a message to {getOtherParticipant(currentConversation)?.name} to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg, index) => {
                    const isMe = (msg.senderId?._id || msg.senderId) === user?.id;
                    const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
                    
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {!isMe && (
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                            {getOtherParticipant(currentConversation)?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        
                        <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-sm ${
                              isMe
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-md'
                                : 'bg-white border border-surface-200 text-surface-900 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[10px] text-surface-400 font-medium">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              msg.seenAt ? (
                                <CheckCheck size={14} className="text-emerald-500" />
                              ) : msg.deliveredAt ? (
                                <CheckCheck size={14} className="text-surface-400" />
                              ) : (
                                <Check size={14} className="text-surface-400" />
                              )
                            )}
                          </div>
                        </div>

                        {isMe && (
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                            {user?.name?.charAt(0) || 'Y'}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-surface-200 bg-white">
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 bg-surface-50 border border-surface-200 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                  <textarea
                    rows="1"
                    className="w-full bg-transparent border-none outline-none text-surface-900 placeholder-surface-400 resize-none text-sm font-medium max-h-32"
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    style={{ minHeight: '24px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                    input.trim() && !sending
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-500/20'
                      : 'bg-surface-200 text-surface-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={48} className="text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black text-surface-900 mb-3">Select a conversation</h3>
              <p className="text-surface-500 font-medium">Choose from your existing conversations or start a new chat with a service provider</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
