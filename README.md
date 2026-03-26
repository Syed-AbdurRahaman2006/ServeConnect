# ServeConnect – Local Services Marketplace Platform

A production-grade **MERN stack** application for discovering local service providers, creating service requests, and communicating in real-time.

## 🏗️ Architecture

```
serveconnect/
├── backend/           # Node.js + Express API
│   └── src/
│       ├── config/         # DB, Redis, env config
│       ├── controllers/    # HTTP request handlers
│       ├── middlewares/     # Auth, RBAC, error handling, validation
│       ├── models/          # Mongoose schemas (User, Service, Request, Conversation, Message)
│       ├── repositories/    # Data access layer
│       ├── routes/          # Express routes
│       ├── services/        # Business logic layer
│       ├── sockets/         # Socket.io event handlers
│       └── utils/           # Constants, helpers, seed script
├── frontend/          # React + Vite + TailwindCSS
│   └── src/
│       ├── components/     # Navbar, ProtectedRoute, StatusBadge, LoadingSpinner
│       ├── pages/          # Login, Signup, Home, ServiceDetails, Chat, Dashboards, Admin
│       ├── store/          # Zustand stores (auth, service, request, chat)
│       └── services/       # Axios API layer, Socket.io client
└── docker-compose.yml  # Full-stack orchestration
```

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Zustand, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose, 2dsphere indexes |
| Auth | JWT + bcrypt + RBAC |
| Real-Time | Socket.io + Redis Pub/Sub adapter |
| Deployment | Docker, docker-compose |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional, for Socket.io scaling)

### Local Development

**1. Backend Setup**
```bash
cd serveconnect/backend
cp .env.example .env    # Edit with your settings
npm install
npm run seed            # Creates admin + sample data
npm run dev             # Starts on http://localhost:5000
```

**2. Frontend Setup**
```bash
cd serveconnect/frontend
cp .env.example .env
npm install
npm run dev             # Starts on http://localhost:5173
```

### Docker (Full Stack)
```bash
cd serveconnect
docker-compose up --build
# Frontend: http://localhost
# Backend API: http://localhost:5000/api
```

## 🔑 Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@serveconnect.com | admin123 |
| Provider | provider@test.com | password123 |
| User | user@test.com | password123 |

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | – | Register |
| POST | /api/auth/login | – | Login |
| GET | /api/auth/profile | JWT | Profile |
| GET | /api/services | – | Search services |
| POST | /api/services | PROVIDER | Create service |
| PUT | /api/services/:id | PROVIDER | Update service |
| DELETE | /api/services/:id | PROVIDER | Delete service |
| POST | /api/requests | USER | Create request |
| PUT | /api/requests/:id/accept | PROVIDER | Accept request |
| PUT | /api/requests/:id/status | JWT | Update status |
| GET | /api/requests | JWT | Get requests |
| GET | /api/chat/conversations | JWT | Get conversations |
| POST | /api/chat/messages | JWT | Send message |
| GET | /api/admin/users | ADMIN | List users |
| PATCH | /api/admin/users/:id/block | ADMIN | Block/unblock |
| GET | /api/admin/stats | ADMIN | Platform stats |

## 🔄 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| request:created | Server → Providers | Broadcast new request to nearby providers |
| request:accepted | Server → Requester | Notify user their request was accepted |
| request:cancelled | Server → Providers | Cancel broadcast for other providers |
| message:new | Bi-directional | Real-time chat messages |
| message:typing | Client → Server | Typing indicator |
| message:seen | Bi-directional | Read receipts |
| user:online/offline | Server → All | Presence tracking |

## 🛡️ Key Features

- **Lifecycle Engine**: Finite State Machine (CREATED → ACCEPTED → COMPLETED) with transition validation
- **Request Broadcasting**: Geo-query finds nearby providers, broadcasts via WebSocket
- **Atomic Assignment**: Optimistic locking prevents duplicate provider assignment
- **Real-Time Chat**: Socket.io with typing indicators, delivery/seen status
- **Geo-Spatial Search**: MongoDB 2dsphere indexes for location-based discovery
- **RBAC**: Role-based access control (USER, PROVIDER, ADMIN)
