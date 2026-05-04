import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "public", "data");
mkdirSync(dataDir, { recursive: true });

const manifest = {
  topics: [
    { id: "topic-1", label: "问题 1", dataUrl: "/data/topic-1.json" },
    { id: "topic-2", label: "问题 2", dataUrl: "/data/topic-2.json" },
    { id: "topic-3", label: "问题 3", dataUrl: "/data/topic-3.json" },
  ],
};

function makeTopic(slug, title, nodeOffset) {
  const camps = ["academic", "radical", "experiential", "stakeholder"];
  const nodes = [];
  for (let i = 0; i < 8; i++) {
    const year = 2016 + (i % 5) * 2;
    const id = `${slug}-n${i + nodeOffset}`;
    nodes.push({
      id,
      label: `作者${i + 1}`,
      camp: camps[i % 4],
      summary: `${title}：摘要 ${i + 1}（合成数据）。`,
      quote: `金句 ${i + 1}：观点要鲜明。`,
      author: { name: `用户_${slug}_${i}`, badgeText: i % 2 === 0 ? "认证" : "" },
      voteUpCount: 100 - i * 7,
      publishedAt: `${year}-05-01T12:00:00.000Z`,
      predictionScore: { predictionDeviation: (i % 5) * 0.1 },
      contentType: "Answer",
    });
  }
  const edges = [
    { id: `${slug}-e1`, source: nodes[0].id, target: nodes[1].id, kind: "clash", label: "方法论对立" },
    { id: `${slug}-e2`, source: nodes[1].id, target: nodes[2].id, kind: "agree", label: "前提一致" },
    { id: `${slug}-e3`, source: nodes[2].id, target: nodes[3].id, kind: "complement", label: "补充案例" },
    { id: `${slug}-e4`, source: nodes[3].id, target: nodes[4].id, kind: "clash", label: "价值判断冲突" },
    { id: `${slug}-e5`, source: nodes[0].id, target: nodes[4].id, kind: "clash", label: "跨阵营总争议" },
  ];
  return {
    schemaVersion: "1.0",
    topic: {
      title,
      slug,
      sourceNote: "synthetic_fixture",
    },
    timeRange: { minYear: 2016, maxYear: 2026 },
    nodes,
    edges,
  };
}

const topics = [
  makeTopic("topic-1", "合成议题 Alpha", 0),
  makeTopic("topic-2", "合成议题 Beta", 100),
  makeTopic("topic-3", "合成议题 Gamma", 200),
];

writeFileSync(join(dataDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
writeFileSync(join(dataDir, "topic-1.json"), JSON.stringify(topics[0], null, 2), "utf8");
writeFileSync(join(dataDir, "topic-2.json"), JSON.stringify(topics[1], null, 2), "utf8");
writeFileSync(join(dataDir, "topic-3.json"), JSON.stringify(topics[2], null, 2), "utf8");
console.log("Wrote manifest + topic-1..3.json to public/data/");
