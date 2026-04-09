from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decrypt_api_key
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.modules import search_module

router = APIRouter(prefix="/search", tags=["search"])


class SearchRequest(BaseModel):
    query: str
    num_results: int = 5


@router.post("")
async def search(
    body: SearchRequest,
    current_user: User = Depends(get_current_user),
):
    if not current_user.serpapi_key_enc:
        raise HTTPException(status_code=400, detail="SerpAPI key not configured. Add it in Settings.")

    api_key = decrypt_api_key(current_user.serpapi_key_enc)
    try:
        data = await search_module.web_search(body.query, api_key, body.num_results)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
