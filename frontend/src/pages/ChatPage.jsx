import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import { socketService } from '../services/socket';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Send, MessageSquare, ArrowLeft, Circle, CheckCheck, Check
} from 'lucide-react';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const {
    conversations, messages, currentConversation, loading,
    fetchConversations, getOrCreateConversation, fetchMessages,
    sendMessage, addMessage, markAsSeen, setCurrentConversation,
    clearMessages, typingUsers, setTyping,
  } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

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

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Conversations Sidebar */}
      <div className={`w-80 border-r border-dark-700/50 flex flex-col bg-dark-900/80 ${currentConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-dark-700/50">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <MessageSquare size={20} className="text-primary-400" />
            <span>Messages</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-dark-400 text-sm">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = currentConversation?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-dark-800/60 transition-colors border-b border-dark-800/50 ${
                    isActive ? 'bg-dark-800/80 border-l-2 border-l-primary-500' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {other?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    {other?.isOnline && (
                      <Circle size={10} className="absolute -bottom-0.5 -right-0.5 fill-accent-400 text-accent-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">{other?.name || 'User'}</p>
                    <p className="text-xs text-dark-400 truncate">
                      {conv.lastMessage?.content || 'Start chatting...'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!currentConversation ? 'hidden md:flex' : 'flex'}`}>
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="glass p-4 flex items-center space-x-3 border-b border-dark-700/50">
              <button
                onClick={() => { setCurrentConversation(null); clearMessages(); }}
                className="md:hidden p-1 text-dark-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getOtherParticipant(currentConversation)?.name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {getOtherParticipant(currentConversation)?.name || 'User'}
                </p>
                <p className="text-xs text-dark-400">
                  {isTypingInConversation ? (
                    <span className="text-primary-400 animate-pulse">typing...</span>
                  ) : getOtherParticipant(currentConversation)?.isOnline ? (
                    <span className="text-accent-400">Online</span>
                  ) : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <LoadingSpinner text="Loading messages..." />
              ) : messages.length === 0 ? (
                <div className="text-center text-dark-400 py-12">
                  <MessageSquare size={32} className="mx-auto mb-3 text-dark-500" />
                  <p>Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = (msg.senderId?._id || msg.senderId) === user?.id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-dark-800 text-dark-200 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${isMe ? 'text-primary-200/60' : 'text-dark-500'}`}>
                          <span className="text-[10px]">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            msg.seenAt ? <CheckCheck size={12} className="text-accent-300" />
                            : msg.deliveredAt ? <CheckCheck size={12} />
                            : <Check size={12} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="glass p-4 border-t border-dark-700/50">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Type a message..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="btn-primary px-4 py-3"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-300">Select a conversation</h3>
              <p className="text-dark-500 text-sm">Choose from your existing conversations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
