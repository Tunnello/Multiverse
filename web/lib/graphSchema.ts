import { z } from "zod";

export const CampEnum = z.enum([
  "academic",
  "radical",
  "experiential",
  "stakeholder",
]);

export const EdgeKindEnum = z.enum(["agree", "clash", "complement"]);

export const AuthorSchema = z.object({
  name: z.string(),
  badgeText: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const PredictionScoreSchema = z.object({
  predictionDeviation: z.union([z.number(), z.string()]),
  driftLabel: z.string().optional(),
});

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  camp: CampEnum,
  summary: z.string(),
  quote: z.string(),
  author: AuthorSchema,
  voteUpCount: z.number(),
  publishedAt: z.string(),
  predictionScore: PredictionScoreSchema,
  contentType: z.string().optional(),
});

export const GraphEdgeSchema = z.object({
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
