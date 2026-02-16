from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.crud import create_task, delete_task, get_task, list_tasks, update_task
from app.database import Base
from app.schemas import TaskCreate, TaskUpdate


def build_session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)
    return SessionLocal()


def test_create_and_list_tasks() -> None:
    db = build_session()
    try:
        payload = TaskCreate(
            title="Finish report",
            priority="high",
            status="pending",
            due_date=date(2026, 2, 20),
        )

        created = create_task(db, payload)
        all_tasks = list_tasks(db)

        assert created.id == 1
        assert len(all_tasks) == 1
        assert all_tasks[0].title == "Finish report"
        assert all_tasks[0].status == "pending"
    finally:
        db.close()


def test_filter_tasks_by_status() -> None:
    db = build_session()
    try:
        create_task(
            db,
            TaskCreate(title="Task 1", priority="low", status="pending", due_date=date(2026, 2, 21)),
        )
        create_task(
            db,
            TaskCreate(title="Task 2", priority="medium", status="completed", due_date=date(2026, 2, 22)),
        )

        completed_tasks = list_tasks(db, status="completed")

        assert len(completed_tasks) == 1
        assert completed_tasks[0].title == "Task 2"
    finally:
        db.close()


def test_update_task() -> None:
    db = build_session()
    try:
        task = create_task(
            db,
            TaskCreate(title="Original", priority="low", status="pending", due_date=date(2026, 2, 23)),
        )

        updated = update_task(
            db,
            task,
            TaskUpdate(title="Updated", priority="high", status="in_progress"),
        )

        assert updated.title == "Updated"
        assert updated.priority == "high"
        assert updated.status == "in_progress"
    finally:
        db.close()


def test_delete_task() -> None:
    db = build_session()
    try:
        task = create_task(
            db,
            TaskCreate(title="Delete me", priority="medium", status="pending", due_date=date(2026, 2, 24)),
        )

        delete_task(db, task)

        remaining = list_tasks(db)
        assert remaining == []
    finally:
        db.close()


def test_get_task_not_found() -> None:
    db = build_session()
    try:
        task = get_task(db, task_id=999)
        assert task is None
    finally:
        db.close()
