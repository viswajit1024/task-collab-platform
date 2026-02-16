# Real-Time Task Collaboration Platform

A lightweight **Trello / Notion hybrid** with real-time collaboration features.

---

# 📐 Architecture Overview

## Frontend Architecture

- **Framework:** React 18 (functional components + hooks)
- **State Management:** Redux Toolkit (`createAsyncThunk` for API calls)
- **Real-time:** Socket.IO client with custom middleware
- **Routing:** React Router v6 with protected routes
- **Drag & Drop:** `@hello-pangea/dnd`
- **Styling:** CSS Modules with CSS custom properties

---

## Backend Architecture

- **Runtime:** Node.js with Express.js
- **API Style:** RESTful with consistent response format
- **Real-time:** Socket.IO with room-based broadcasting
- **Authentication:** JWT (access tokens) + bcrypt password hashing
- **Validation:** express-validator
- **Error Handling:** Centralized error handler middleware

---

## Database Design

- **Database:** MongoDB with Mongoose ODM
- **Collections:** Users, Boards, Lists, Tasks, Activities
- **Indexing:** Compound indexes on frequently queried fields
- **References:** ObjectId references with selective population

---

# 🚀 Quick Start

## Prerequisites

- Node.js >= 18
- MongoDB >= 6 (or Docker)
- npm or yarn

---

## Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000  

---

## Option 2: Manual Setup

### 1️⃣ Start MongoDB

```bash
mongod --dbdir /path/to/data
```

### 2️⃣ Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

# 🔐 Demo Credentials

| User   | Email              | Password     |
|--------|-------------------|-------------|
| User 1 | demo@example.com  | password123 |
| User 2 | alice@example.com | password123 |
| User 3 | bob@example.com   | password123 |

---

# 📘 API Documentation

## 🔑 Auth Endpoints

| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| POST   | `/api/auth/signup`  | Register new user  |
| POST   | `/api/auth/login`   | Login user         |
| GET    | `/api/auth/me`      | Get current user   |

---

## 📁 Board Endpoints

| Method | Endpoint                              | Description                         |
|--------|---------------------------------------|-------------------------------------|
| GET    | `/api/boards`                         | Get user's boards (paginated)       |
| POST   | `/api/boards`                         | Create new board                    |
| GET    | `/api/boards/:id`                     | Get board with lists & tasks        |
| PUT    | `/api/boards/:id`                     | Update board                        |
| DELETE | `/api/boards/:id`                     | Delete board                        |
| POST   | `/api/boards/:id/members`             | Add member to board                 |
| DELETE | `/api/boards/:id/members/:userId`     | Remove member                       |

---

## 📋 List Endpoints

| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| POST   | `/api/lists`         | Create list in board   |
| PUT    | `/api/lists/:id`     | Update list            |
| DELETE | `/api/lists/:id`     | Delete list            |
| PUT    | `/api/lists/reorder` | Reorder lists          |

---

## 📝 Task Endpoints

| Method | Endpoint                                | Description                  |
|--------|------------------------------------------|------------------------------|
| GET    | `/api/tasks?boardId=&search=&page=`      | Search tasks                 |
| POST   | `/api/tasks`                             | Create task                  |
| PUT    | `/api/tasks/:id`                         | Update task                  |
| DELETE | `/api/tasks/:id`                         | Delete task                  |
| PUT    | `/api/tasks/:id/move`                    | Move task between lists      |
| PUT    | `/api/tasks/:id/assign`                  | Assign user to task          |

---

## 📊 Activity Endpoints

| Method | Endpoint                           | Description      |
|--------|------------------------------------|------------------|
| GET    | `/api/activities?boardId=&page=`   | Get activities   |

---

# 🔄 Real-time Sync Strategy

## WebSocket Events

- `board:join`
- `board:leave`
- `task:created`
- `task:updated`
- `task:deleted`
- `task:moved`
- `list:created`
- `list:updated`
- `list:deleted`
- `member:added`
- `activity:new`

---

## Conflict Resolution

- Last-write-wins with server timestamp
- Optimistic UI updates with server reconciliation
- Socket rooms scoped to board IDs

---

# 📈 Scalability Considerations

- Stateless backend behind load balancer
- Redis adapter for multi-instance Socket.IO sync
- MongoDB replica sets and sharding by board ID
- Redis caching for frequently accessed boards
- CDN for static assets
- Per-user rate limiting
- Cursor-based pagination
- Compound indexes on `(boardId, position)`

---

# ⚖️ Assumptions & Trade-offs

## Assumptions

- Single workspace per deployment
- Board membership required for real-time updates
- Maximum 50 lists per board
- Maximum 500 tasks per list
- Activity history kept for 90 days

## Trade-offs

- JWT without refresh tokens
- In-memory socket management (Redis needed for scaling)
- No file attachments
- CSS instead of CSS-in-JS
