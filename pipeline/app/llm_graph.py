import json
import os
from pathlib import Path
from typing import Any, Dict, List

from openai import AsyncOpenAI

from .models import GraphDocument

PROMPT_PATH = Path(__file__).parent / "prompts" / "graph_from_search.txt"

# Provider → (env var for API key, base_url)
_PROVIDER_CONFIG: Dict[str, Dict[str, str]] = {
    "deepseek": {
        "key_env": "DEEPSEEK_API_KEY",
        "base_url": "https://api.deepseek.com",
        "default_model": "deepseek-v4-flash",
    },
    "openai": {
        "key_env": "OPENAI_API_KEY",
        "base_url": "",
        "default_model": "gpt-4o",
    },
}


def _load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def _create_client() -> AsyncOpenAI:
    provider = os.getenv("LLM_PROVIDER", "deepseek")
    cfg = _PROVIDER_CONFIG.get(provider)
    if not cfg:
        raise ValueError(
            f"Unknown LLM_PROVIDER: {provider}. Supported: {', '.join(_PROVIDER_CONFIG)}"
        )

    api_key = os.getenv(cfg["key_env"])
    if not api_key:
        raise ValueError(f"{cfg['key_env']} not set")

    kwargs: Dict[str, Any] = {"api_key": api_key}
    if cfg["base_url"]:
        kwargs["base_url"] = cfg["base_url"]

    return AsyncOpenAI(**kwargs)


def _get_model() -> str:
    provider = os.getenv("LLM_PROVIDER", "deepseek")
    cfg = _PROVIDER_CONFIG.get(provider, _PROVIDER_CONFIG["deepseek"])
    return os.getenv("LLM_MODEL", cfg["default_model"])


async def build_graph_from_search_items(
    items: List[Dict[str, Any]],
    topic_title: str,
    slug: str,
) -> Dict[str, Any]:
    """Call LLM to transform search items into a GraphDocument dict."""
    client = _create_client()
    model = _get_model()
    provider = os.getenv("LLM_PROVIDER", "deepseek")

    prompt = _load_prompt()
    user_content = json.dumps(
        {"topic_title": topic_title, "slug": slug, "items": items},
        ensure_ascii=False,
    )

    extra_kwargs: Dict[str, Any] = {}
    if provider == "deepseek":
        extra_kwargs["extra_body"] = {"thinking": {"type": "enabled"}}

    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.3,
        **extra_kwargs,
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
