"use client";

import { useState } from "react";
import type { GraphDocument } from "@/lib/graphSchema";
import { CAMP_COLOR } from "@/lib/campColors";

const CAMP_LEGEND: { camp: string; label: string; desc: string }[] = [
  { camp: "academic", label: "学术派", desc: "以研究、数据、理论为依据的观点" },
  { camp: "radical", label: "激进派", desc: "挑战主流叙事，提出颠覆性主张" },
  { camp: "experiential", label: "经验派", desc: "基于亲身经历与实践的视角" },
  { camp: "stakeholder", label: "利益相关方", desc: "代表特定群体利益或立场" },
];

type Props = {
  doc: GraphDocument;
};

export function Sidebar({ doc }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative flex shrink-0">
      {/* When collapsed: show a slim tab for re-opening */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 w-8 h-full bg-zinc-900 border-l border-zinc-700 hover:bg-zinc-800 flex items-start pt-3 justify-center text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
        >
          ❮
        </button>
      )}

      {/* Sidebar panel (open state) */}
      {open && (
        <div className="relative w-[256px] shrink-0 bg-zinc-900 border-l border-zinc-700 overflow-y-auto">
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 -left-3 z-40 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs"
          >
            ❯
          </button>

          <div className="p-4 space-y-5">
            {/* Topic info */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                议题信息
              </h3>
              <h2 className="text-base font-bold text-white">{doc.topic.title}</h2>
              <div className="mt-2 space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>时间范围</span>
                  <span className="text-zinc-300">
                    {doc.timeRange.minYear} – {doc.timeRange.maxYear}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>节点数</span>
                  <span className="text-zinc-300">{doc.nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>边数</span>
                  <span className="text-zinc-300">{doc.edges.length}</span>
                </div>
                {doc.topic.sourceNote && (
                  <div className="flex justify-between">
                    <span>数据来源</span>
                    <span className="text-zinc-500 text-[11px]">{doc.topic.sourceNote}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Legend */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                图例
              </h3>
              <div className="space-y-2">
                {CAMP_LEGEND.map((c) => (
                  <div key={c.camp} className="flex gap-2 items-start">
                    <span
                      className="mt-0.5 w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CAMP_COLOR[c.camp as keyof typeof CAMP_COLOR] }}
                    />
                    <div>
                      <span className="text-xs font-medium text-zinc-200">{c.label}</span>
                      <p className="text-[11px] text-zinc-500 leading-tight">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Edge legend */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                边类型
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <span className="w-4 h-0.5 rounded shrink-0" style={{ backgroundColor: "#F87171" }} />
                  <span className="text-xs text-zinc-300">对撞（冲突观点）</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-4 h-0.5 rounded shrink-0" style={{ backgroundColor: "#94A3B8" }} />
                  <span className="text-xs text-zinc-300">一致 / 补充</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-4 h-0.5 rounded shrink-0" style={{ borderTop: "2px dashed #F87171" }} />
                  <span className="text-xs text-zinc-300">对撞虚线</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
