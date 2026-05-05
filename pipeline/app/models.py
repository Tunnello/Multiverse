from enum import Enum
from typing import List, Optional, Union

from pydantic import BaseModel


class Camp(str, Enum):
    academic = "academic"
    radical = "radical"
    experiential = "experiential"
    stakeholder = "stakeholder"


class OpinionType(str, Enum):
    approve = "赞成"
    neutral = "中立"
    oppose = "反对"


class EdgeKind(str, Enum):
    agree = "agree"
    clash = "clash"
    complement = "complement"


# ────────────────────────────────────────────
# Sub-models
# ────────────────────────────────────────────


class Author(BaseModel):
    name: str
    badgeText: Optional[str] = None
    avatarUrl: Optional[str] = None


class PredictionScore(BaseModel):
    predictionDeviation: Union[float, str]
    driftLabel: Optional[str] = None


class ZhihuItemMeta(BaseModel):
    """Raw Zhihu search API item fields — Python copies directly from search response."""

    zhihuTitle: Optional[str] = None  # Title
    contentType: Optional[str] = None  # ContentType
    contentId: Optional[str] = None  # ContentID
    contentText: Optional[str] = None  # ContentText
    url: Optional[str] = None  # Url
    commentCount: Optional[int] = None  # CommentCount
    voteUpCount: Optional[int] = None  # VoteUpCount
    authorName: Optional[str] = None  # AuthorName
    authorAvatar: Optional[str] = None  # AuthorAvatar
    authorBadge: Optional[str] = None  # AuthorBadge
    authorBadgeText: Optional[str] = None  # AuthorBadgeText
    editTime: Optional[int] = None  # EditTime (unix timestamp)
    authorityLevel: Optional[str] = None  # AuthorityLevel
    rankingScore: Optional[float] = None  # RankingScore


# ────────────────────────────────────────────
# Graph elements
# ────────────────────────────────────────────


class GraphNode(BaseModel):
    # ── LLM 生成 ──
    id: str
    label: str
    camp: Camp
    summary: str
    quote: str
    opinionType: OpinionType
    opinionReason: List[str]
    keyPoint: List[str]
    predictionScore: PredictionScore

    # ── Python 从知乎搜索结果填充 ──
    author: Author
    voteUpCount: int
    publishedAt: str
    zhihu: ZhihuItemMeta


class GraphEdge(BaseModel):
    # ── LLM 生成 ──
    id: str
    source: str
    target: str
    kind: EdgeKind
    label: str


# ────────────────────────────────────────────
# Document
# ────────────────────────────────────────────


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
