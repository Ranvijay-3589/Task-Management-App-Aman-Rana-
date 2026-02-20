# Task Management App API

FastAPI + PostgreSQL API for creating, listing, updating, and deleting tasks.

## Run

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Start server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Endpoints

- `GET /api/health`
- `POST /api/tasks`
- `GET /api/tasks?status=`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
