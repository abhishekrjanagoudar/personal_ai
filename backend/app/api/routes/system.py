import platform
import psutil
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.routes.auth import get_current_user
from app.models.user import User
from app.modules import app_control

router = APIRouter(prefix="/system", tags=["system"])


class LaunchAppRequest(BaseModel):
    app_name: str


class OpenURLRequest(BaseModel):
    url: str


class MemoryRequest(BaseModel):
    key: str
    value: str


@router.get("/status")
async def system_status(current_user: User = Depends(get_current_user)):
    """Return system resource metrics."""
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        return {
            "cpu_percent": cpu_percent,
            "memory_percent": mem.percent,
            "memory_used_gb": round(mem.used / 1e9, 2),
            "memory_total_gb": round(mem.total / 1e9, 2),
            "disk_percent": disk.percent,
            "platform": platform.system(),
            "python_version": platform.python_version(),
        }
    except Exception:
        return {"cpu_percent": 0, "memory_percent": 0, "memory_used_gb": 0, "memory_total_gb": 0}


@router.post("/launch")
async def launch_app(
    body: LaunchAppRequest,
    current_user: User = Depends(get_current_user),
):
    result = await app_control.launch_app(body.app_name)
    return result


@router.post("/open-url")
async def open_url(
    body: OpenURLRequest,
    current_user: User = Depends(get_current_user),
):
    if not body.url.startswith(("http://", "https://")):
        return {"success": False, "message": "Only http/https URLs are allowed."}
    result = await app_control.open_url(body.url)
    return result


@router.get("/apps")
async def list_apps(current_user: User = Depends(get_current_user)):
    return {"apps": app_control.list_available_apps()}
