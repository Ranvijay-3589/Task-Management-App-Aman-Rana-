from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Task, TimeEntry, User
from app.schemas import TaskCreate, TaskResponse, TaskUpdate, TaskWithEntries

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _build_task_response(task: Task) -> dict:
    """Build task response with computed time tracking fields."""
    total_seconds = sum(
        (e.duration_seconds or 0) for e in task.time_entries
    )
    active_entry = next(
        (e for e in task.time_entries if e.end_time is None), None
    )
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "due_date": task.due_date,
        "user_id": task.user_id,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "total_time_seconds": total_seconds,
        "is_timing": active_entry is not None,
        "active_entry_id": active_entry.id if active_entry else None,
    }


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        status=payload.status,
        due_date=payload.due_date,
        user_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _build_task_response(task)


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    priority: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task).filter(Task.user_id == current_user.id)
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority:
        query = query.filter(Task.priority == priority)
    tasks = query.order_by(Task.created_at.desc()).all()
    return [_build_task_response(t) for t in tasks]


@router.get("/{task_id}", response_model=TaskWithEntries)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    resp = _build_task_response(task)
    resp["time_entries"] = task.time_entries
    return resp


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return _build_task_response(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(task)
    db.commit()
    return None
