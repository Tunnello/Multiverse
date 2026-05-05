import { z } from "zod";

export const CampEnum = z.enum([
  "academic",
  "radical",
  "experiential",
  "stakeholder",
]);

export const EdgeKindEnum = z.enum(["agree", "clash", "complement"]);

// ── Sub-schemas ──

export const AuthorSchema = z.object({
  name: z.string(),
  badgeText: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const PredictionScoreSchema = z.object({
  predictionDeviation: z.union([z.number(), z.string()]),
  driftLabel: z.string().optional(),
});

export const ZhihuItemMetaSchema = z.object({
  zhihuTitle: z.string().optional(),
  contentType: z.string().optional(),
  contentId: z.string().optional(),
  contentText: z.string().optional(),
  url: z.string().optional(),
  commentCount: z.number().int().optional(),
  editTime: z.number().int().optional(),
  authorityLevel: z.string().optional(),
  rankingScore: z.number().optional(),
});

export const OpinionTypeEnum = z.enum(["赞成", "中立", "反对"]);

// ── Graph elements ──

export const GraphNodeSchema = z.object({
  // LLM 生成
  id: z.string(),
  label: z.string(),
  camp: CampEnum,
  summary: z.string(),
  quote: z.string(),
  opinionType: OpinionTypeEnum,
  opinionReason: z.string(),
  keyPoint: z.string(),
  predictionScore: PredictionScoreSchema,

  // Python 从知乎搜索结果填充
  author: AuthorSchema,
  voteUpCount: z.number(),
  publishedAt: z.string(),
  zhihu: ZhihuItemMetaSchema,
});

export const GraphEdgeSchema = z.object({
  // LLM 生成
  id: z.string(),
  source: z.string(),
  target: z.string(),
  kind: EdgeKindEnum,
  label: z.string(),
});

export const GraphDocumentSchema = z.object({
  schemaVersion: z.string(),
  topic: z.object({
    title: z.string(),
    slug: z.string(),
    sourceNote: z.string().optional(),
  }),
  timeRange: z.object({
    minYear: z.number().int(),
    maxYear: z.number().int(),
  }),
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});

export type GraphDocument = z.infer<typeof GraphDocumentSchema>;
export type GraphNode = z.infer<typeof GraphNodeSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
