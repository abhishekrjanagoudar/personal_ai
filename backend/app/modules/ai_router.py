"""
AI Router Module — Routes requests to the best AI provider based on:
- User preference (default_ai_provider)
- Task type detection (coding, reasoning, conversation, search)
- API key availability
"""

import re
from typing import Optional
import httpx

from app.core.config import get_settings

settings = get_settings()


PROVIDER_PRIORITY = ["openai", "gemini", "anthropic"]

TASK_ROUTING = {
    "coding": "openai",
    "reasoning": "anthropic",
    "conversation": "gemini",
    "search": "openai",
}


def detect_task_type(prompt: str) -> str:
    prompt_lower = prompt.lower()
    if any(k in prompt_lower for k in ["code", "function", "debug", "python", "javascript", "typescript", "program"]):
        return "coding"
    if any(k in prompt_lower for k in ["explain", "reason", "analyze", "compare", "evaluate"]):
        return "reasoning"
    return "conversation"


def select_provider(
    user_preference: str,
    available_keys: dict[str, Optional[str]],
    prompt: str,
) -> Optional[str]:
    """Select the best available AI provider."""
    if user_preference != "auto":
        if available_keys.get(user_preference):
            return user_preference

    task_type = detect_task_type(prompt)
    preferred = TASK_ROUTING.get(task_type, "openai")
    if available_keys.get(preferred):
        return preferred

    for provider in PROVIDER_PRIORITY:
        if available_keys.get(provider):
            return provider

    return None


async def call_openai(prompt: str, api_key: str, history: list[dict], model: str = "gpt-4o-mini") -> str:
    messages = history + [{"role": "user", "content": prompt}]
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": model, "messages": messages},
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def call_gemini(prompt: str, api_key: str, history: list[dict], model: str = "gemini-1.5-flash") -> str:
    contents = []
    for msg in history:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}",
            json={"contents": contents},
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def call_anthropic(prompt: str, api_key: str, history: list[dict], model: str = "claude-3-haiku-20240307") -> str:
    messages = history + [{"role": "user", "content": prompt}]
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
            json={"model": model, "max_tokens": 2048, "messages": messages},
        )
        response.raise_for_status()
        data = response.json()
        return data["content"][0]["text"]


async def route_and_call(
    prompt: str,
    user_preference: str,
    api_keys: dict[str, Optional[str]],
    history: list[dict],
    system_prompt: str = "",
) -> dict:
    """Route to the best AI provider and return response + metadata."""
    provider = select_provider(user_preference, api_keys, prompt)
    if not provider:
        return {
            "content": "No AI provider configured. Please add an API key in Settings.",
            "provider": None,
            "error": True,
        }

    effective_history = history
    if system_prompt:
        effective_history = [{"role": "system", "content": system_prompt}] + history

    try:
        if provider == "openai":
            content = await call_openai(prompt, api_keys["openai"], effective_history)
        elif provider == "gemini":
            # Gemini doesn't support system role the same way; prepend to first user message
            gemini_history = [m for m in history if m["role"] != "system"]
            content = await call_gemini(prompt, api_keys["gemini"], gemini_history)
        elif provider == "anthropic":
            content = await call_anthropic(prompt, api_keys["anthropic"], history)
        else:
            content = "Unknown provider."

        return {"content": content, "provider": provider, "error": False}
    except httpx.HTTPStatusError as e:
        return {
            "content": f"AI provider error ({provider}): {e.response.status_code}",
            "provider": provider,
            "error": True,
        }
    except Exception as e:
        return {
            "content": f"Error calling {provider}: {str(e)}",
            "provider": provider,
            "error": True,
        }
