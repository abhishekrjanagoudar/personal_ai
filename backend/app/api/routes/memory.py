from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.modules import memory_module

router = APIRouter(prefix="/memory", tags=["memory"])


class MemoryUpsertRequest(BaseModel):
    key: str
    value: str


@router.get("")
async def get_memory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    items = await memory_module.get_long_term_memory(db, current_user.id)
    return {"memory": items}


@router.post("")
async def upsert_memory(
    body: MemoryUpsertRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await memory_module.upsert_long_term_memory(db, current_user.id, body.key, body.value)
    return {"message": "Memory stored"}
