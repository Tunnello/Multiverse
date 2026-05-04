from app.models import GraphDocument


def test_graph_document_round_trip():
    data = {
        "schemaVersion": "1.0",
        "topic": {
            "title": "Test Topic",
            "slug": "test-topic",
            "sourceNote": "synthetic_fixture",
        },
        "timeRange": {"minYear": 2016, "maxYear": 2026},
        "nodes": [
            {
                "id": "n1",
                "label": "Author 1",
                "camp": "academic",
                "summary": "Summary text.",
                "quote": "Quote text.",
                "author": {"name": "User_1", "badgeText": "认证"},
                "voteUpCount": 100,
                "publishedAt": "2018-05-01T12:00:00.000Z",
                "predictionScore": {"predictionDeviation": 0.1},
                "contentType": "Answer",
            }
        ],
        "edges": [
            {
                "id": "e1",
                "source": "n1",
                "target": "n2",
                "kind": "clash",
                "label": "Debate",
            }
        ],
    }
    doc = GraphDocument.model_validate(data)
    assert doc.schemaVersion == "1.0"
    assert doc.topic.title == "Test Topic"
    assert len(doc.nodes) == 1
    assert len(doc.edges) == 1
    assert doc.nodes[0].camp.value == "academic"
    assert doc.edges[0].kind.value == "clash"
