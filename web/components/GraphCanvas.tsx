"use client";

import { useEffect, useRef } from "react";
import { Graph } from "@antv/g6";
import type { GraphEdge, GraphNode } from "@/lib/graphSchema";
import { OPINION_COLOR } from "@/lib/campColors";
import { THEMES, type ThemeKey, type ThemeConfig } from "@/lib/themes";

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelect: (id: string | null) => void;
  themeKey: ThemeKey;
};

function formatEditTime(ts: number | undefined): string {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleDateString("zh-CN");
}

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function truncate(text: string | undefined, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function buildNodeTooltip(n: GraphNode) {
  const z = n.zhihu;
  const kp = asArray(n.keyPoint);
  const kpHtml = kp.length
    ? `<div style="color:#9ca3af; margin-top:4px;">${kp.map((p) => `&bull; ${p}`).join("<br>")}</div>`
    : "";
  return `
    <div style="
      background:#1f2937; color:#f1f5f9; border:1px solid #374151;
      border-radius:6px; padding:8px 10px; max-width:320px;
      font-size:12px; line-height:1.5; box-shadow:0 3px 12px rgba(0,0,0,0.5);
    ">
      <div style="font-weight:700; font-size:13px; margin-bottom:4px; color:#fff;">${n.label}</div>
      <div style="margin-bottom:3px; display:flex; gap:4px;">
        <span style="display:inline-block;padding:1px 5px;border-radius:3px;font-size:10px;font-weight:600;background:${OPINION_COLOR[n.opinionType]};color:#fff;">${n.opinionType}</span>
        <span style="display:inline-block;padding:1px 5px;border-radius:3px;font-size:10px;font-weight:500;background:#374151;color:#9ca3af;">${n.camp}</span>
      </div>
      ${kpHtml}
      <div style="margin-top:2px; font-style:italic; color:#d1d5db;">&ldquo;${n.quote}&rdquo;</div>
      <div style="margin-top:6px; display:flex; gap:10px; font-size:11px; color:#9ca3af;">
        ${n.author ? `<span>${n.author.name}</span>` : ""}
        ${n.author?.badgeText ? `<span>${n.author.badgeText}</span>` : ""}
        <span>👍 ${n.voteUpCount ?? 0}</span>
      </div>
      ${z ? `
      <div style="margin-top:6px; padding-top:6px; border-top:1px solid #374151; font-size:11px; color:#6b7280; line-height:1.7;">
        <div><span style="color:#9ca3af;">标题:</span> ${z.zhihuTitle ?? "-"}</div>
        <div><span style="color:#9ca3af;">类型:</span> ${z.contentType ?? "-"}  <span style="color:#9ca3af;">ID:</span> ${z.contentId ?? "-"}</div>
        <div><span style="color:#9ca3af;">作者:</span> ${z.authorName ?? "-"}  <span style="color:#9ca3af;">赞同:</span> ${z.voteUpCount ?? 0}</div>
        ${z.authorBadgeText ? `<div><span style="color:#9ca3af;">认证:</span> ${z.authorBadgeText}</div>` : ""}
        <div><span style="color:#9ca3af;">内容:</span> ${truncate(z.contentText, 120)}</div>
        <div><span style="color:#9ca3af;">链接:</span> <a href="${z.url ?? "#"}" target="_blank" style="color:#60a5fa;">打开原文</a></div>
        <div style="display:flex; gap:8px; margin-top:2px;">
          <span><span style="color:#9ca3af;">评论:</span> ${z.commentCount ?? 0}</span>
          <span><span style="color:#9ca3af;">编辑:</span> ${formatEditTime(z.editTime)}</span>
        </div>
        <div style="display:flex; gap:8px;">
          <span><span style="color:#9ca3af;">权威:</span> ${z.authorityLevel ?? "-"}</span>
          <span><span style="color:#9ca3af;">排名:</span> ${z.rankingScore?.toFixed(2) ?? "-"}</span>
        </div>
        <div style="margin-top:2px;"><span style="color:#9ca3af;">预测偏离:</span> ${n.predictionScore?.predictionDeviation ?? "-"}</div>
      </div>
      ` : ""}
    </div>`;
}

function buildTimebarData(nodes: GraphNode[]) {
  const dayMap = new Map<string, { time: number; value: number }>();
  nodes.forEach((n) => {
    if (!n.timestamp) return;
    const d = new Date(n.timestamp);
    d.setUTCHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    const entry = dayMap.get(key);
    if (entry) {
      entry.value++;
    } else {
      dayMap.set(key, { time: d.getTime(), value: 1 });
    }
  });
  return Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, { time, value }]) => ({
      time: new Date(time),
      value,
      label,
    }));
}

function formatNodes(nodes: GraphNode[]) {
  return nodes.map((n) => ({
    id: n.id,
    data: { ...n, color: OPINION_COLOR[n.opinionType] ?? "#888" },
  }));
}

function formatEdges(edges: GraphEdge[]) {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    data: { ...e, lineDash: e.kind === "clash" ? [6, 4] : undefined },
  }));
}

function buildNodeOptions(cfg: ThemeConfig) {
  return {
    style: {
      fill: (d: { data?: { color?: string } }) => d.data?.color ?? "#888",
      labelText: (d: { data?: { author?: { name?: string } } }) =>
        d.data?.author?.name ?? "",
      labelFill: cfg.nodeLabelFill,
      labelFontSize: 11,
      labelPlacement: "bottom" as const,
      labelOffsetY: 6,
    },
    state: {
      selected: {
        stroke: "#FACC15",
        lineWidth: 3,
        halo: true,
        haloFill: "#FACC15",
        haloOpacity: 0.25,
        haloStrokeWidth: 0,
      },
    },
  };
}

function buildEdgeOptions(cfg: ThemeConfig) {
  return {
    style: {
      stroke: (d: { data?: { kind?: string } }) =>
        d.data?.kind === "clash" ? "#F87171" : cfg.edgeStroke,
      lineDash: (d: { data?: { lineDash?: number[] } }) => d.data?.lineDash,
    },
  };
}

export function GraphCanvas({ nodes, edges, onSelect, themeKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const onSelectRef = useRef(onSelect);
  const layoutRef = useRef<Promise<void> | null>(null);

  onSelectRef.current = onSelect;

  // Create graph once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const cfg = THEMES[themeKey];
    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      data: { nodes: formatNodes(nodes), edges: formatEdges(edges) },
      node: buildNodeOptions(cfg),
      edge: buildEdgeOptions(cfg),
      layout: {
        type: "d3-force",
        animation: true,
        manyBody: {
          strength: -150,
        },
        preventOverlap: true,
        nodeSize: 30,
        linkDistance: 150,
        x: {
          strength: 0.05,
        },
        y: {
          strength: 0.05,
        },
        alphaDecay: 0.015,
      },
      behaviors: [
        { type: "drag-canvas" },
        { type: "zoom-canvas" },
        { type: "drag-element" },
        {
          type: "click-select",
          state: "selected",
          onClick: (event: unknown) => {
            const ev = event as { targetType?: string; target?: { id?: string } };
            if (ev.targetType === "node" && ev.target?.id) {
              const states = graph.getElementState(ev.target.id);
              onSelectRef.current(states.includes("selected") ? ev.target.id : null);
            } else {
              onSelectRef.current(null);
            }
          },
        },
      ],
      autoFit: "view",
      padding: [10, 0, 160, 0],
      theme: cfg.g6Theme,
      plugins: [
        {
          key: "background",
          type: "background",
          background: cfg.background,
        },
        {
          type: "tooltip",
          trigger: "pointerenter",
          getContent: (_event: unknown, items: unknown[]) => {
            const item = items?.[0] as { data?: GraphNode } | undefined;
            if (!item?.data?.id) return "";
            return buildNodeTooltip(item.data);
          },
        },
        {
          type: "timebar",
          key: "timebar",
          data: buildTimebarData(nodes),
          width: 400,
          height: 100,
          loop: false,
          timebarType: "chart",
          getTime: (d: { data?: { timestamp?: number } }) => {
            const ts = d.data?.timestamp;
            if (!ts) return 0;
            const date = new Date(ts);
            date.setUTCHours(0, 0, 0, 0);
            return date.getTime();
          },
        },
      ],
    });

    graph.on("node:dblclick", (ev: unknown) => {
      const url = (ev as { data?: { zhihu?: { url?: string } } })?.data?.zhihu
        ?.url;
      if (url) window.open(url, "_blank");
    });

    graph.render();
    graphRef.current = graph;

    return () => {
      try {
        graph.destroy();
      } catch {
        // Ignore destroy errors
      }
      graphRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data and re-run layout dynamically (skip initial mount)
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph?.rendered) return;

    graph.setData({
      nodes: formatNodes(nodes),
      edges: formatEdges(edges),
    });

    // Update timebar histogram when data changes
    try {
      graph.updatePlugin({ key: "timebar", data: buildTimebarData(nodes) });
    } catch {
      // Silently ignore if plugin update fails
    }

    layoutRef.current = graph.layout();
  }, [nodes, edges]);

  // Theme switching
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph?.rendered) return;

    const cfg = THEMES[themeKey];
    graph.updatePlugin({ key: "background", background: cfg.background });
    graph.setNode(buildNodeOptions(cfg));
    graph.setEdge(buildEdgeOptions(cfg));
    graph.draw();
  }, [themeKey]);

  return <div ref={containerRef} className="h-full w-full min-h-[480px]" />;
}
