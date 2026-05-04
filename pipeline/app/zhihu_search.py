import hashlib
import hmac
import time
from typing import Any, Dict

import httpx

ZHIHU_SEARCH_URL = "https://developer.zhihu.com/api/v1/content/zhihu_search"


async def zhihu_search(
    query: str, count: int, bearer: str, *, client: httpx.AsyncClient
) -> Dict[str, Any]:
    """Call Zhihu search API, returning raw JSON. Count is clamped to 10."""
    count = min(count, 10)

    timestamp = str(int(time.time()))
    sign_str = f"zhihu_search{timestamp}"
    signature = hmac.new(
        bearer.encode("utf-8"), sign_str.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    headers = {
        "Authorization": f"Bearer {bearer}",
        "X-Request-Timestamp": timestamp,
        "X-Request-Signature": signature,
    }
    params = {"query": query, "count": count}

    resp = await client.get(ZHIHU_SEARCH_URL, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()
