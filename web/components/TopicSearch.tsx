"use client";

import { useState, useRef, useEffect } from "react";
import type { Manifest } from "@/lib/manifestSchema";

type Props = {
  manifest: Manifest;
  selectedId: string;
  onSelect: (id: string, dataUrl: string) => void;
};

export function TopicSearch({ manifest, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTopic = manifest.topics.find((t) => t.id === selectedId);

  useEffect(() => {
    setQuery(selectedTopic?.label ?? "");
  }, [selectedTopic]);

  const filtered = query
    ? manifest.topics.filter((t) => t.label.includes(query) || t.id.includes(query))
    : manifest.topics;

  const handleSelect = (id: string, dataUrl: string) => {
    setOpen(false);
    onSelect(id, dataUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filtered.length > 0) {
      setOpen(false);
      onSelect(filtered[0].id, filtered[0].dataUrl);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="请输入探索的主题"
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg overflow-hidden z-50">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id, t.dataUrl)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                t.id === selectedId
                  ? "bg-blue-600/30 text-blue-300"
                  : "text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
