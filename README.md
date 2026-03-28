# ServeConnect

A local services marketplace where users can find and book nearby service providers like plumbers, electricians, tutors, etc.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Caching:** Redis
- **Real-time:** Socket.io
- **Auth:** JWT
- **Maps:** Google Maps API

## Features

- User and Provider registration/login
- Providers can list their services with pricing and availability
- Users can browse services based on their location
- Distance-based search using Google Maps
- Real-time notifications using Socket.io
- Role-based dashboards for users and providers
- Redis caching for better performance

## How to Run

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories.

**Backend `.env`:**
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
REDIS_URL=your_redis_url
CLIENT_URL=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

## Folder Structure

```
serveconnect/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── index.html
└── docker-compose.yml
```

## Docker

```bash
docker-compose up --build
```
