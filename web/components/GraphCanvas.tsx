"use client";

import { useEffect, useRef } from "react";
import { Graph } from "@antv/g6";
import type { GraphEdge, GraphNode } from "@/lib/graphSchema";
import { CAMP_COLOR } from "@/lib/campColors";

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelect: (id: string | null) => void;
};

function buildNodeTooltip(n: GraphNode) {
  const campLabel: Record<string, string> = {
    academic: "学术派",
    radical: "激进派",
    experiential: "经验派",
    stakeholder: "利益相关方",
  };
  return `
    <div style="
      background:#1f2937; color:#f1f5f9; border:1px solid #374151;
      border-radius:6px; padding:8px 10px; max-width:240px;
      font-size:12px; line-height:1.5; box-shadow:0 3px 12px rgba(0,0,0,0.5);
    ">
      <div style="font-weight:700; font-size:13px; margin-bottom:4px; color:#fff;">${n.label}</div>
      <div style="margin-bottom:3px;">
        <span style="display:inline-block;padding:1px 5px;border-radius:3px;font-size:10px;font-weight:600;background:${CAMP_COLOR[n.camp]};color:#fff;">${campLabel[n.camp] || n.camp}</span>
      </div>
      <div style="color:#9ca3af; margin-top:4px;">${n.summary}</div>
      <div style="margin-top:4px; font-style:italic; color:#d1d5db;">&ldquo;${n.quote}&rdquo;</div>
      <div style="margin-top:6px; display:flex; gap:10px; font-size:11px; color:#9ca3af;">
        <span>${n.author.name}</span>
        ${n.author.badgeText ? `<span>${n.author.badgeText}</span>` : ""}
        <span>👍 ${n.voteUpCount}</span>
      </div>
      <div style="margin-top:3px; font-size:11px; color:#6b7280;">
        预测偏离: ${n.predictionScore.predictionDeviation}
      </div>
    </div>`;
}

export function GraphCanvas({ nodes, edges, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const mountedRef = useRef(true);
  const onSelectRef = useRef(onSelect);

  onSelectRef.current = onSelect;

  // Create graph once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const g6Nodes = nodes.map((n) => ({
      id: n.id,
      data: { ...n, color: CAMP_COLOR[n.camp] },
    }));
    const g6Edges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: { ...e, lineDash: e.kind === "clash" ? [6, 4] : undefined },
    }));

    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      data: { nodes: g6Nodes, edges: g6Edges },
      node: {
        style: {
          fill: (d: { data?: { color?: string } }) => d.data?.color ?? "#888",
        },
      },
      edge: {
        style: {
          stroke: (d: { data?: { kind?: string } }) =>
            d.data?.kind === "clash" ? "#F87171" : "#94A3B8",
          lineDash: (d: { data?: { lineDash?: number[] } }) => d.data?.lineDash,
        },
      },
      layout: { type: "d3-force", linkDistance: 120 },
      behaviors: [
        { type: "drag-canvas" },
        { type: "zoom-canvas" },
        { type: "drag-element" },
      ],
      plugins: [
        {
          type: "tooltip",
          trigger: "pointerenter",
          getContent: (_event: unknown, items: unknown[]) => {
            const item = items?.[0] as { data?: GraphNode } | undefined;
            if (!item?.data?.id) return "";
            return buildNodeTooltip(item.data);
          },
        },
      ],
    });

    graph.on("node:click", (ev: unknown) => {
      const id = (ev as { data?: { id?: string } })?.data?.id;
      onSelectRef.current(id ?? null);
    });

    graph.render();
    graphRef.current = graph;

    return () => {
      mountedRef.current = false;
      try {
        graph.destroy();
      } catch {
        // Ignore destroy errors from async layout
      }
      graphRef.current = null;
    };
    // Only create/destroy on mount/unmount, not on data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update graph data when nodes/edges change
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const g6Nodes = nodes.map((n) => ({
      id: n.id,
      data: { ...n, color: CAMP_COLOR[n.camp] },
    }));
    const g6Edges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: { ...e, lineDash: e.kind === "clash" ? [6, 4] : undefined },
    }));

    try {
      graph.setData({ nodes: g6Nodes, edges: g6Edges });
      graph.render();
    } catch {
      // Graph may have been destroyed
    }
  }, [nodes, edges]);

  return <div ref={containerRef} className="h-full w-full min-h-[480px]" />;
}
