"use client";

import type { Manifest } from "@/lib/manifestSchema";

type Props = {
  manifest: Manifest;
  selectedId: string;
  onSelect: (id: string, dataUrl: string) => void;
};

export function TopicTabs({ manifest, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-3">
      {manifest.topics.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id, t.dataUrl)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedId === t.id
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
