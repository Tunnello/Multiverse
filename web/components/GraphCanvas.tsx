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

export function GraphCanvas({ nodes, edges, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    if (!ref.current) return;

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
      container: ref.current,
      width: ref.current.clientWidth,
      height: ref.current.clientHeight,
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
    });

    graph.render();
    graph.on("node:click", (ev: unknown) => {
      const id = (ev as { data?: { id?: string } })?.data?.id;
      onSelect(id ?? null);
    });
    graphRef.current = graph;

    return () => {
      graph.destroy();
      graphRef.current = null;
    };
  }, [nodes, edges, onSelect]);

  return <div ref={ref} className="h-full w-full min-h-[480px]" />;
}
