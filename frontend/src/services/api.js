// Mock LocalStorage Database Helper
const getMockDB = () => {
  const defaultDB = {
    users: [],
    services: [
      { _id: 's1', title: 'Plumbing Repair', description: 'Fixing pipes', category: 'Plumbing', price: 50, priceUnit: 'per_hour', availability: true, provider: { _id: 'p1', name: 'Bob Provider', email: 'bob@provider.com' } },
      { _id: 's2', title: 'House Cleaning', description: 'Deep cleaning', category: 'Cleaning', price: 100, priceUnit: 'fixed', availability: true, provider: { _id: 'p2', name: 'Alice Cleaning', email: 'alice@cleaning.com' } }
    ],
    requests: [],
    conversations: [],
    messages: []
  };
  const stored = localStorage.getItem('serveconnect_mock_db');
  return stored ? JSON.parse(stored) : defaultDB;
};

const saveMockDB = (db) => {
  localStorage.setItem('serveconnect_mock_db', JSON.stringify(db));
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Simulate network delay
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const mockResponse = async (data) => {
  await delay();
  return { data };
};

const mockError = async (message) => {
  await delay();
  throw { message };
};

// ─── Auth APIs ──────────────────────────────────────────────────
export const authAPI = {
  signup: async (data) => {
    const db = getMockDB();
    if (db.users.find(u => u.email === data.email)) return mockError('Email already exists');
    const newUser = { _id: Date.now().toString(), ...data, status: 'active', createdAt: new Date() };
    db.users.push(newUser);
    saveMockDB(db);
    return mockResponse({ user: newUser, token: 'mock-jwt-token-xyz' });
  },
  login: async (data) => {
    const db = getMockDB();
    const user = db.users.find(u => u.email === data.email && u.password === data.password);
    if (!user) {
      if (data.email.includes('admin')) {
         const admin = { _id: 'admin1', name: 'Admin', email: data.email, role: 'ADMIN', status: 'active' };
         return mockResponse({ user: admin, token: 'mock-token' });
      }
      if (data.email.includes('provider')) {
         const provider = { _id: 'p-mock', name: 'Provider', email: data.email, role: 'PROVIDER', status: 'active' };
         return mockResponse({ user: provider, token: 'mock-token' });
      }
      return mockError('Invalid credentials (try admin@ or provider@)');
    }
    if (user.status !== 'active') return mockError('Account banned');
    return mockResponse({ user, token: 'mock-jwt-token-xyz' });
  },
  getProfile: async () => mockResponse({ user: getCurrentUser() }),
  updateLocation: async (coordinates) => mockResponse({ message: 'Location updated' }),
};

// ─── Service APIs ───────────────────────────────────────────────
export const serviceAPI = {
  getAll: async (params = {}) => {
    const db = getMockDB();
    let res = [...db.services];
    if (params.search) res = res.filter(s => s.title.toLowerCase().includes(params.search.toLowerCase()));
    if (params.category && params.category !== 'All') res = res.filter(s => s.category === params.category);
    return mockResponse({ services: res, page: 1, pages: 1, total: res.length });
  },
  getById: async (id) => {
    const db = getMockDB();
    const s = db.services.find(s => s._id === id);
    return s ? mockResponse({ service: s }) : mockError('Not found');
  },
  create: async (data) => {
    const db = getMockDB();
    const user = getCurrentUser();
    const newService = { _id: Date.now().toString(), ...data, availability: true, provider: user };
    db.services.unshift(newService);
    saveMockDB(db);
    return mockResponse({ service: newService });
  },
  update: async (id, data) => mockResponse({ service: data }),
  delete: async (id) => {
    const db = getMockDB();
    db.services = db.services.filter(s => s._id !== id);
    saveMockDB(db);
    return mockResponse({ message: 'Deleted' });
  },
  toggleAvailability: async (id) => {
    const db = getMockDB();
    const svc = db.services.find(s => s._id === id);
    if(svc) svc.availability = !svc.availability;
    saveMockDB(db);
    return mockResponse({ service: svc });
  },
  getMyServices: async () => {
    const db = getMockDB();
    const user = getCurrentUser();
    const my = db.services.filter(s => s.provider && s.provider._id === user?._id);
    return mockResponse({ services: my });
  },
};

// ─── Request APIs ───────────────────────────────────────────────
export const requestAPI = {
  create: async (data) => {
    const db = getMockDB();
    const user = getCurrentUser();
    const svc = db.services.find(s => s._id === data.serviceId);
    const newReq = { 
      _id: Date.now().toString(), 
      serviceId: svc, 
      requesterId: user, 
      description: data.description, 
      status: 'CREATED', 
      createdAt: new Date() 
    };
    db.requests.unshift(newReq);
    saveMockDB(db);
    
    // Simulate socket broadcast to providers
    import('./socket').then(({ socketService }) => {
      socketService.triggerServerEvent('request:created', { request: newReq });
    });

    return mockResponse({ request: newReq, broadcastCount: 1 });
  },
  getAll: async () => {
    const db = getMockDB();
    const user = getCurrentUser();
    let res = [];
    if (user?.role === 'USER') {
      res = db.requests.filter(r => r.requesterId?._id === user?._id);
    } else {
      res = db.requests.filter(r => r.providerId?._id === user?._id);
    }
    return mockResponse({ requests: res, page: 1, pages: 1, total: res.length });
  },
  getById: async (id) => {
    const db = getMockDB();
    const r = db.requests.find(r => r._id === id);
    return r ? mockResponse({ request: r }) : mockError('Not found');
  },
  accept: async (id) => {
    const db = getMockDB();
    const user = getCurrentUser();
    const req = db.requests.find(r => r._id === id);
    if (req) {
      req.status = 'ACCEPTED';
      req.providerId = user;
      saveMockDB(db);
      
      // Simulate socket
      import('./socket').then(({ socketService }) => {
        socketService.triggerServerEvent('request:accepted', { request: req });
      });
      return mockResponse({ request: req });
    }
    return mockError('Failed');
  },
  updateStatus: async (id, status, note) => {
    const db = getMockDB();
    const req = db.requests.find(r => r._id === id);
    if (req) {
      req.status = status;
      saveMockDB(db);
      return mockResponse({ request: req });
    }
    return mockError('Failed');
  },
  getBroadcasted: async () => {
    const db = getMockDB();
    const res = db.requests.filter(r => r.status === 'CREATED');
    return mockResponse({ requests: res });
  },
};

// ─── Chat APIs ──────────────────────────────────────────────────
export const chatAPI = {
  getConversations: async () => {
    const db = getMockDB();
    return mockResponse({ conversations: db.conversations });
  },
  getConversation: async (requestId) => {
    const db = getMockDB();
    const user = getCurrentUser();
    let conv = db.conversations.find(c => c.requestId === requestId);
    if (!conv) {
      conv = { _id: 'conv-' + requestId, requestId, participants: [{ _id: 'other', name: 'Other Coordinator' }, user] };
      db.conversations.push(conv);
      saveMockDB(db);
    }
    return mockResponse({ conversation: conv });
  },
  getMessages: async (conversationId) => {
    const db = getMockDB();
    const msgs = db.messages.filter(m => m.conversationId === conversationId);
    return mockResponse({ messages: msgs });
  },
  sendMessage: async (data) => {
    const db = getMockDB();
    const user = getCurrentUser();
    const msg = { 
      _id: Date.now().toString(), 
      conversationId: data.conversationId, 
      senderId: user, 
      content: data.content, 
      createdAt: new Date(),
      deliveredAt: new Date()
    };
    db.messages.push(msg);
    saveMockDB(db);
    return mockResponse({ message: msg });
  },
  markAsSeen: async (conversationId) => mockResponse({ message: 'Seen' }),
};

// ─── Admin APIs ─────────────────────────────────────────────────
export const adminAPI = {
  getUsers: async () => {
    const db = getMockDB();
    return mockResponse({ users: db.users, page: 1, pages: 1 });
  },
  toggleBlock: async (id) => {
    const db = getMockDB();
    const u = db.users.find(u => u._id === id);
    if(u) u.status = u.status === 'active' ? 'blocked' : 'active';
    saveMockDB(db);
    return mockResponse({ message: 'User updated successfully' });
  },
  getStats: async () => {
    const db = getMockDB();
    const reqs = db.requests;
    const stats = {
      users: db.users.filter(u => u.role === 'USER').length,
      providers: db.users.filter(u => u.role === 'PROVIDER').length,
      services: db.services.length,
      requests: {
        CREATED: reqs.filter(r => r.status === 'CREATED').length,
        ACCEPTED: reqs.filter(r => r.status === 'ACCEPTED').length,
        COMPLETED: reqs.filter(r => r.status === 'COMPLETED').length,
      }
    };
    return mockResponse({ stats });
  },
};

export default {};
