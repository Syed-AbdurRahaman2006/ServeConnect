// Mock Socket Service
class MockSocket {
  constructor() {
    this.connected = false;
    this.listeners = {};
    this.id = 'mock-socket-' + Date.now();
  }

  connect() {
    this.connected = true;
    setTimeout(() => this.emit('connect'), 100);
  }

  disconnect() {
    this.connected = false;
    setTimeout(() => this.emit('disconnect', 'io client disconnect'), 100);
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      this.listeners[event] = [];
    }
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}

const mockSocketInstance = new MockSocket();

export const socketService = {
  connect(token) {
    if (!mockSocketInstance.connected) mockSocketInstance.connect();
    return mockSocketInstance;
  },
  disconnect() {
    mockSocketInstance.disconnect();
  },
  getSocket() {
    return mockSocketInstance;
  },
  emit(event, data) {
    // Only local loopback for typing indicators right now
    if (event === 'message:typing' || event === 'message:stopTyping') {
      setTimeout(() => {
        // Echo back to all listeners for demo purposes
        mockSocketInstance.emit(event, { ...data, userId: 'mock-other-user' });
      }, 500);
    }
  },
  on(event, callback) {
    mockSocketInstance.on(event, callback);
  },
  off(event, callback) {
    mockSocketInstance.off(event, callback);
  },
  joinConversation() {},
  leaveConversation() {},
  joinBroadcast() {},
  sendTyping(conversationId) {
    this.emit('message:typing', { conversationId });
  },
  stopTyping(conversationId) {
    this.emit('message:stopTyping', { conversationId });
  },
  
  // Custom Helper to trigger mock server events
  triggerServerEvent(event, data) {
    mockSocketInstance.emit(event, data);
  }
};

