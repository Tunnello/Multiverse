import json
from unittest import mock

import pytest
from app.llm_graph import build_and_validate

FIXTURE_ITEMS = [
    {
        "ContentID": "A1",
        "Title": "Test Answer 1",
        "ContentText": "This is the full answer text for academic viewpoint.",
        "Author": {"Name": "Alice", "BadgeText": "PhD"},
        "VoteUpCount": 100,
        "EditTime": "2020-05-01T12:00:00Z",
        "Url": "https://zhihu.com/answer/A1",
    },
    {
        "ContentID": "A2",
        "Title": "Test Answer 2",
        "ContentText": "This is a radical opposing view.",
        "Author": {"Name": "Bob"},
        "VoteUpCount": 50,
        "EditTime": "2021-05-01T12:00:00Z",
        "Url": "https://zhihu.com/answer/A2",
    },
    {
        "ContentID": "A3",
        "Title": "Test Answer 3",
        "ContentText": "Experiential field report.",
        "Author": {"Name": "Charlie", "BadgeText": "从业者"},
        "VoteUpCount": 30,
        "EditTime": "2022-05-01T12:00:00Z",
        "Url": "https://zhihu.com/answer/A3",
    },
]

FIXTURE_LLM_RESPONSE = json.dumps(
    {
        "schemaVersion": "1.0",
        "topic": {
            "title": "Test Topic",
            "slug": "test-topic",
            "sourceNote": "zhihu_search_snapshot",
        },
        "timeRange": {"minYear": 2020, "maxYear": 2022},
        "nodes": [
            {
                "id": "A1",
                "label": "Alice - Academic",
                "camp": "academic",
                "summary": "Academic analysis of the issue.",
                "quote": "Data shows this trend is significant.",
                "author": {"name": "Alice", "badgeText": "PhD"},
                "voteUpCount": 100,
                "publishedAt": "2020-05-01T12:00:00.000Z",
                "predictionScore": {"predictionDeviation": 0.1},
                "contentType": "Answer",
            },
            {
                "id": "A2",
                "label": "Bob - Radical",
                "camp": "radical",
                "summary": "Radical opposing viewpoint.",
                "quote": "The establishment is wrong.",
                "author": {"name": "Bob"},
                "voteUpCount": 50,
                "publishedAt": "2021-05-01T12:00:00.000Z",
                "predictionScore": {"predictionDeviation": 0.5},
                "contentType": "Answer",
            },
            {
                "id": "A3",
                "label": "Charlie - Experiential",
                "camp": "experiential",
                "summary": "Field experience report.",
                "quote": "I saw this firsthand in the field.",
                "author": {"name": "Charlie", "badgeText": "从业者"},
                "voteUpCount": 30,
                "publishedAt": "2022-05-01T12:00:00.000Z",
                "predictionScore": {"predictionDeviation": 0.3},
                "contentType": "Answer",
            },
        ],
        "edges": [
            {"id": "e1", "source": "A1", "target": "A2", "kind": "clash", "label": "方法论对立"},
            {"id": "e2", "source": "A1", "target": "A3", "kind": "complement", "label": "补充案例"},
            {"id": "e3", "source": "A2", "target": "A3", "kind": "clash", "label": "价值对立"},
        ],
    },
    ensure_ascii=False,
)


class MockResponse:
    class Choice:
        class Message:
            content = FIXTURE_LLM_RESPONSE
        message = Message()

    choices = [Choice()]


@pytest.mark.asyncio
async def test_build_and_validate_with_mock():
    async def async_return(**kwargs):
        return MockResponse()

    with mock.patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test"}):
        with mock.patch(
            "openai.resources.chat.completions.AsyncCompletions.create",
            side_effect=async_return,
        ) as mock_create:
            doc = await build_and_validate(FIXTURE_ITEMS, "Test Topic", "test-topic")

    assert doc.schemaVersion == "1.0"
    assert doc.topic.title == "Test Topic"
    assert len(doc.nodes) == 3
    assert len(doc.edges) == 3
    clash_edges = [e for e in doc.edges if e.kind.value == "clash"]
    assert len(clash_edges) >= 1
    camps = {n.camp.value for n in doc.nodes}
    assert len(camps) >= 2
