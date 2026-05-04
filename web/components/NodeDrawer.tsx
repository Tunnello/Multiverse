"use client";

import type { GraphNode } from "@/lib/graphSchema";
import { CAMP_COLOR } from "@/lib/campColors";

type Props = {
  node: GraphNode | null;
  onClose: () => void;
};

export function NodeDrawer({ node, onClose }: Props) {
  if (!node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[360px] bg-zinc-800 border-l border-zinc-700 shadow-xl overflow-y-auto z-50">
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <h2 className="text-lg font-semibold text-white">{node.label}</h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white text-xl leading-none"
        >
          &times;
        </button>
      </div>
      <div className="p-4 space-y-4 text-sm">
        <div>
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ backgroundColor: CAMP_COLOR[node.camp] }}
          >
            {node.camp}
          </span>
        </div>

        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide">Author</p>
          <p className="text-white">{node.author.name}</p>
          {node.author.badgeText && (
            <span className="text-xs text-zinc-400">{node.author.badgeText}</span>
          )}
        </div>

        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide">Summary</p>
          <p className="text-zinc-300">{node.summary}</p>
        </div>

        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide">Quote</p>
          <p className="text-zinc-300 italic">&ldquo;{node.quote}&rdquo;</p>
        </div>

        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide">Votes</p>
          <p className="text-white">{node.voteUpCount}</p>
        </div>

        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide">Prediction Deviation</p>
          <p className="text-white">{node.predictionScore.predictionDeviation}</p>
        </div>
      </div>
    </div>
  );
}
