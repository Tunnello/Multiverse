"use client";

import { useEffect, useState, useCallback } from "react";
import { GraphCanvas } from "@/components/GraphCanvas";
import { TopicTabs } from "@/components/TopicTabs";
import { YearSlider } from "@/components/YearSlider";
import { NodeDrawer } from "@/components/NodeDrawer";
import { filterGraphByYear } from "@/lib/filterByYear";
import { GraphDocumentSchema } from "@/lib/graphSchema";
import { ManifestSchema } from "@/lib/manifestSchema";
import type { GraphDocument, GraphEdge, GraphNode } from "@/lib/graphSchema";
import type { Manifest } from "@/lib/manifestSchema";

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [doc, setDoc] = useState<GraphDocument | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState("topic-1");
  const [selectedTopicUrl, setSelectedTopicUrl] = useState("/data/topic-1.json");
  const [year, setYear] = useState(2026);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
        <h1 className="text-lg font-bold">观点对撞机</h1>
        <TopicTabs
          manifest={manifest}
          selectedId={selectedTopicId}
          onSelect={handleTopicSelect}
        />
        <div className="w-[100px]" />
      </header>

      <div className="flex-1 relative">
        <GraphCanvas
          nodes={filtered.nodes as GraphNode[]}
          edges={filtered.edges as GraphEdge[]}
          onSelect={setSelectedNodeId}
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
