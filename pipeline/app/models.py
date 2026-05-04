from enum import Enum
from typing import List, Optional, Union

from pydantic import BaseModel


class Camp(str, Enum):
    academic = "academic"
    radical = "radical"
    experiential = "experiential"
    stakeholder = "stakeholder"


class EdgeKind(str, Enum):
    agree = "agree"
    clash = "clash"
    complement = "complement"


class Author(BaseModel):
    name: str
    badgeText: Optional[str] = None
    avatarUrl: Optional[str] = None


class PredictionScore(BaseModel):
    predictionDeviation: Union[float, str]
    driftLabel: Optional[str] = None


class GraphNode(BaseModel):
    id: str
    label: str
    camp: Camp
    summary: str
    quote: str
    author: Author
    voteUpCount: int
    publishedAt: str
    predictionScore: PredictionScore
    contentType: Optional[str] = None


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    kind: EdgeKind
    label: str


class Topic(BaseModel):
    title: str
    slug: str
    sourceNote: Optional[str] = None


class TimeRange(BaseModel):
    minYear: int
    maxYear: int


class GraphDocument(BaseModel):
    schemaVersion: str
    topic: Topic
    timeRange: TimeRange
    nodes: List[GraphNode]
    edges: List[GraphEdge]
