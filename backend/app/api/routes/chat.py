import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import decrypt_api_key
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.modules import ai_router, memory_module, search_module

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    use_search: bool = False
    assistant_mode: Optional[str] = None  # override


class ChatResponse(BaseModel):
    reply: str
    provider: Optional[str]
    session_id: str
    sources: list[dict] = []
    error: bool = False


def _get_api_keys(user: User) -> dict:
    keys = {}
    try:
        keys["openai"] = decrypt_api_key(user.openai_api_key_enc) if user.openai_api_key_enc else None
    except Exception:
        keys["openai"] = None
    try:
        keys["gemini"] = decrypt_api_key(user.gemini_api_key_enc) if user.gemini_api_key_enc else None
    except Exception:
        keys["gemini"] = None
    try:
        keys["anthropic"] = decrypt_api_key(user.anthropic_api_key_enc) if user.anthropic_api_key_enc else None
    except Exception:
        keys["anthropic"] = None
    try:
        keys["serpapi"] = decrypt_api_key(user.serpapi_key_enc) if user.serpapi_key_enc else None
    except Exception:
        keys["serpapi"] = None
    return keys


def _build_system_prompt(mode: str) -> str:
    if mode == "jarvis":
        return (
            "You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's AI assistant. "
            "You are precise, technical, slightly formal but witty. Refer to the user as 'sir' or 'ma'am'. "
            "Keep responses concise and actionable. Use a professional, confident tone."
        )
    return (
        "You are F.R.I.D.A.Y. (Female Replacement Intelligent Digital Assistant Youth), Tony Stark's AI. "
        "You are warm, approachable, and efficient. Speak naturally and helpfully. "
        "Be conversational, empathetic, and clear in your explanations."
    )


@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session_id = body.session_id or str(uuid.uuid4())
    api_keys = _get_api_keys(current_user)
    mode = body.assistant_mode or current_user.assistant_mode
    system_prompt = _build_system_prompt(mode)

    # Get short-term history
    history = memory_module.get_session_history(session_id)

    sources = []
    augmented_message = body.message

    # RAG: web search if requested
    if body.use_search and api_keys.get("serpapi"):
        try:
            search_data = await search_module.web_search(body.message, api_keys["serpapi"])
            sources = search_data.get("results", [])
            context = search_module.build_search_context(search_data)
            augmented_message = (
                f"User question: {body.message}\n\n"
                f"Web search context (use this to answer accurately):\n{context}\n\n"
                f"Please provide a comprehensive answer with source references."
            )
        except Exception as e:
            # Search failed — continue without it
            pass

    # Call AI
    result = await ai_router.route_and_call(
        prompt=augmented_message,
        user_preference=current_user.default_ai_provider,
        api_keys=api_keys,
        history=history,
        system_prompt=system_prompt,
    )

    reply = result["content"]
    provider = result.get("provider")

    # Update short-term memory
    memory_module.add_to_session(session_id, "user", body.message)
    memory_module.add_to_session(session_id, "assistant", reply)

    # Persist to DB
    await memory_module.save_message(db, current_user.id, session_id, "user", body.message)
    await memory_module.save_message(db, current_user.id, session_id, "assistant", reply, ai_provider=provider)

    return ChatResponse(
        reply=reply,
        provider=provider,
        session_id=session_id,
        sources=sources,
        error=result.get("error", False),
    )


@router.get("/history/{session_id}")
async def get_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    messages = await memory_module.get_conversation_history(db, current_user.id, session_id)
    return {"session_id": session_id, "messages": messages}


@router.delete("/history/{session_id}")
async def clear_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    memory_module.clear_session(session_id)
    return {"message": "Session cleared"}


@router.get("/sessions")
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select, distinct
    from app.models.memory import ConversationMessage
    result = await db.execute(
        select(
            ConversationMessage.session_id,
            ConversationMessage.created_at,
        )
        .where(ConversationMessage.user_id == current_user.id)
        .order_by(ConversationMessage.created_at.desc())
        .distinct(ConversationMessage.session_id)
    )
    rows = result.all()
    return {"sessions": [{"session_id": r.session_id, "created_at": r.created_at.isoformat()} for r in rows]}
