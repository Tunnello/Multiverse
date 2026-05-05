import json
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(
    Path(__file__).parent.parent / ".env",
    override=False,
)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm_graph import build_and_validate
from .zhihu_search import zhihu_search

import httpx

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
    bearer = os.getenv("ZHIHU_BEARER")
    if not bearer:
        raise HTTPException(500, "ZHIHU_BEARER not set")

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            data = await zhihu_search(body.query, body.count, bearer, client=client)
            return data
        except httpx.HTTPError as e:
            raise HTTPException(502, f"Zhihu API error: {e}")


@app.post("/dev/build_graph")
async def dev_build_graph(body: BuildGraphRequest):
    """Local-only: search Zhihu, build graph via LLM, write JSON to pipeline/out/.
    Requires ZHIHU_BEARER. LLM credentials depend on LLM_PROVIDER:
    - deepseek (default): DEEPSEEK_API_KEY
    - openai: OPENAI_API_KEY"""
    bearer = os.getenv("ZHIHU_BEARER")
    if not bearer:
        raise HTTPException(500, "ZHIHU_BEARER not set")

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            search_data = await zhihu_search(body.query, 10, bearer, client=client)
        except httpx.HTTPError as e:
            raise HTTPException(502, f"Zhihu API error: {e}")

    items = search_data.get("Data", {}).get("Items", [])
    if not items:
        raise HTTPException(404, "No search results found")

    try:
        doc = await build_and_validate(items, body.topic_title, body.topic_slug)
    except Exception as e:
        raise HTTPException(502, f"LLM graph build error: {e}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"{body.topic_slug}.json"
    out_path.write_text(
        json.dumps(doc.model_dump(), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    return {"status": "ok", "path": str(out_path), "nodeCount": len(doc.nodes)}
