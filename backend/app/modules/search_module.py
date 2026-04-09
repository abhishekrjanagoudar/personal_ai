"""
Search Module — Real-time web search using SerpAPI.
Combines search results with LLM for RAG-style responses.
"""

from typing import Optional
import httpx


async def web_search(query: str, api_key: str, num_results: int = 5) -> dict:
    """Perform a web search via SerpAPI and return structured results."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            "https://serpapi.com/search",
            params={
                "q": query,
                "api_key": api_key,
                "num": num_results,
                "engine": "google",
            },
        )
        response.raise_for_status()
        data = response.json()

    results = []
    for item in data.get("organic_results", [])[:num_results]:
        results.append({
            "title": item.get("title", ""),
            "url": item.get("link", ""),
            "snippet": item.get("snippet", ""),
        })

    answer_box = data.get("answer_box", {})
    featured_snippet = answer_box.get("answer") or answer_box.get("snippet", "")

    return {
        "results": results,
        "featured_snippet": featured_snippet,
        "query": query,
    }


def build_search_context(search_data: dict) -> str:
    """Build a context string from search results for RAG."""
    lines = []
    if search_data.get("featured_snippet"):
        lines.append(f"Featured Answer: {search_data['featured_snippet']}\n")

    for i, r in enumerate(search_data.get("results", []), 1):
        lines.append(f"[{i}] {r['title']}")
        lines.append(f"    URL: {r['url']}")
        lines.append(f"    {r['snippet']}\n")

    return "\n".join(lines)
