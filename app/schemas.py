from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Auth Schemas ──────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Task Schemas ──────────────────────────────────────────────

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    status: str = Field(default="pending", pattern="^(pending|in_progress|done)$")
    due_date: Optional[date] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: Optional[str] = Field(default=None, pattern="^(low|medium|high)$")
    status: Optional[str] = Field(default=None, pattern="^(pending|in_progress|done)$")
    due_date: Optional[date] = None


class TimeEntryResponse(BaseModel):
    id: int
    task_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_time_seconds: float = 0
    is_timing: bool = False
    active_entry_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class TaskWithEntries(TaskResponse):
    time_entries: list[TimeEntryResponse] = []


# ── Time Entry Schemas ────────────────────────────────────────

class TimerStartResponse(BaseModel):
    message: str
    time_entry: TimeEntryResponse


class TimerStopResponse(BaseModel):
    message: str
    time_entry: TimeEntryResponse
    duration_seconds: float


# ── Summary Schemas ───────────────────────────────────────────

class TaskTimeSummary(BaseModel):
    task_id: int
    task_title: str
    total_seconds: float
    entry_count: int


class PeriodSummary(BaseModel):
    period: str
    start_date: str
    end_date: str
    total_seconds: float
    task_summaries: list[TaskTimeSummary]
