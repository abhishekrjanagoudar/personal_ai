"""
WebSocket handler for real-time bidirectional communication.
Enables streaming chat and live system status updates.
"""

import json
import uuid
import asyncio
from typing import Any
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import decrypt_api_key
from app.modules import ai_router, memory_module, search_module
from app.api.routes.auth import decode_access_token
from sqlalchemy import select
from app.models.user import User


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active[client_id] = websocket

    def disconnect(self, client_id: str):
        self.active.pop(client_id, None)

    async def send(self, client_id: str, data: dict):
        ws = self.active.get(client_id)
        if ws:
            await ws.send_json(data)

    async def broadcast(self, data: dict):
        for ws in self.active.values():
            await ws.send_json(data)


manager = ConnectionManager()


async def _get_user(token: str) -> Any:
    payload = decode_access_token(token)
    if not payload:
        return None
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == payload.get("sub")))
        return result.scalar_one_or_none()


async def websocket_endpoint(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    await manager.connect(websocket, client_id)
    user = None

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type")

            # Authentication handshake
            if msg_type == "auth":
                user = await _get_user(msg.get("token", ""))
                if user:
                    await manager.send(client_id, {"type": "auth_ok", "username": user.username, "mode": user.assistant_mode})
                else:
                    await manager.send(client_id, {"type": "auth_error", "message": "Invalid token"})
                continue

            if not user:
                await manager.send(client_id, {"type": "error", "message": "Not authenticated"})
                continue

            # Chat message
            if msg_type == "chat":
                session_id = msg.get("session_id") or str(uuid.uuid4())
                user_message = msg.get("message", "")
                use_search = msg.get("use_search", False)

                # Notify typing
                await manager.send(client_id, {"type": "typing", "session_id": session_id})

                # Decrypt keys
                api_keys = {}
                for field, attr in [("openai", "openai_api_key_enc"), ("gemini", "gemini_api_key_enc"),
                                     ("anthropic", "anthropic_api_key_enc"), ("serpapi", "serpapi_key_enc")]:
                    val = getattr(user, attr)
                    api_keys[field] = decrypt_api_key(val) if val else None

                history = memory_module.get_session_history(session_id)

                augmented = user_message
                sources = []
                if use_search and api_keys.get("serpapi"):
                    try:
                        search_data = await search_module.web_search(user_message, api_keys["serpapi"])
                        sources = search_data.get("results", [])
                        context = search_module.build_search_context(search_data)
                        augmented = (
                            f"User question: {user_message}\n\nWeb search context:\n{context}\n\n"
                            "Answer comprehensively with source references."
                        )
                    except Exception:
                        pass

                mode = user.assistant_mode
                system_prompt = (
                    "You are J.A.R.V.I.S., precise and technical. Call the user 'sir' or 'ma'am'."
                    if mode == "jarvis"
                    else "You are F.R.I.D.A.Y., warm and approachable. Be conversational and helpful."
                )

                result = await ai_router.route_and_call(
                    prompt=augmented,
                    user_preference=user.default_ai_provider,
                    api_keys=api_keys,
                    history=history,
                    system_prompt=system_prompt,
                )

                memory_module.add_to_session(session_id, "user", user_message)
                memory_module.add_to_session(session_id, "assistant", result["content"])

                async with AsyncSessionLocal() as db:
                    await memory_module.save_message(db, user.id, session_id, "user", user_message)
                    await memory_module.save_message(db, user.id, session_id, "assistant", result["content"], result.get("provider"))

                await manager.send(client_id, {
                    "type": "chat_response",
                    "session_id": session_id,
                    "reply": result["content"],
                    "provider": result.get("provider"),
                    "sources": sources,
                    "error": result.get("error", False),
                })

            # Ping/pong keepalive
            elif msg_type == "ping":
                await manager.send(client_id, {"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        try:
            await manager.send(client_id, {"type": "error", "message": str(e)})
        except Exception:
            pass
        manager.disconnect(client_id)
