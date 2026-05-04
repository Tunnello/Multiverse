import json
import os
from pathlib import Path
from typing import Any, Dict, List

from openai import AsyncOpenAI

from .models import GraphDocument

PROMPT_PATH = Path(__file__).parent / "prompts" / "graph_from_search.txt"


def _load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


async def build_graph_from_search_items(
    items: List[Dict[str, Any]],
    topic_title: str,
    slug: str,
) -> Dict[str, Any]:
    """Call LLM to transform search items into a GraphDocument dict."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")

    prompt = _load_prompt()
    user_content = json.dumps(
        {"topic_title": topic_title, "slug": slug, "items": items},
        ensure_ascii=False,
    )

    client = AsyncOpenAI(api_key=api_key)
    response = await client.chat.completions.create(
        model=os.getenv("LLM_MODEL", "gpt-4o"),
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.3,
    )

    text = response.choices[0].message.content
    if not text:
        raise RuntimeError("LLM returned empty response")

    # Strip code fences if present
    text = text.strip()
    if text.startswith("```"):
        text = text[text.find("\n") + 1 :]
        if text.endswith("```"):
            text = text[: text.rfind("```")].strip()

    return json.loads(text)


async def build_and_validate(
    items: List[Dict[str, Any]],
    topic_title: str,
    slug: str,
) -> GraphDocument:
    """Build graph via LLM and validate with Pydantic."""
    data = await build_graph_from_search_items(items, topic_title, slug)
    return GraphDocument.model_validate(data)
