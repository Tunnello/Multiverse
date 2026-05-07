import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "public", "data");
mkdirSync(dataDir, { recursive: true });

const topicDefs = [
  { id: "topic-1", label: "合成议题 Alpha", slug: "topic-1", title: "合成议题 Alpha" },
  { id: "topic-2", label: "合成议题 Beta", slug: "topic-2", title: "合成议题 Beta" },
  { id: "topic-3", label: "合成议题 Gamma", slug: "topic-3", title: "合成议题 Gamma" },
];

const manifest = {
  topics: topicDefs.map((t) => ({ id: t.id, label: t.label, dataUrl: `/data/${t.id}.json` })),
};

const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_DATE = new Date("2026-05-01T00:00:00Z").getTime(); // 2026-05-01 00:00 UTC

function makeTopic(slug, title, nodeOffset) {
  const camps = ["academic", "radical", "experiential", "stakeholder"];
  const nodes = [];
  for (let i = 0; i < 10; i++) {
    const dayOffset = i % 7; // 10 nodes across 7 days
    const ts = BASE_DATE + dayOffset * DAY_MS + 12 * 3600 * 1000; // noon of each day
    const id = `${slug}-n${i + nodeOffset}`;
    const dateStr = new Date(ts).toISOString().split("T")[0]; // "2026-05-01"
    nodes.push({
      id,
      // LLM 生成
      label: `作者${i + 1}`,
      camp: camps[i % 4],
      summary: `${title}：摘要 ${i + 1}（合成数据）。`,
      quote: `金句 ${i + 1}：观点要鲜明。`,
      opinionType: ["赞成", "中立", "反对"][i % 3],
      opinionReason: [
        `原因 ${i + 1}-1：该观点对议题持${["赞成", "中立", "反对"][i % 3]}态度的主要依据`,
        `原因 ${i + 1}-2：基于内容中的论述逻辑与证据链分析`,
      ],
      keyPoint: [
        `核心论点 ${i + 1}-1：该回答最关键的主张（合成数据）`,
        `核心论点 ${i + 1}-2：次要论证方向与补充观点`,
        `核心论点 ${i + 1}-3：隐含的前提假设与推论`,
      ],
      predictionScore: { predictionDeviation: (i % 5) * 0.1 },
      // Python 从知乎搜索结果填充
      author: { name: `用户_${slug}_${i}`, badgeText: i % 2 === 0 ? "认证" : "" },
      voteUpCount: 100 - i * 7,
      publishedAt: `${dateStr}T12:00:00.000Z`,
      timestamp: ts, // unix ms for G6 timebar
      zhihu: {
        zhihuTitle: `${title} - 问题 ${i + 1}`,
        contentType: "Answer",
        contentId: id,
        contentText: `这是${title}中第${i + 1}个回答的完整内容（合成数据模拟）。包含观点论证、数据支持和结论。`,
        url: `https://www.zhihu.com/question/example/answer/${id}`,
        commentCount: (10 - i) * 3,
        voteUpCount: 100 - i * 7,
        authorName: `用户_${slug}_${i}`,
        authorAvatar: `https://picsum.zhimg.com/50/v2-${id}_l.jpg`,
        authorBadge: i % 2 === 0 ? "https://pic1.zhimg.com/v2-badge_l.png" : "",
        authorBadgeText: i % 2 === 0 ? "认证" : "",
        editTime: ts / 1000, // unix seconds
        authorityLevel: i % 3 === 0 ? "1" : "0",
        rankingScore: 2.0 + Math.random() * 0.5,
      },
    });
  }
  const edges = [
    { id: `${slug}-e1`, source: nodes[0].id, target: nodes[1].id, kind: "clash", label: "方法论对立" },
    { id: `${slug}-e2`, source: nodes[1].id, target: nodes[2].id, kind: "agree", label: "前提一致" },
    { id: `${slug}-e3`, source: nodes[2].id, target: nodes[3].id, kind: "complement", label: "补充案例" },
    { id: `${slug}-e4`, source: nodes[3].id, target: nodes[4].id, kind: "clash", label: "价值判断冲突" },
    { id: `${slug}-e5`, source: nodes[0].id, target: nodes[4].id, kind: "clash", label: "跨阵营总争议" },
    { id: `${slug}-e6`, source: nodes[5].id, target: nodes[6].id, kind: "agree", label: "数据共识" },
    { id: `${slug}-e7`, source: nodes[6].id, target: nodes[7].id, kind: "clash", label: "解读分歧" },
  ];
  return {
    schemaVersion: "1.0",
    topic: {
      title,
      slug,
      sourceNote: "synthetic_fixture",
    },
    timeRange: { minYear: 2026, maxYear: 2026 },
    nodes,
    edges,
  };
}

const topics = [
  makeTopic(topicDefs[0].slug, topicDefs[0].title, 0),
  makeTopic(topicDefs[1].slug, topicDefs[1].title, 100),
  makeTopic(topicDefs[2].slug, topicDefs[2].title, 200),
];

writeFileSync(join(dataDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
writeFileSync(join(dataDir, "topic-1.json"), JSON.stringify(topics[0], null, 2), "utf8");
writeFileSync(join(dataDir, "topic-2.json"), JSON.stringify(topics[1], null, 2), "utf8");
writeFileSync(join(dataDir, "topic-3.json"), JSON.stringify(topics[2], null, 2), "utf8");
console.log("Wrote manifest + topic-1..3.json to public/data/");
