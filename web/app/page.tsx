"use client";

import { useEffect, useState, useCallback } from "react";
import { GraphCanvas } from "@/components/GraphCanvas";
import { TopicSearch } from "@/components/TopicSearch";
import { YearSlider } from "@/components/YearSlider";
import { NodeDrawer } from "@/components/NodeDrawer";
import { Sidebar } from "@/components/Sidebar";
import { filterGraphByYear } from "@/lib/filterByYear";
import { GraphDocumentSchema } from "@/lib/graphSchema";
import { ManifestSchema } from "@/lib/manifestSchema";
import type { GraphDocument, GraphEdge, GraphNode } from "@/lib/graphSchema";
import type { Manifest } from "@/lib/manifestSchema";
import { THEMES, type ThemeKey } from "@/lib/themes";
import { OPINION_COLOR } from "@/lib/campColors";

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [doc, setDoc] = useState<GraphDocument | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState("topic-1");
  const [selectedTopicUrl, setSelectedTopicUrl] = useState("/data/topic-1.json");
  const [year, setYear] = useState(2026);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [themeKey, setThemeKey] = useState<ThemeKey>("yellow");
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    fetch("/data/manifest.json")
      .then((r) => r.json())
      .then((raw) => {
        const m = ManifestSchema.parse(raw);
        setManifest(m);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(selectedTopicUrl)
      .then((r) => r.json())
      .then((raw) => GraphDocumentSchema.parse(raw))
      .then((d) => {
        setDoc(d);
        setYear(d.timeRange.maxYear);
        setSelectedNodeId(null);
      })
      .catch(console.error);
  }, [selectedTopicUrl]);

  const handleTopicSelect = useCallback((id: string, dataUrl: string) => {
    setSelectedTopicId(id);
    setSelectedTopicUrl(dataUrl);
  }, []);

  const filtered = doc ? filterGraphByYear(doc, year) : { nodes: [], edges: [] };
  const selectedNode =
    filtered.nodes.find((n: GraphNode) => n.id === selectedNodeId) ?? null;

  if (!doc || !manifest) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-zinc-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <header className="flex items-center justify-between px-2 md:px-4 py-2 md:py-3 border-b border-zinc-700 bg-zinc-950">
        <h1 className="text-sm md:text-lg font-bold shrink-0 mr-2 md:mr-6">谢邀·观点多元宇宙</h1>
        <TopicSearch
          manifest={manifest}
          selectedId={selectedTopicId}
          onSelect={handleTopicSelect}
        />
        <select
          value={themeKey}
          onChange={(e) => setThemeKey(e.target.value as ThemeKey)}
          className="bg-zinc-800 border border-zinc-600 text-zinc-300 text-sm rounded px-2 py-1 shrink-0 focus:outline-none focus:border-zinc-400"
        >
          {Object.entries(THEMES).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative min-w-0">
          <GraphCanvas
            nodes={filtered.nodes as GraphNode[]}
            edges={filtered.edges as GraphEdge[]}
            onSelect={setSelectedNodeId}
            themeKey={themeKey}
          />

          <div className="absolute bottom-6 left-1 md:left-3 z-30 pointer-events-none">
            <div className="bg-white/90 border border-gray-200 rounded-lg px-2 md:px-3 py-1.5 md:py-2.5 space-y-1.5 md:space-y-2 text-[10px] md:text-xs backdrop-blur shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 shrink-0">立场</span>
                {["赞成", "中立", "反对"].map((o) => (
                  <span key={o} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: OPINION_COLOR[o] }}
                    />
                    <span className="text-gray-600">{o}</span>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 shrink-0">连线</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 rounded shrink-0" style={{ backgroundColor: "#F87171" }} />
                  <span className="text-gray-600">对撞</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 rounded shrink-0" style={{ backgroundColor: "#94A3B8" }} />
                  <span className="text-gray-600">一致</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block shrink-0">
          <Sidebar
            doc={doc}
            manifest={manifest}
            selectedTopicId={selectedTopicId}
            onTopicSelect={handleTopicSelect}
          />
        </div>
      </div>

      <footer className="border-t border-zinc-700 bg-zinc-950 px-2 md:px-4 py-2 md:py-3">
        <YearSlider
          minYear={doc.timeRange.minYear}
          maxYear={doc.timeRange.maxYear}
          value={year}
          onChange={setYear}
        />
      </footer>

      <NodeDrawer
        node={selectedNode as GraphNode | null}
        onClose={() => setSelectedNodeId(null)}
      />

      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[360px] shadow-2xl">
            <h2 className="text-base font-bold text-white mb-3">欢迎</h2>
            <ul className="space-y-2 text-sm text-zinc-400 leading-relaxed mb-4">
              <li>· 点击节点看各方意见，双击直达知乎原文</li>
              <li>· 拖动底部时间轴，看看观点怎么随时间变化</li>
            </ul>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
