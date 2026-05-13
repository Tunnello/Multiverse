import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "public", "data");
mkdirSync(dataDir, { recursive: true });

const topicDefs = [
  { id: "topic-1", label: "怎么看待豆包收费？", slug: "topic-1", title: "怎么看待豆包收费？" },
];

const manifest = {
  topics: topicDefs.map((t) => ({ id: t.id, label: t.label, dataUrl: `/data/${t.id}.json` })),
};

const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_DATE = new Date("2026-05-01T00:00:00Z").getTime();

const AUTHORS = [
  "猫叔看世界",
  "南林子",
  "aurora",
  "欠断西",
  "无意觅知音",
  "闲人电影",
  "深夜书房",
  "科技边角料",
  "北风拾贰",
  "江南落叶",
];

const AVATARS = [
  "https://picx.zhimg.com/50/v2-c6d365b44f8926a3d3bf50a2d4c3d9c4_l.jpg?source=bbf6831d",
  "https://pic1.zhimg.com/50/310d85e8d_l.jpg?source=bbf6831d",
  "https://pica.zhimg.com/50/v2-528610a41128dd29cb935585eec2b653_l.jpg?source=bbf6831d",
  "https://pic1.zhimg.com/50/fca79cac273e40941b8a3777d85e162b_l.jpg?source=bbf6831d",
  "https://picx.zhimg.com/50/v2-4b85eadec22bb93f680819d59867442a_l.jpg?source=bbf6831d",
  "https://pic1.zhimg.com/50/v2-d1d85327e48f35b7d30ff8d045e179f3_l.jpg?source=bbf6831d",
  "https://picx.zhimg.com/50/v2-fc124fe8707c258995754bb5972d7fc9_l.jpg?source=bbf6831d",
  "https://picx.zhimg.com/50/v2-43524d2d5735bd4c6e8731109eca9ed2_l.jpg?source=bbf6831d",
];

const SUMMARIES = [
  "豆包作为大厂出品的AI助手，收费是商业化必经之路。相比竞品仍具性价比，关键在于能否保持服务质量。",
  "从免费到付费是互联网产品的普遍规律。豆包的功能深度和算力成本决定了收费是迟早的事。",
  "支持收费，但不支持当前定价。对于轻度用户来说，按量计费或低价套餐会更友好。",
  "豆包收费模式不够透明，用户对免费功能突然受限感到不满。应当明确区分免费和付费边界。",
  "相比海外AI产品动辄20美元/月的定价，豆包的定价相对克制。但面向国内用户仍偏高。",
  "豆包收费背后是大模型推理成本的现实压力。长期免费补贴不可持续，理性看待商业化。",
  "收费可以，但请保留基础免费额度。学生和低收入群体需要可负担的AI工具。",
  "豆包的差异化能力（长文处理、深度思考）值得付费，但日常对话功能不应受限过多。",
  "作为早期用户，能理解收费决策。但建议分阶段实施，给用户足够的适应期。",
  "行业趋势如此，文心一言、通义千问也在探索收费。豆包的优势在于字节生态的整合能力。",
];

const QUOTES = [
  "豆包收费是必然的，关键是收多少、怎么收。",
  "好产品值得付费，但不能一上来就收割用户。",
  "免费时代的豆包改变了我的工作方式，我愿意为价值付费。",
  "收费的底线是：不要让用户觉得被背叛了。",
  "从免费到付费，需要一个平滑的过渡方案。",
  "AI产品的付费时代已经到来，我们需要适应的不是要不要付费，而是如何合理付费。",
  "豆包的收费策略直接影响我对字节系产品的整体好感度。",
  "定价应该和功能匹配，不能一刀切。",
  "作为AI重度用户，我愿意为高质量服务付费，但需要清晰的权益说明。",
  "豆包收费是对AI行业的一个风向标事件。",
];

const KEY_POINTS = [
  ["商业化是必然路径", "定价策略需要更灵活", "应保留基础免费额度"],
  ["大模型推理成本高昂", "免费模式不可持续", "收费是负责的表现"],
  ["竞品也在探索收费", "豆包性价比仍占优", "生态整合是核心竞争力"],
  ["用户信任至关重要", "收费方式应当透明", "过渡期要足够长"],
  ["收费与价值匹配是关键", "需要更多定价档位选择", "轻度用户应有低价方案"],
  ["行业趋势不可逆", "需要建立付费心智", "豆包是先行者也是风向标"],
  ["学生群体需要照顾", "教育用途应免费或优惠", "收费不应加剧数字鸿沟"],
  ["长文和深度思考功能强大", "日常对话应有免费额度", "按功能维度收费更合理"],
  ["给用户足够的适应期", "分阶段实施更稳妥", "积极沟通消解用户疑虑"],
  ["字节生态优势明显", "多产品联动提升价值感", "收费是生态成熟的表现"],
];

const OPINION_REASONS = [
  ["豆包作为头部AI产品，商业化是可持续发展的必要条件", "免费模式无法承担持续增长的算力消耗"],
  ["国内AI市场需要建立健康的付费生态", "合理的收费才能支撑技术持续进步"],
  ["大厂有能力提供低价方案", "规模化运营可以摊薄成本"],
  ["当前定价对轻度用户不友好", "缺少阶梯式的定价方案"],
  ["豆包的差异化功能确实创造了额外价值", "用户应当为独特价值付费"],
  ["长期亏损运营对产品发展不利", "付费有助于提升服务质量"],
  ["定价应参考国内消费水平", "与海外产品直接比较价格不公平"],
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeTopic(slug, title, nodeOffset) {
  const camps = ["academic", "radical", "experiential", "stakeholder"];
  const nodes = [];
  for (let i = 0; i < 10; i++) {
    const dayOffset = i % 7;
    const ts = BASE_DATE + dayOffset * DAY_MS + 12 * 3600 * 1000;
    const id = `${slug}-n${i + nodeOffset}`;
    const dateStr = new Date(ts).toISOString().split("T")[0];
    const opinionType = ["赞成", "中立", "反对"][i % 3];
    nodes.push({
      id,
      label: AUTHORS[i],
      camp: camps[i % 4],
      summary: SUMMARIES[i],
      quote: QUOTES[i],
      opinionType,
      opinionReason: OPINION_REASONS[i % OPINION_REASONS.length],
      keyPoint: KEY_POINTS[i],
      predictionScore: { predictionDeviation: (i % 5) * 0.1 },
      avatar: AVATARS[i % AVATARS.length],
      author: { name: AUTHORS[i], avatar: AVATARS[i % AVATARS.length], badgeText: i % 2 === 0 ? "认证" : "" },
      voteUpCount: 100 - i * 7,
      publishedAt: `${dateStr}T12:00:00.000Z`,
      timestamp: ts,
      zhihu: {
        zhihuTitle: `怎么看待豆包收费？`,
        contentType: "Answer",
        contentId: id,
        contentText: SUMMARIES[i],
        url: `https://www.zhihu.com/question/example/answer/${id}`,
        commentCount: (10 - i) * 3,
        voteUpCount: 100 - i * 7,
        authorName: AUTHORS[i],
        authorAvatar: AVATARS[i % AVATARS.length],
        authorBadge: i % 2 === 0 ? "https://pic1.zhimg.com/v2-badge_l.png" : "",
        authorBadgeText: i % 2 === 0 ? "认证" : "",
        editTime: ts / 1000,
        authorityLevel: i % 3 === 0 ? "1" : "0",
        rankingScore: 2.0 + Math.random() * 0.5,
      },
    });
  }
  const edges = [
    { id: `${slug}-e1`, source: nodes[0].id, target: nodes[1].id, kind: "clash", label: "商业化路径之争" },
    { id: `${slug}-e2`, source: nodes[1].id, target: nodes[2].id, kind: "agree", label: "定价策略共识" },
    { id: `${slug}-e3`, source: nodes[2].id, target: nodes[3].id, kind: "complement", label: "用户权益补充" },
    { id: `${slug}-e4`, source: nodes[3].id, target: nodes[4].id, kind: "clash", label: "价值判断冲突" },
    { id: `${slug}-e5`, source: nodes[0].id, target: nodes[4].id, kind: "clash", label: "商业模式辩论" },
    { id: `${slug}-e6`, source: nodes[5].id, target: nodes[6].id, kind: "agree", label: "成本问题共识" },
    { id: `${slug}-e7`, source: nodes[6].id, target: nodes[7].id, kind: "clash", label: "定价方案分歧" },
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
];

writeFileSync(join(dataDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
writeFileSync(join(dataDir, "topic-1.json"), JSON.stringify(topics[0], null, 2), "utf8");
console.log("Wrote manifest + topic-1.json to public/data/");
