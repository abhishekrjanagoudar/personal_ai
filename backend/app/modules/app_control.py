"""
App Control Module — Launch applications, open URLs, run safe system commands.
Implements a plugin/whitelist approach for security.
"""

import asyncio
import shutil
import sys
from typing import Optional

# Whitelist of allowed commands (extensible plugin system)
ALLOWED_COMMANDS = {
    "open_browser": {"linux": "xdg-open", "darwin": "open", "win32": "start"},
    "open_vscode": {"linux": "code", "darwin": "code", "win32": "code"},
    "open_terminal": {"linux": "x-terminal-emulator", "darwin": "open -a Terminal", "win32": "cmd"},
    "open_file_manager": {"linux": "xdg-open .", "darwin": "open .", "win32": "explorer ."},
}


def get_platform() -> str:
    if sys.platform.startswith("linux"):
        return "linux"
    elif sys.platform == "darwin":
        return "darwin"
    elif sys.platform == "win32":
        return "win32"
    return "linux"


async def open_url(url: str) -> dict:
    """Open a URL in the default browser."""
    platform = get_platform()
    cmd_map = {"linux": "xdg-open", "darwin": "open", "win32": "start"}
    cmd = cmd_map.get(platform, "xdg-open")

    if not shutil.which(cmd):
        return {"success": False, "message": f"Command '{cmd}' not found on this system."}

    try:
        await asyncio.create_subprocess_exec(cmd, url)
        return {"success": True, "message": f"Opening URL: {url}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def launch_app(app_name: str) -> dict:
    """Launch a whitelisted application."""
    platform = get_platform()
    app_lower = app_name.lower().strip()

    if app_lower not in ALLOWED_COMMANDS:
        return {
            "success": False,
            "message": f"App '{app_name}' is not in the allowed list. Allowed: {list(ALLOWED_COMMANDS.keys())}",
        }

    cmd = ALLOWED_COMMANDS[app_lower].get(platform)
    if not cmd:
        return {"success": False, "message": f"App '{app_name}' not supported on {platform}."}

    executable = cmd.split()[0]
    if not shutil.which(executable):
        return {"success": False, "message": f"'{executable}' not found. Please install it."}

    try:
        await asyncio.create_subprocess_shell(cmd)
        return {"success": True, "message": f"Launched: {app_name}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


def list_available_apps() -> list[str]:
    return list(ALLOWED_COMMANDS.keys())
