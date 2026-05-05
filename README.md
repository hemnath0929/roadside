# Roadside Assistance & Emergency Support 🚗🔧

A full-stack local web application for roadside assistance with **Swiggy/Rapido-style live mechanic tracking**.

---

## Team Structure

| Folder | Responsibility | Member |
|--------|---------------|--------|
| `client/` | React + Vite frontend | Member 1 |
| `server/` | Node.js + Express REST API | Member 2 |
| `socket/` | Socket.IO live tracking module | Member 3 |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB (local) |
| Realtime | Socket.IO |
| Maps | Google Maps / OpenStreetMap |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## Project Structure

```
roadside-assistance/
├── client/                  # React + Vite frontend (Member 1)
│   └── README.md
│
├── server/                  # Express REST API (Member 2)
│   ├── server.js            # Entry point
│   ├── app.js               # Express factory
│   ├── package.json
│   ├── config/db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Mechanic.js
│   │   └── ServiceRequest.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── request.controller.js
│   │   ├── mechanic.controller.js
│   │   └── user.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── request.routes.js
│   │   ├── mechanic.routes.js
│   │   └── user.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   └── utils/jwt.utils.js
│
├── socket/                  # Socket.IO live tracking (Member 3)
│   ├── socketServer.js      # initSocket(httpServer) export
│   ├── trackingSocket.js    # All event handlers
│   ├── rooms.js             # Room registry
│   ├── locationStore.js     # In-memory location store
│   ├── socketEvents.js      # Event name constants
│   └── testClient.html      # Browser test UI
│
├── docs/
│   ├── api-routes.md        # REST API reference
│   ├── socket-events.md     # Socket.IO event reference
│   └── database-schema.md   # MongoDB schema reference
│
├── .env.example             # Environment template
├── .gitignore
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally on port 27017

### 1. Clone & setup environment
```bash
git clone https://github.com/hemnath0929/roadside.git
cd roadside
copy .env.example .env
# Edit .env and set your JWT_SECRET
```

### 2. Start the backend (Member 2)
```bash
cd server
npm install
npm run dev
```
Server runs at: `http://localhost:5000`

### 3. Start the frontend (Member 1)
```bash
cd client
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

### 4. Test Socket.IO (Member 3)
Open `socket/testClient.html` in your browser (use Live Server).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/roadside_db
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

---

## Documentation

- 📖 [API Routes](docs/api-routes.md)
- 🔌 [Socket Events](docs/socket-events.md)
- 🗄️ [Database Schema](docs/database-schema.md)

---

## Key Features

- ✅ JWT authentication (separate flows for user and mechanic)
- ✅ Mechanic approval workflow (admin must approve)
- ✅ Live GPS tracking via Socket.IO rooms (per `requestId`)
- ✅ Status lifecycle: `pending → accepted → on_the_way → arrived → completed`
- ✅ Geospatial queries (find nearest available mechanic)
- ✅ Automatic rating aggregation on mechanic profile
- ✅ In-memory mechanic location store with Socket.IO broadcast
