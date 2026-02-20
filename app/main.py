from fastapi import FastAPI

from app.database import Base, engine
from app.routes.tasks import router as tasks_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management App", version="1.0.0")


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(tasks_router)
