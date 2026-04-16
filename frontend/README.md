# TaskFoundry

TaskFoundry implements a scalable REST API with authentication, role-based access, and a focused frontend workspace for task operations.

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, express-validator
- Frontend: Vite + React (MongoDB-inspired theme from design.md)
- API Docs: Swagger (`/api/docs`)
- API Testing: Postman collection + environment JSON

## Features Delivered
- User registration/login with password hashing (`bcryptjs`) and JWT auth
- Role support (`user`, `admin`) with invite-code protected admin registration
- Protected profile API (`GET /api/v1/auth/me`)
- Full CRUD for secondary entity: tasks
- Validation + sanitization + centralized error handling
- API versioning (`/api/v1`)
- Swagger documentation
- Separate login, registration, and protected task workspace screens
- Scalability note included

## Project Structure

```text
backend/
  src/
    app.js
    server.js
    config/
    controllers/
    docs/
    middlewares/
    models/
    routes/v1/
    services/
    utils/
frontend/
  index.html
  vite.config.js
  package.json
  src/
    main.jsx
    styles.css
postman/
  Backend-Intern-Assignment.postman_collection.json
  Local.postman_environment.json
docs/
  scalability-note.md
```

## Setup Instructions

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm start
```

Backend runs at: `http://localhost:5001`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## API Documentation
- Swagger UI: `http://localhost:5001/api/docs`

## Postman Import
Import both files from `postman/`:
1. `Backend-Intern-Assignment.postman_collection.json`
2. `Local.postman_environment.json`

Then select the environment and run requests in this order:
1. Register User / Login
2. Create Task
3. List/Get/Update/Delete Task

## API Endpoints (Summary)

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Tasks (JWT required)
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PUT /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`
- `GET /api/v1/tasks/admin/stats` (admin only)

## Notes for Evaluation Criteria
- REST design: proper status codes and resource-based routes
- Schema design: indexed user/task schemas in MongoDB
- Security: password hashing, JWT, validation, forbidden key sanitization
- Frontend integration: all core APIs callable from UI
- Scalability readiness: layered architecture, versioning, pagination, roadmap
