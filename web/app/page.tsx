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

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [doc, setDoc] = useState<GraphDocument | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState("topic-1");
  const [selectedTopicUrl, setSelectedTopicUrl] = useState("/data/topic-1.json");
  const [year, setYear] = useState(2026);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [themeKey, setThemeKey] = useState<ThemeKey>("yellow");

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

  if (!doc || !manifest) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-zinc-500">
        Loading...
      </div>
    );
  }

  const filtered = filterGraphByYear(doc, year);
  const selectedNode =
    filtered.nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 bg-zinc-950">
        <h1 className="text-lg font-bold shrink-0 mr-6">谢邀·观点多元宇宙</h1>
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
        </div>
        <Sidebar
          doc={doc}
          manifest={manifest}
          selectedTopicId={selectedTopicId}
          onTopicSelect={handleTopicSelect}
        />
      </div>

      <footer className="border-t border-zinc-700 bg-zinc-950 px-4 py-3">
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
    </div>
  );
}
