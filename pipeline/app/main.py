import json
import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(
    Path(__file__).parent.parent / ".env",
    override=False,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm_graph import build_and_validate
from .zhihu_search import zhihu_search

import httpx

logger = logging.getLogger("main")

app = FastAPI(title="Zhihu Multiverse Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OUT_DIR = Path(__file__).parent.parent / "out"


class SearchRequest(BaseModel):
    query: str
    count: int = Field(default=10, ge=1, le=10)


class BuildGraphRequest(BaseModel):
    query: str
    topic_slug: str
    topic_title: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/dev/zhihu_search")
async def dev_zhihu_search(body: SearchRequest):
    """Local-only: proxy call to Zhihu search API. Requires ZHIHU_BEARER env var."""
    logger.info("zhihu_search: query='%s' count=%d", body.query, body.count)
    bearer = os.getenv("ZHIHU_BEARER")
    if not bearer:
        logger.error("zhihu_search: ZHIHU_BEARER not set")
        raise HTTPException(500, "ZHIHU_BEARER not set")

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            data = await zhihu_search(body.query, body.count, bearer, client=client)
            items = data.get("Data", {}).get("Items", [])
            logger.info("zhihu_search: got %d results", len(items))
            return data
        except httpx.HTTPError as e:
            logger.error("zhihu_search: API error: %s", e)
            raise HTTPException(502, f"Zhihu API error: {e}")


@app.post("/dev/build_graph")
async def dev_build_graph(body: BuildGraphRequest):
    """Local-only: search Zhihu, build graph via LLM, write JSON to pipeline/out/.
    Requires ZHIHU_BEARER. LLM credentials depend on LLM_PROVIDER:
    - deepseek (default): DEEPSEEK_API_KEY
    - openai: OPENAI_API_KEY"""
    logger.info("build_graph: query='%s' slug='%s' title='%s'",
                body.query, body.topic_slug, body.topic_title)
    bearer = os.getenv("ZHIHU_BEARER")
    if not bearer:
        logger.error("build_graph: ZHIHU_BEARER not set")
        raise HTTPException(500, "ZHIHU_BEARER not set")

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            search_data = await zhihu_search(body.query, 10, bearer, client=client)
        except httpx.HTTPError as e:
            logger.error("build_graph: zhihu search error: %s", e)
            raise HTTPException(502, f"Zhihu API error: {e}")

    items = search_data.get("Data", {}).get("Items", [])
    if not items:
        logger.warning("build_graph: no search results for '%s'", body.query)
        raise HTTPException(404, "No search results found")

    logger.info("build_graph: got %d items, saving intermediate JSON", len(items))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    items_path = OUT_DIR / f"{body.topic_slug}_items.json"
    items_path.write_text(
        json.dumps(items, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    logger.info("build_graph: saved items → %s", items_path)

    try:
        logger.info("build_graph: calling LLM...")
        doc = await build_and_validate(items, body.topic_title, body.topic_slug)
        logger.info("build_graph: LLM returned %d nodes, %d edges",
                     len(doc.nodes), len(doc.edges))
    except Exception as e:
        logger.exception("build_graph: LLM error")
        raise HTTPException(502, f"LLM graph build error: {e}")

    out_path = OUT_DIR / f"{body.topic_slug}.json"
    out_path.write_text(
        json.dumps(doc.model_dump(), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    logger.info("build_graph: saved result → %s", out_path)

    return {
        "status": "ok",
        "path": str(out_path),
        "itemsPath": str(items_path),
        "nodeCount": len(doc.nodes),
    }
