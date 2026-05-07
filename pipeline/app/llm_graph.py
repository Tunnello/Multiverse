import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from openai import AsyncOpenAI

from .models import GraphDocument, ZhihuItemMeta

logger = logging.getLogger(__name__)

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

    logger.info("LLM client: provider=%s base_url=%s", provider, cfg.get("base_url", "(default)"))
    return AsyncOpenAI(**kwargs)


def _get_model() -> str:
    provider = os.getenv("LLM_PROVIDER", "deepseek")
    cfg = _PROVIDER_CONFIG.get(provider, _PROVIDER_CONFIG["deepseek"])
    return os.getenv("LLM_MODEL", cfg["default_model"])


def _build_item_lookup(items: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """Index search items by ContentID for fast lookup."""
    lookup: Dict[str, Dict[str, Any]] = {}
    for item in items:
        cid = item.get("ContentID")
        if cid:
            lookup[cid] = item
    return lookup


def _format_published_at(edit_time: int | None) -> str:
    """Convert Zhihu EditTime (unix timestamp) to ISO 8601 date string."""
    if not edit_time:
        return ""
    return datetime.fromtimestamp(edit_time, tz=timezone.utc).strftime("%Y-%m-%d")


def _build_zhihu_meta(item: Dict[str, Any]) -> ZhihuItemMeta:
    """Copy ALL Zhihu API response Item fields into ZhihuItemMeta."""
    return ZhihuItemMeta(
        zhihuTitle=item.get("Title"),
        contentType=item.get("ContentType"),
        contentId=item.get("ContentID"),
        contentText=item.get("ContentText"),
        url=item.get("Url"),
        commentCount=item.get("CommentCount"),
        voteUpCount=item.get("VoteUpCount"),
        authorName=item.get("AuthorName"),
        authorAvatar=item.get("AuthorAvatar"),
        authorBadge=item.get("AuthorBadge"),
        authorBadgeText=item.get("AuthorBadgeText"),
        editTime=item.get("EditTime"),
        authorityLevel=item.get("AuthorityLevel"),
        rankingScore=item.get("RankingScore"),
    )


def _enrich_graph(data: Dict[str, Any], items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge Zhihu item fields into LLM-generated nodes."""
    lookup = _build_item_lookup(items)
    nodes = data.get("nodes", [])

    for node in nodes:
        node_id = node.get("id", "")
        item = lookup.get(node_id)
        if not item:
            continue

        # ── Python 从知乎 item 填充 ──
        node["author"] = {
            "name": item.get("AuthorName", ""),
            "badgeText": item.get("AuthorBadgeText"),
            "avatarUrl": item.get("AuthorAvatar"),
        }
        node["voteUpCount"] = item.get("VoteUpCount", 0)
        node["publishedAt"] = _format_published_at(item.get("EditTime"))
        edit_time = item.get("EditTime")
        node["timestamp"] = float(edit_time * 1000) if edit_time else None
        node["zhihu"] = _build_zhihu_meta(item).model_dump()

    return data


async def build_graph_from_search_items(
    items: List[Dict[str, Any]],
    topic_title: str,
    slug: str,
) -> Dict[str, Any]:
    """Call LLM to generate core graph, then merge Zhihu item fields."""
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

    logger.info("LLM call: model=%s items=%d prompt_len=%d input_len=%d",
                model, len(items), len(prompt), len(user_content))
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
        logger.error("LLM returned empty response")
        raise RuntimeError("LLM returned empty response")

    logger.info("LLM response: %d chars, usage=%s",
                len(text), response.usage)

    # Strip code fences if present
    text = text.strip()
    if text.startswith("```"):
        text = text[text.find("\n") + 1 :]
        if text.endswith("```"):
            text = text[: text.rfind("```")].strip()

    data = json.loads(text)

    # Merge Zhihu item fields into LLM-generated nodes
    result = _enrich_graph(data, items)
    logger.info("Graph enriched: %d nodes", len(result.get("nodes", [])))
    return result


async def build_and_validate(
    items: List[Dict[str, Any]],
    topic_title: str,
    slug: str,
) -> GraphDocument:
    """Build graph via LLM, merge Zhihu data, validate with Pydantic."""
    data = await build_graph_from_search_items(items, topic_title, slug)
    return GraphDocument.model_validate(data)
