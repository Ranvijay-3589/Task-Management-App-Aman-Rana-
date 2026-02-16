from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TaskPriority = Literal["low", "medium", "high"]
TaskStatus = Literal["pending", "in_progress", "completed"]


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    priority: TaskPriority
    status: TaskStatus
    due_date: date


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    due_date: date | None = None


class TaskRead(TaskBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: str
