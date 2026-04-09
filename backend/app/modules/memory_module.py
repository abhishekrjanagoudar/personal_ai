"""
Memory Module — Short-term (in-memory session) and long-term (database) memory.
"""

from collections import deque
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.memory import ConversationMessage, LongTermMemory

# Short-term: keyed by session_id → deque of messages (max 20)
_short_term: dict[str, deque] = {}
SHORT_TERM_MAX = 20


def get_session_history(session_id: str) -> list[dict]:
    return list(_short_term.get(session_id, []))


def add_to_session(session_id: str, role: str, content: str):
    if session_id not in _short_term:
        _short_term[session_id] = deque(maxlen=SHORT_TERM_MAX)
    _short_term[session_id].append({"role": role, "content": content})


def clear_session(session_id: str):
    _short_term.pop(session_id, None)


# Long-term DB operations
async def save_message(
    db: AsyncSession,
    user_id: int,
    session_id: str,
    role: str,
    content: str,
    ai_provider: Optional[str] = None,
):
    msg = ConversationMessage(
        user_id=user_id,
        session_id=session_id,
        role=role,
        content=content,
        ai_provider=ai_provider,
    )
    db.add(msg)
    await db.commit()


async def get_conversation_history(
    db: AsyncSession, user_id: int, session_id: str, limit: int = 50
) -> list[dict]:
    result = await db.execute(
        select(ConversationMessage)
        .where(
            ConversationMessage.user_id == user_id,
            ConversationMessage.session_id == session_id,
        )
        .order_by(ConversationMessage.created_at.asc())
        .limit(limit)
    )
    messages = result.scalars().all()
    return [{"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()} for m in messages]


async def upsert_long_term_memory(db: AsyncSession, user_id: int, key: str, value: str):
    result = await db.execute(
        select(LongTermMemory).where(
            LongTermMemory.user_id == user_id,
            LongTermMemory.key == key,
            LongTermMemory.is_active == True,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.value = value
        existing.updated_at = datetime.utcnow()
    else:
        db.add(LongTermMemory(user_id=user_id, key=key, value=value))
    await db.commit()


async def get_long_term_memory(db: AsyncSession, user_id: int) -> list[dict]:
    result = await db.execute(
        select(LongTermMemory).where(
            LongTermMemory.user_id == user_id,
            LongTermMemory.is_active == True,
        )
    )
    items = result.scalars().all()
    return [{"key": m.key, "value": m.value, "updated_at": m.updated_at.isoformat()} for m in items]
