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

| User   | Email             | Password    |
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

| Method | Endpoint                                 | Description                  |
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

---

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐        ┌──────────────────────┐               │
│  │    USERS     │        │       BOARDS         │               │
│  ├──────────────┤        ├──────────────────────┤               │
│  │ _id          │←──┐    │ _id                  │               │
│  │ name         │   │    │ title                │               │
│  │ email (idx)  │   ├────│ owner (ref→User)     │               │
│  │ password     │   │    │ description          │               │
│  │ avatar       │   │    │ background           │               │
│  │ createdAt    │   │    │ members[]:           │               │
│  │ updatedAt    │   ├────│   user (ref→User)    │               │
│  └──────────────┘   │    │   role               │               │
│                     │    │   addedAt            │               │
│                     │    │ isArchived           │               │
│                     │    │ createdAt            │               │
│                     │    │ updatedAt            │               │
│                     │    └──────────┬───────────┘               │
│                     │               │                           │
│                     │    ┌──────────▼───────────┐               │
│                     │    │       LISTS          │               │
│                     │    ├──────────────────────┤               │
│                     │    │ _id                  │               │
│                     │    │ title                │               │
│                     │    │ board (ref→Board)    │──idx──┐       │
│                     │    │ position (idx)       │       │       │
│                     │    │ isArchived           │       │       │
│                     │    │ createdAt            │       │       │
│                     │    │ updatedAt            │       │       │
│                     │    └──────────┬───────────┘       │       │
│                     │               │                   │       │
│                     │    ┌──────────▼───────────┐       │       │
│                     │    │       TASKS          │       │       │
│                     │    ├──────────────────────┤       │       │
│                     │    │ _id                  │       │       │
│                     │    │ title (text idx)     │       │       │
│                     │    │ description          │       │       │
│                     │    │ list (ref→List)      │──idx  │       │
│                     │    │ board (ref→Board)    │───────┘       │
│                     │    │ position (idx)       │               │
│                     │    │ priority (idx)       │               │
│                     │    │ labels[]             │               │
│                     ├────│ assignees[] (ref→User)│              │
│                     │    │ dueDate (idx)        │               │
│                     │    │ isCompleted          │               │
│                     │    │ isArchived           │               │
│                     ├────│ createdBy (ref→User) │               │
│                     │    │ createdAt            │               │
│                     │    │ updatedAt            │               │
│                     │    └──────────────────────┘               │
│                     │                                           │
│                     │    ┌──────────────────────┐               │
│                     │    │    ACTIVITIES        │               │
│                     │    ├──────────────────────┤               │
│                     │    │ _id                  │               │
│                     │    │ board (ref→Board)    │──idx          │
│                     ├────│ user (ref→User)      │               │
│                          │ action (enum)        │               │
│                          │ entityType           │               │
│                          │ entityId             │               │
│                          │ entityTitle          │               │
│                          │ details (Mixed)      │               │
│                          │ createdAt (TTL:90d)  │──idx          │
│                          └──────────────────────┘               │
│                                                                 │
│  INDEXES:                                                       │
│  ─ users:   { email: 1 }, { name: 'text', email: 'text' }       │
│  ─ boards:  { owner: 1 }, { 'members.user': 1 }                 │
│  ─ lists:   { board: 1, position: 1 }                           │
│  ─ tasks:   { list: 1, position: 1 }, { board: 1 },             │
│             { assignees: 1 }, { dueDate: 1 },                   │
│             { board: 1, title: 'text', description: 'text' }    │
│  ─ activities: { board: 1, createdAt: -1 },                     │
│               { createdAt: 1 } (TTL: 90 days)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setup Steps

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd task-collab-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Start MongoDB

```bash
# Option A: If MongoDB is installed locally
mongod

# Option B: Using Docker
docker run -d -p 27017:27017 --name taskcollab_mongo mongo:7
```

### Step 3: Seed the Database

```bash
#Create .env like the .env.example file shown for both the frontend and the backend
```

### Step 4: Seed the Database

```bash
cd backend
npm run seed
```

### Step 5: Start Backend

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Step 6: Start Frontend

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### Step 7: Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Docker Option (All at once)

```bash
docker-compose up --build
# Then seed: docker exec -it taskcollab_backend node src/seed.js
```

---

This gives you a fully functional real-time task collaboration platform with:

- **Authentication** (JWT signup/login)
- **Board management** with colored backgrounds
- **Lists** with create, rename, delete
- **Tasks** with drag-and-drop, priorities, due dates, labels, assignees
- **Real-time updates** via Socket.IO (all users see changes instantly)
- **Activity feed** with paginated history
- **Search** across boards and tasks
- **Pagination** on boards and activities
- **Member management** (invite by email, role-based permissions)
- **Test coverage** for API endpoints, components, and Redux store
