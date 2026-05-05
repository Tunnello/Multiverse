"""
CLI script for calling the local FastAPI pipeline endpoints.

Usage (server must be running: uvicorn app.main:app):

  # Full pipeline: search + build graph
  python run.py all --query "人工智能" --slug ai-topic --title "AI话题"

  # Search only
  python run.py search --query "人工智能" --count 5

  # Build graph only (search + LLM)
  python run.py build --query "人工智能" --slug ai-topic --title "AI话题"
"""

import argparse
import logging
import sys
from urllib.parse import urljoin

import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("run")

BASE = "http://localhost:8000"


def _check_health(client: httpx.Client) -> None:
    try:
        r = client.get(urljoin(BASE, "/health"))
        r.raise_for_status()
    except httpx.ConnectError:
        logger.error("Cannot connect to FastAPI. Is 'uvicorn app.main:app' running?")
        logger.error("  cd pipeline && uvicorn app.main:app --port 8000")
        sys.exit(1)


def cmd_search(client: httpx.Client, query: str, count: int) -> None:
    logger.info("Searching: query='%s' count=%d", query, count)
    r = client.post(
        urljoin(BASE, "/dev/zhihu_search"),
        json={"query": query, "count": count},
    )
    if not r.is_success:
        logger.error("Search failed: %s %s", r.status_code, r.text)
        sys.exit(1)

    data = r.json()
    items = data.get("Data", {}).get("Items", [])
    logger.info("Got %d results", len(items))
    for i, item in enumerate(items):
        logger.info("  [%d] %s", i, item.get("Title", "-")[:80])
        logger.info("      Author: %s  Type: %s  Votes: %s",
                    item.get("AuthorName", "-"),
                    item.get("ContentType", "-"),
                    item.get("VoteUpCount", 0))
        logger.info("      ContentID: %s", item.get("ContentID", "-"))
        logger.info("      URL: %s", item.get("Url", "-")[:80])
        logger.info("      ContentText: %s...", item.get("ContentText", "-")[:120])
    if not items:
        logger.warning("  (no results)")


def cmd_build(client: httpx.Client, query: str, slug: str, title: str) -> None:
    logger.info("Building: query='%s' slug='%s' title='%s'", query, slug, title)
    logger.info("  (calls zhihu_search + LLM, may take 30-90s)...")

    r = client.post(
        urljoin(BASE, "/dev/build_graph"),
        json={"query": query, "topic_slug": slug, "topic_title": title},
        timeout=120,
    )
    if not r.is_success:
        logger.error("Build failed: %s %s", r.status_code, r.text)
        sys.exit(1)

    data = r.json()
    logger.info("Status: %s", data["status"])
    logger.info("Nodes:  %s", data["nodeCount"])
    logger.info("Output: %s", data["path"])
    logger.info("Items:  %s", data["itemsPath"])


def main() -> None:
    parser = argparse.ArgumentParser(description="Zhihu Multiverse pipeline CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p_search = sub.add_parser("search", help="Search Zhihu only")
    p_search.add_argument("--query", required=True, help="Search query")
    p_search.add_argument("--count", type=int, default=10, help="Result count (max 10)")

    p_build = sub.add_parser("build", help="Build graph (search + LLM)")
    p_build.add_argument("--query", required=True, help="Search query")
    p_build.add_argument("--slug", required=True, help="Topic slug for output file name")
    p_build.add_argument("--title", required=True, help="Topic title for display")

    p_all = sub.add_parser("all", help="Search then build (full pipeline)")
    p_all.add_argument("--query", required=True, help="Search query")
    p_all.add_argument("--slug", required=True, help="Topic slug for output file name")
    p_all.add_argument("--title", required=True, help="Topic title for display")

    args = parser.parse_args()

    with httpx.Client(timeout=30) as client:
        _check_health(client)

        if args.command == "search":
            cmd_search(client, args.query, args.count)
        elif args.command == "build":
            cmd_build(client, args.query, args.slug, args.title)
        elif args.command == "all":
            cmd_search(client, args.query, 10)
            cmd_build(client, args.query, args.slug, args.title)


if __name__ == "__main__":
    main()
