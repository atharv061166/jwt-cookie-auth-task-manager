# Task Manager - Backend Developer Assignment

A full-stack task management application with authentication, role-based access control, and a modern React frontend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local installation OR Docker container)
- npm

### Option 1: Docker Compose (Recommended)

```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Start all services
docker compose up --build
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Docs**: http://localhost:5001/api/v1/docs/

### Option 2: Local Development

#### Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

Backend runs on **http://localhost:5001** (or port in your `.env`)

#### Frontend Setup

```bash
cd frontend
npm install
cp env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:5001
npm run dev
```

Frontend runs on **http://localhost:3000**

## 📋 Features

- ✅ User authentication (register/login) with JWT cookies
- ✅ Role-based access control (user/admin)
- ✅ Task CRUD operations
- ✅ Ownership validation (users can only modify their own tasks)
- ✅ Admin can view/manage all tasks
- ✅ Modern, responsive UI
- ✅ API documentation (Swagger)

## 🔌 API Endpoints

All endpoints are under `/api/v1`:

**Authentication:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

**Tasks:**
- `GET /api/v1/tasks` - List tasks (query: `?status=todo&scope=all` for admin)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task
- `PATCH /api/v1/tasks/:id` - Partial update
- `PUT /api/v1/tasks/:id` - Full update
- `DELETE /api/v1/tasks/:id` - Delete task

## 🔐 Authentication

JWT tokens are stored in **httpOnly cookies** for security. The frontend automatically sends cookies with all requests using `credentials: 'include'`.

## 🧪 Testing

```bash
cd backend
npm test
```

## 📚 Documentation

- **Swagger UI**: http://localhost:5001/api/v1/docs/
- **OpenAPI Spec**: `backend/src/swagger/swagger.yaml`

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT (httpOnly cookies)
- Swagger/OpenAPI

**Frontend:**
- React + Vite
- Modern CSS with gradients and animations

## 📝 Environment Variables

**Backend** (`.env`):
```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/intern-assignment
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
NODE_ENV=development
ACCESS_COOKIE_NAME=access_token
FRONTEND_ORIGIN=http://localhost:3000
```

**Frontend** (`.env`):
```
VITE_API_BASE_URL=http://localhost:5001
```

## ⚠️ Troubleshooting

**Port 5000 conflict (macOS):**
- macOS uses port 5000 for AirPlay Receiver
- Use port 5001 or higher in backend `.env`
- Update frontend `VITE_API_BASE_URL` to match

**MongoDB connection:**
- Ensure MongoDB is running: `brew services start mongodb-community` (macOS)
- Or use Docker: `docker run -d -p 27017:27017 mongo:7`

**CORS errors:**
- Verify `FRONTEND_ORIGIN` in backend `.env` matches your frontend URL
- Ensure frontend uses `credentials: 'include'` in fetch calls

## 📦 Docker

```bash
# Build and start all services
docker compose up --build

# Stop services
docker compose down

# View logs
docker compose logs -f
```
⚠️ Note:
The frontend is a browser-based application.
API requests must use http://localhost:5001, not Docker service names
(e.g. `backend`), because Docker DNS does not exist in the browser.
