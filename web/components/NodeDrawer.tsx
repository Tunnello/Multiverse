"use client";

import type { GraphNode } from "@/lib/graphSchema";
import { OPINION_COLOR } from "@/lib/campColors";

type Props = {
  node: GraphNode | null;
  onClose: () => void;
};

function formatEditTime(ts: number | undefined): string {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleDateString("zh-CN");
}

export function NodeDrawer({ node, onClose }: Props) {
  if (!node) return null;

  const z = node.zhihu;

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

      <div className="p-4 space-y-3 text-sm">
        {/* 立场 + 阵营 */}
        <div className="flex gap-2">
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ backgroundColor: OPINION_COLOR[node.opinionType] }}
          >
            {node.opinionType}
          </span>
          <span className="inline-block px-2 py-0.5 rounded text-xs text-zinc-400 bg-zinc-700">
            {node.camp}
          </span>
        </div>

        {/* LLM 生成 */}
        <Section label="核心观点">{node.keyPoint}</Section>
        <Section label="立场原因">{node.opinionReason}</Section>
        <Section label="摘要">{node.summary}</Section>
        <Section label="引言" italic>&ldquo;{node.quote}&rdquo;</Section>

        {/* 作者信息 */}
        <Section label="作者">
          {node.author.name}
          {node.author.badgeText && (
            <span className="ml-2 text-xs text-zinc-500">{node.author.badgeText}</span>
          )}
        </Section>
        <Section label="赞同数">👍 {node.voteUpCount}</Section>
        <Section label="预测偏离">{node.predictionScore.predictionDeviation}</Section>

        {/* 知乎原始数据 */}
        {z && (
          <>
            <div className="border-t border-zinc-700 pt-3 mt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                知乎原始数据
              </h3>
            </div>
            <Section label="原标题">{z.zhihuTitle ?? "-"}</Section>
            <div className="flex gap-4">
              <Section label="类型">{z.contentType ?? "-"}</Section>
              <Section label="Content ID">{z.contentId ?? "-"}</Section>
            </div>
            {z.contentText && (
              <Section label="内容全文">
                <p className="max-h-32 overflow-y-auto leading-relaxed whitespace-pre-line">
                  {z.contentText}
                </p>
              </Section>
            )}
            {z.url && (
              <div>
                <a
                  href={z.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  打开知乎原文 →
                </a>
              </div>
            )}
            <div className="flex gap-4">
              <Section label="评论数">{z.commentCount ?? 0}</Section>
              <Section label="编辑时间">{formatEditTime(z.editTime)}</Section>
            </div>
            <div className="flex gap-4">
              <Section label="权威等级">{z.authorityLevel ?? "-"}</Section>
              <Section label="排名分">{z.rankingScore?.toFixed(2) ?? "-"}</Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  label,
  children,
  italic,
}: {
  label: string;
  children: React.ReactNode;
  italic?: boolean;
}) {
  return (
    <div>
      <p className="text-zinc-400 text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className={italic ? "text-zinc-300 italic" : "text-zinc-200"}>{children}</p>
    </div>
  );
}
