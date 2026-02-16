# Task Management App API

FastAPI-based task management backend with PostgreSQL persistence.

## Features

- Create task: `POST /api/tasks`
- View tasks (optional status filter): `GET /api/tasks?status=`
- Update task: `PUT /api/tasks/{id}`
- Delete task: `DELETE /api/tasks/{id}`
- Health check: `GET /api/health`

## Tech Stack

- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Uvicorn
- Pytest

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables by creating `.env`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/task_management
```

## Run API

```bash
uvicorn app.main:app --reload
```

## Run Tests

```bash
pytest -q
```

## API Payload Example

```json
{
  "title": "Prepare sprint update",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-02-20"
}
```

Allowed values:

- `priority`: `low`, `medium`, `high`
- `status`: `pending`, `in_progress`, `completed`
