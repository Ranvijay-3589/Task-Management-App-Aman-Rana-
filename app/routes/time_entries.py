from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Task, TimeEntry, User
from app.schemas import (
    PeriodSummary,
    TaskTimeSummary,
    TimeEntryResponse,
    TimerStartResponse,
    TimerStopResponse,
)

router = APIRouter(prefix="/api/tasks", tags=["time-tracking"])


@router.post("/{task_id}/start", response_model=TimerStartResponse)
def start_timer(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    active_entry = (
        db.query(TimeEntry)
        .filter(TimeEntry.task_id == task_id, TimeEntry.end_time.is_(None))
        .first()
    )
    if active_entry:
        raise HTTPException(status_code=400, detail="Timer is already running for this task")

    entry = TimeEntry(task_id=task_id, start_time=datetime.now(timezone.utc))
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return TimerStartResponse(message="Timer started", time_entry=TimeEntryResponse.model_validate(entry))


@router.post("/{task_id}/stop", response_model=TimerStopResponse)
def stop_timer(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    active_entry = (
        db.query(TimeEntry)
        .filter(TimeEntry.task_id == task_id, TimeEntry.end_time.is_(None))
        .first()
    )
    if not active_entry:
        raise HTTPException(status_code=400, detail="No active timer for this task")

    now = datetime.now(timezone.utc)
    active_entry.end_time = now
    start = active_entry.start_time
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    active_entry.duration_seconds = (now - start).total_seconds()

    db.commit()
    db.refresh(active_entry)
    return TimerStopResponse(
        message="Timer stopped",
        time_entry=TimeEntryResponse.model_validate(active_entry),
        duration_seconds=active_entry.duration_seconds,
    )


@router.get("/{task_id}/time-entries", response_model=list[TimeEntryResponse])
def list_time_entries(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    entries = (
        db.query(TimeEntry)
        .filter(TimeEntry.task_id == task_id)
        .order_by(TimeEntry.start_time.desc())
        .all()
    )
    return entries


# ── Summary / Filter Endpoint ─────────────────────────────────

time_router = APIRouter(prefix="/api/time-summary", tags=["time-tracking"])


@time_router.get("", response_model=PeriodSummary)
def get_time_summary(
    period: str = Query(default="today", pattern="^(today|this_week|this_month|custom)$"),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    if period == "today":
        date_from = today_start
        date_to = today_start + timedelta(days=1)
    elif period == "this_week":
        date_from = today_start - timedelta(days=now.weekday())
        date_to = date_from + timedelta(days=7)
    elif period == "this_month":
        date_from = today_start.replace(day=1)
        next_month = (date_from.month % 12) + 1
        year = date_from.year + (1 if next_month == 1 else 0)
        date_to = date_from.replace(year=year, month=next_month)
    elif period == "custom":
        if not start_date or not end_date:
            raise HTTPException(status_code=400, detail="start_date and end_date required for custom period")
        date_from = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        date_to = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc) + timedelta(days=1)
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    user_task_ids = db.query(Task.id).filter(Task.user_id == current_user.id).subquery()

    entries = (
        db.query(TimeEntry)
        .filter(
            TimeEntry.task_id.in_(user_task_ids),
            TimeEntry.start_time >= date_from,
            TimeEntry.start_time < date_to,
            TimeEntry.end_time.isnot(None),
        )
        .all()
    )

    task_map: dict[int, dict] = {}
    total_seconds = 0.0

    for entry in entries:
        dur = entry.duration_seconds or 0
        total_seconds += dur
        if entry.task_id not in task_map:
            task = db.query(Task).filter(Task.id == entry.task_id).first()
            task_map[entry.task_id] = {
                "task_id": entry.task_id,
                "task_title": task.title if task else "Unknown",
                "total_seconds": 0,
                "entry_count": 0,
            }
        task_map[entry.task_id]["total_seconds"] += dur
        task_map[entry.task_id]["entry_count"] += 1

    return PeriodSummary(
        period=period,
        start_date=date_from.isoformat(),
        end_date=date_to.isoformat(),
        total_seconds=total_seconds,
        task_summaries=[TaskTimeSummary(**v) for v in task_map.values()],
    )
