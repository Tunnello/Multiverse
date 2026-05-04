import type { GraphDocument, GraphEdge, GraphNode } from "@/lib/graphSchema";

function yearFromPublishedAt(publishedAt: string): number {
  const d = new Date(publishedAt);
  if (Number.isNaN(d.getTime())) return Number.NaN;
  return d.getUTCFullYear();
}

export function filterGraphByYear(doc: GraphDocument, selectedYear: number) {
  const visibleNodeIds = new Set<string>();
  for (const n of doc.nodes) {
    const y = yearFromPublishedAt(n.publishedAt);
    if (!Number.isFinite(y)) continue;
    if (y <= selectedYear) visibleNodeIds.add(n.id);
  }
  const edges: GraphEdge[] = [];
  for (const e of doc.edges) {
    if (visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)) {
      edges.push(e);
    }
  }
  const nodes: GraphNode[] = doc.nodes.filter((n) => visibleNodeIds.has(n.id));
  return { nodes, edges, visibleNodeIds };
}
