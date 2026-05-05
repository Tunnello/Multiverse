"use client";

import { useState } from "react";
import type { GraphDocument } from "@/lib/graphSchema";
import type { Manifest } from "@/lib/manifestSchema";
import { OPINION_COLOR } from "@/lib/campColors";

const OPINION_LEGEND: { key: string; label: string; desc: string }[] = [
  { key: "赞成", label: "赞成", desc: "支持该议题的观点立场" },
  { key: "中立", label: "中立", desc: "对该议题持中立态度" },
  { key: "反对", label: "反对", desc: "反对该议题的观点立场" },
];

type Props = {
  doc: GraphDocument;
  manifest: Manifest;
  selectedTopicId: string;
  onTopicSelect: (id: string, dataUrl: string) => void;
};

export function Sidebar({ doc, manifest, selectedTopicId, onTopicSelect }: Props) {
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
            {/* History */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                历史记录
              </h3>
              <div className="space-y-0.5">
                {manifest.topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTopicSelect(t.id, t.dataUrl)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                      t.id === selectedTopicId
                        ? "bg-blue-600/30 text-blue-300"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

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
                立场图例
              </h3>
              <div className="space-y-2">
                {OPINION_LEGEND.map((o) => (
                  <div key={o.key} className="flex gap-2 items-start">
                    <span
                      className="mt-0.5 w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: OPINION_COLOR[o.key] }}
                    />
                    <div>
                      <span className="text-xs font-medium text-zinc-200">{o.label}</span>
                      <p className="text-[11px] text-zinc-500 leading-tight">{o.desc}</p>
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
