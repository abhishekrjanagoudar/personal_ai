from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket

from app.core.config import get_settings
from app.core.database import init_db
from app.api.routes import auth, chat, search, system, memory
from app.api.websocket import websocket_endpoint

settings = get_settings()

app = FastAPI(
    title="Personal AI — Jarvis/Friday",
    description="High-tech AI assistant backend with voice, multi-AI, search, and app control.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await init_db()


# REST routes
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(system.router, prefix="/api")
app.include_router(memory.router, prefix="/api")


# WebSocket
@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket_endpoint(websocket)


@app.get("/")
async def root():
    return {"message": "Personal AI Backend", "docs": "/docs"}
