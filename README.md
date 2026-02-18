# 🗂️ Job Tracker API

A production-ready **RESTful API** built with **Flask** for tracking job applications, companies, and application statuses. Features JWT-based authentication, role-based access control, input validation, and full Docker support with PostgreSQL.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Docker Setup (Recommended)](#-docker-setup-recommended)
  - [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
  - [Health Check](#health-check)
  - [Authentication](#authentication)
  - [Companies](#companies)
  - [Job Applications](#job-applications)
- [Data Models](#-data-models)
- [Status Workflow](#-status-workflow)
- [Error Handling](#-error-handling)
- [Testing](#-testing)
- [License](#-license)

---

## ✨ Features

| Category               | Details                                                                                  |
|------------------------|------------------------------------------------------------------------------------------|
| **Authentication**     | User registration & login with hashed passwords (Werkzeug). JWT access + refresh tokens. |
| **Authorization**      | Role-based access control (`user` / `admin`) via custom decorators.                      |
| **Company Management** | Create and list companies scoped to the authenticated user.                              |
| **Job Tracking**       | Create job applications, update statuses, and list with filtering, sorting & pagination.  |
| **Status Workflow**    | Enforced state-machine transitions: `applied → interview → offer` (with `rejected`).     |
| **Input Validation**   | Request payloads validated via Marshmallow schemas.                                      |
| **Error Handling**     | Global exception handlers for validation errors, app errors, and unexpected failures.    |
| **Database Migrations**| Managed with Flask-Migrate (Alembic) for safe, version-controlled schema changes.        |
| **Docker Ready**       | Single-command deployment via `docker compose` with PostgreSQL.                          |
| **Testing**            | Pytest test suite with in-memory SQLite for isolated, fast tests.                        |
| **Logging**            | Structured application logging with timestamps.                                          |

---

## 🛠️ Tech Stack

| Layer              | Technology                                           |
|--------------------|------------------------------------------------------|
| **Framework**      | Flask                                                |
| **Database**       | PostgreSQL 15                                        |
| **ORM**            | Flask-SQLAlchemy                                     |
| **Migrations**     | Flask-Migrate (Alembic)                              |
| **Auth**           | Flask-JWT-Extended (access & refresh tokens)         |
| **Validation**     | Marshmallow                                          |
| **Password Hash**  | Werkzeug Security                                    |
| **Testing**        | Pytest + pytest-flask                                |
| **Containerization** | Docker + Docker Compose                            |
| **Language**       | Python 3.12                                          |

---

## 🏗️ Architecture

The application follows a **layered architecture** pattern to enforce separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                    │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│               ROUTES (Controllers)                  │
│  auth.py  │  companies.py  │  jobs.py  │  health.py │
│  ─── request parsing, auth guards, responses ───    │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                 SCHEMAS (Validation)                 │
│       company_schema.py   │   job_schema.py         │
│       ─── Marshmallow input validation ───          │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│               SERVICES (Business Logic)             │
│        company_service.py  │  job_service.py        │
│  ─── validation, state machine, DB operations ───   │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                 MODELS (Data Layer)                  │
│    user.py  │  company.py  │  job_application.py    │
│    ─── SQLAlchemy ORM models + relationships ───    │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│               PostgreSQL Database                   │
│        users  │  companies  │  job_applications     │
└─────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer        | Responsibility                                                                 |
|--------------|--------------------------------------------------------------------------------|
| **Routes**   | HTTP request/response handling, JWT authentication, blueprint registration     |
| **Schemas**  | Deserialize & validate incoming JSON payloads using Marshmallow                |
| **Services** | Core business logic, status transition enforcement, database transactions      |
| **Models**   | SQLAlchemy table definitions, relationships, and password hashing              |
| **Utils**    | Cross-cutting concerns: custom exceptions (`AppException`, `NotFoundException`, `ForbiddenException`) and role-based decorators |

### Application Factory

The app uses Flask's **application factory pattern** (`create_app()`) allowing:
- Multiple configurations (Development, Production, Test)
- Clean extension initialization (SQLAlchemy, Migrate, JWT)
- Global error handler registration for consistent JSON error responses

---

## 📁 Project Structure

```
job-tracker-api/
├── app/
│   ├── __init__.py              # Application factory (create_app)
│   ├── config.py                # Configuration classes (Dev, Prod, Test)
│   ├── extensions.py            # Flask extension instances (db, migrate, jwt)
│   ├── models/
│   │   ├── __init__.py          # Model imports
│   │   ├── user.py              # User model with password hashing
│   │   ├── company.py           # Company model (belongs to User)
│   │   └── job_application.py   # JobApplication model (belongs to User & Company)
│   ├── routes/
│   │   ├── auth.py              # Register, login, profile, refresh, admin routes
│   │   ├── companies.py         # Company CRUD endpoints
│   │   ├── jobs.py              # Job application CRUD endpoints
│   │   └── health.py            # Health check endpoint
│   ├── schemas/
│   │   ├── company_schema.py    # Company validation schema
│   │   └── job_schema.py        # Job create & status update schemas
│   ├── services/
│   │   ├── company_service.py   # Company business logic
│   │   └── job_service.py       # Job business logic + status state machine
│   └── utils/
│       ├── decorators.py        # role_required decorator
│       └── exceptions.py        # Custom exception classes
├── migrations/                  # Alembic migration files
├── tests/
│   ├── conftest.py              # Pytest fixtures (app, client, db setup)
│   ├── test_auth.py             # Authentication tests
│   └── test_jobs.py             # Job application tests
├── .env                         # Environment variables (local dev)
├── .dockerignore                # Docker build exclusions
├── Dockerfile                   # Container image definition
├── docker-compose.yml           # Multi-service orchestration
├── requirements.txt             # Python dependencies
├── pytest.ini                   # Pytest configuration
└── run.py                       # Application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.12+
- **PostgreSQL** 15+ (or use Docker)
- **Docker** & **Docker Compose** (for containerized setup)

---

### 🐳 Docker Setup (Recommended)

The fastest way to get started — no local Python or PostgreSQL installation required.

**1. Clone the repository**

```bash
git clone <repository-url>
cd job-tracker-api
```

**2. Start all services**

```bash
docker compose up --build
```

This will:
- Build the Flask API container (`job_tracker_api`) from `Dockerfile`
- Start a PostgreSQL 15 container (`job_tracker_db`)
- Create a persistent volume for database data
- Expose the API on `http://localhost:5000`

**3. Run database migrations** (first time only)

```bash
docker exec -it job_tracker_api flask db upgrade
```

**4. Stop services**

```bash
docker compose down
```

> **💡 Tip:** Add `-v` to `docker compose down -v` to also remove the database volume (fresh start).

---

### 💻 Local Setup

**1. Clone the repository**

```bash
git clone <repository-url>
cd job-tracker-api
```

**2. Create and activate a virtual environment**

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Configure environment variables**

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/job_tracker
JWT_SECRET_KEY=your-super-secret-key-change-in-production
```

**5. Set up the database**

```bash
# Create the database in PostgreSQL
createdb job_tracker

# Run migrations
flask db upgrade
```

**6. Start the development server**

```bash
python run.py
```

The API will be available at `http://localhost:5000`.

---

## 🔐 Environment Variables

| Variable          | Description                          | Default                     |
|-------------------|--------------------------------------|-----------------------------|
| `DATABASE_URL`    | PostgreSQL connection string         | *Required*                  |
| `JWT_SECRET_KEY`  | Secret key for signing JWT tokens    | `dev-secret-key`            |

### Configuration Profiles

| Profile           | Debug | Access Token TTL | Database       |
|-------------------|-------|------------------|----------------|
| `DevelopmentConfig` | ✅    | 1 hour           | PostgreSQL     |
| `ProductionConfig`  | ❌    | 15 minutes       | PostgreSQL     |
| `TestConfig`        | ❌    | 15 minutes       | SQLite (memory)|

---

## 📡 API Endpoints

> **Base URL:** `http://localhost:5000`
>
> **Auth:** Endpoints marked with 🔒 require a `Bearer` token in the `Authorization` header.
>
> **Admin:** Endpoints marked with 🛡️ require the `admin` role.

---

### Health Check

| Method | Endpoint   | Auth | Description       |
|--------|-----------|------|-------------------|
| `GET`  | `/health` | ❌    | Service heartbeat |

**Response:**

```json
{ "status": "ok" }
```

---

### Authentication

| Method | Endpoint         | Auth | Description                     |
|--------|-----------------|------|---------------------------------|
| `POST` | `/auth/register` | ❌    | Register a new user             |
| `POST` | `/auth/login`    | ❌    | Login and receive tokens        |
| `GET`  | `/auth/me`       | 🔒    | Get current user profile        |
| `POST` | `/auth/refresh`  | 🔒*   | Refresh access token            |
| `GET`  | `/auth/admin-only` | 🔒🛡️ | Admin-only test endpoint       |

> *\* Requires the **refresh token** (not the access token).*

#### `POST /auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "user"           
}
```

> `role` is optional, defaults to `"user"`. Can be `"user"` or `"admin"`.

**Response:** `201 Created`

```json
{ "message": "user registered succesfully" }
```

**Errors:**
- `400` — Missing email or password
- `409` — Email already exists

---

#### `POST /auth/login`

Authenticate and receive JWT tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi..."
}
```

**Errors:**
- `401` — Invalid credentials

---

#### `GET /auth/me` 🔒

Get the authenticated user's profile.

**Response:** `200 OK`

```json
{
  "id": "1",
  "email": "user@example.com"
}
```

---

#### `POST /auth/refresh` 🔒

Exchange a valid refresh token for a new access token.

**Headers:**

```
Authorization: Bearer <refresh_token>
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOi..."
}
```

---

### Companies

| Method | Endpoint     | Auth | Description                         |
|--------|-------------|------|-------------------------------------|
| `POST` | `/companies` | 🔒    | Create a new company                |
| `GET`  | `/companies` | 🔒    | List all companies for current user |

#### `POST /companies` 🔒

Create a new company associated with the authenticated user.

**Request Body:**

```json
{
  "name": "Google",
  "location": "Mountain View, CA",
  "website": "https://google.com"
}
```

> `location` and `website` are optional.

**Response:** `201 Created`

```json
{
  "id": 1,
  "name": "Google",
  "location": "Mountain View, CA",
  "website": "https://google.com"
}
```

---

#### `GET /companies` 🔒

List all companies belonging to the authenticated user.

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Google",
    "location": "Mountain View, CA",
    "website": "https://google.com"
  }
]
```

---

### Job Applications

| Method  | Endpoint                  | Auth | Description                     |
|---------|--------------------------|------|---------------------------------|
| `POST`  | `/jobs`                   | 🔒    | Create a new job application    |
| `GET`   | `/jobs`                   | 🔒    | List jobs (filter, sort, page)  |
| `PATCH` | `/jobs/<job_id>/status`   | 🔒    | Update job application status   |

#### `POST /jobs` 🔒

Create a new job application linked to a company.

**Request Body:**

```json
{
  "title": "Software Engineer",
  "company_id": 1
}
```

> The `company_id` must belong to the authenticated user.

**Response:** `201 Created`

```json
{
  "id": 1,
  "title": "Software Engineer",
  "status": "applied",
  "company_id": 1
}
```

**Errors:**
- `400` — Missing title or company ID
- `404` — Company not found (or doesn't belong to user)

---

#### `GET /jobs` 🔒

List job applications with **filtering**, **sorting**, and **pagination**.

**Query Parameters:**

| Parameter | Type    | Default | Description                          |
|-----------|---------|---------|--------------------------------------|
| `status`  | string  | *all*   | Filter by status (`applied`, `interview`, `offer`, `rejected`) |
| `sort`    | string  | `desc`  | Sort by applied date (`asc` or `desc`) |
| `limit`   | integer | `10`    | Number of results per page            |
| `offset`  | integer | `0`     | Number of results to skip             |

**Example:**

```
GET /jobs?status=interview&sort=asc&limit=5&offset=0
```

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "status": "interview",
    "company": {
      "id": 1,
      "name": "Google"
    },
    "applied_date": "2026-02-18T08:30:00"
  }
]
```

---

#### `PATCH /jobs/<job_id>/status` 🔒

Update the status of a job application. Enforces valid transitions only.

**Request Body:**

```json
{
  "status": "interview"
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "title": "Software Engineer",
  "status": "interview"
}
```

**Errors:**
- `400` — Invalid status or invalid transition
- `404` — Job not found

---

## 📊 Data Models

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌────────────────────┐
│    users     │       │    companies     │       │  job_applications  │
├──────────────┤       ├──────────────────┤       ├────────────────────┤
│ id       PK  │──┐    │ id           PK  │──┐    │ id             PK  │
│ email        │  │    │ name             │  │    │ title              │
│ password_hash│  │    │ location         │  │    │ status             │
│ role         │  ├───→│ website          │  ├───→│ applied_date       │
│ created_at   │  │    │ created_at       │  │    │ company_id     FK  │
└──────────────┘  │    │ user_id      FK  │  │    │ user_id        FK  │
                  │    └──────────────────┘  │    └────────────────────┘
                  │             ▲             │             ▲
                  │             │             │             │
                  └─────────────┘             └─────────────┘
                   1:N (owns)                  1:N (has)
```

### Field Details

**Users**

| Column          | Type         | Constraints                    |
|-----------------|--------------|--------------------------------|
| `id`            | Integer      | Primary Key                    |
| `email`         | String(120)  | Unique, Not Null               |
| `password_hash` | String(255)  | Not Null                       |
| `role`          | String(50)   | Not Null, Default: `"user"`    |
| `created_at`    | DateTime     | Not Null, Server Default: now  |

**Companies**

| Column       | Type         | Constraints                    |
|--------------|--------------|--------------------------------|
| `id`         | Integer      | Primary Key                    |
| `name`       | String(255)  | Not Null                       |
| `location`   | String(255)  | Nullable                       |
| `website`    | String(255)  | Nullable                       |
| `created_at` | DateTime     | Not Null, Server Default: now  |
| `user_id`    | Integer (FK) | Not Null → `users.id`          |

**Job Applications**

| Column         | Type         | Constraints                      |
|----------------|--------------|----------------------------------|
| `id`           | Integer      | Primary Key                      |
| `title`        | String(255)  | Not Null                         |
| `status`       | String(50)   | Not Null, Default: `"applied"`   |
| `applied_date` | DateTime     | Not Null, Server Default: now    |
| `company_id`   | Integer (FK) | Not Null → `companies.id`        |
| `user_id`      | Integer (FK) | Not Null → `users.id`            |

---

## 🔄 Status Workflow

Job applications follow a strict **state machine** with allowed transitions:

```
                    ┌───────────┐
                    │  applied  │
                    └─────┬─────┘
                          │
               ┌──────────┴──────────┐
               ▼                     ▼
        ┌────────────┐        ┌────────────┐
        │ interview  │        │  rejected  │
        └──────┬─────┘        └────────────┘
               │                     ▲
        ┌──────┴──────┐              │
        ▼             └──────────────┘
  ┌───────────┐
  │   offer   │
  └───────────┘
```

| Current Status | Allowed Transitions            |
|----------------|--------------------------------|
| `applied`      | `interview`, `rejected`        |
| `interview`    | `offer`, `rejected`            |
| `offer`        | *(terminal state)*             |
| `rejected`     | *(terminal state)*             |

---

## ⚠️ Error Handling

All errors return consistent JSON responses:

```json
{
  "error": "Error message or validation details"
}
```

| HTTP Code | Exception             | Description                              |
|-----------|-----------------------|------------------------------------------|
| `400`     | `AppException`        | Bad request / business logic violation   |
| `400`     | `ValidationError`     | Marshmallow schema validation failure    |
| `401`     | JWT Unauthorized      | Missing or invalid token                 |
| `403`     | `ForbiddenException`  | Insufficient role permissions            |
| `404`     | `NotFoundException`   | Resource not found                       |
| `409`     | `IntegrityError`      | Duplicate resource (e.g., email)         |
| `500`     | Unhandled `Exception` | Internal server error (generic message)  |

---

## 🧪 Testing

The project uses **pytest** with an **in-memory SQLite database** for fast, isolated tests.

**Run all tests:**

```bash
pytest
```

**Run with verbose output:**

```bash
pytest -v
```

**Test coverage includes:**
- User registration & login flows
- JWT token generation & validation
- Job application creation
- Job status transitions (valid & invalid)
- Company ownership validation
- Error response format verification

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using Flask & PostgreSQL
</p>
