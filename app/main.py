from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import HealthResponse, TaskCreate, TaskRead, TaskStatus, TaskUpdate

app = FastAPI(title="Task Management App API", version="1.0.0")


@app.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/api/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, db: Session = Depends(get_db)) -> TaskRead:
    task = crud.create_task(db, payload)
    return task


@app.get("/api/tasks", response_model=list[TaskRead])
async def list_tasks(status: TaskStatus | None = Query(default=None), db: Session = Depends(get_db)) -> list[TaskRead]:
    return crud.list_tasks(db, status=status)


@app.put("/api/tasks/{task_id}", response_model=TaskRead)
async def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)) -> TaskRead:
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return crud.update_task(db, task, payload)


@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, db: Session = Depends(get_db)) -> Response:
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    crud.delete_task(db, task)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
