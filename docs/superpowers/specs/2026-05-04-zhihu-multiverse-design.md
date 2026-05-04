# 设计说明：知乎「观点对撞机」(Zhihu Multiverse)

**版本：** 1.2  
**日期：** 2026-05-04  
**状态：** 评审用草案（与 `初步需求.md`、概念图、`docs/zhihu_api` 对齐）

---

## 1. 目标与边界

### 1.1 产品目标

将某一知乎议题下的多条回答，经大模型提炼为 **节点 + 边** 的图谱，在 **全屏力导向图** 上呈现 **阵营分色、对撞关系、时间维演变**；点击节点时 **右侧抽屉** 展示摘要、金句、作者信息与 **「预测偏离值」** 等可读字段，降低「长文过载」下的认知成本。

### 1.2 演示与部署边界（已定）

| 项目 | 约定 |
|------|------|
| 前端托管 | **Vercel**，技术栈倾向 **Next.js（React）+ TypeScript**，**`output: 'export'`** 纯静态导出 |
| 线上运行时 | **不调用** 知乎 API、**不调用** 大模型、**不部署** FastAPI；**无数据库** |
| 线上数据 | 仅 **打包进前端的 JSON 文件**（如 `public/data/`），浏览器 `fetch` 读取 |
| 本地开发 | **`pipeline/`（FastAPI）**：知乎官方搜索 API →（当前）最多 **10** 条 → 大模型结构化 → **写入文件**；人工将产物同步到 `web/public/data/` 后构建部署 |
| 正文占位 | 当前阶段 **`ContentText` 视为「全文」** 输入模型；后续可接「全文」链路，不在本版范围 |

### 1.3 非目标（本版明确不做）

- 线上用户自定义搜索、实时拉取、账号体系  
- 服务端持久化与多租户数据隔离  
- 与概念图 1:1 的动效/美术还原（以 **信息架构与交互闭环** 为先）

---

## 2. 总体架构（推荐方案 1）

### 2.1 仓库布局（建议）

```text
web/                 # Next.js 应用（静态导出）
  app/               # App Router 页面
  public/data/       # 演示用图谱 JSON（构建时打入包内）
pipeline/            # 本地 FastAPI + 脚本：生成 public/data 下文件
docs/
  zhihu_api/         # 知乎开放平台接口说明（已有 zhihu_search）
  superpowers/specs/ # 本设计文档
初步需求.md
```

可选：`web/scripts/copy-demo-data.*` 或根目录 `justfile` / `Makefile` 一条命令，将 `pipeline/out/` 拷贝到 `web/public/data/`，减少漏拷。

### 2.2 运行时数据流

1. **本地（作者机器）**：配置知乎 / 模型相关环境变量 → 运行 `pipeline` → 产出每个议题一份 JSON。  
2. **人工**：为 Vercel 演示准备 **3 个议题** 的定稿 JSON，放入 `web/public/data/`。  
3. **构建**：`next build` + 静态导出 → 部署到 Vercel → 用户浏览器只读静态资源。

---

## 3. 三议题切换（新增）

### 3.1 需求

作者会 **手动在本地跑 3 个问题的数据**；前端需提供 **「三个问题的建议框」**，用于在演示时在三条样本数据之间切换。

### 3.2 交互与占位

- 在首屏或顶栏显著位置展示 **三个并列入口**（卡片 / Tab / 列表均可，实现阶段再定视觉），文案占位：  
  - **问题 1**  
  - **问题 2**  
  - **问题 3**  
- 点击某一入口后，主视图加载对应的 **静态 JSON**（例如 `data/topic-1.json`、`topic-2.json`、`topic-3.json`；文件名可在实现时固定，**与占位文案一一对应**）。  
- 后续作者用真实标题替换时，仅改 **展示文案** 与（若需要）** JSON 内嵌的议题标题字段**，不必改路由模型：仍保持 **三固定槽位 → 三固定文件**。

### 3.3 配置建议（实现参考）

增加一份轻量 **清单文件** `public/data/manifest.json`，例如：

```json
{
  "topics": [
    { "id": "topic-1", "label": "问题 1", "dataUrl": "/data/topic-1.json" },
    { "id": "topic-2", "label": "问题 2", "dataUrl": "/data/topic-2.json" },
    { "id": "topic-3", "label": "问题 3", "dataUrl": "/data/topic-3.json" }
  ]
}
```

构建前保证 **三个 `dataUrl` 文件均存在**（可为最小合法空图占位，避免演示 404）。

---

## 4. 图谱 JSON 合同（草案）

以下为 **演示端** 消费的最小结构；`pipeline` 输出应兼容该形状（字段可扩展，**不得缺 P0 字段**）。

### 4.1 根对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `schemaVersion` | string | 如 `"1.0"` |
| `topic` | object | `title`, `slug`, `sourceNote`（可选，说明数据来自搜索快照） |
| `timeRange` | object | `minYear`, `maxYear`，与 UI 滑条一致 |
| `nodes` | array | 见 4.2 |
| `edges` | array | 见 4.3 |

### 4.2 节点 `nodes[]`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 稳定 ID（可与 `ContentID` 同源） |
| `label` | string | 短标题或作者侧展示名 |
| `camp` | enum | `academic` \| `radical` \| `experiential` \| `stakeholder`（四阵营 → 蓝/红/绿/紫） |
| `summary` | string | 抽屉内极简摘要 |
| `quote` | string | 核心金句 |
| `author` | object | `name`, `badgeText?`, `avatarUrl?` |
| `voteUpCount` | number | 赞同数（来自搜索项时可原样带入） |
| `publishedAt` | string | ISO 8601 或 Unix，用于时间漂移显隐 |
| `predictionScore` | object | `driftLabel` 或数值型 **`predictionDeviation`**（「预测偏离值」，展示层可格式化为文案） |
| `contentType` | string | 可选，与知乎 `ContentType` 对齐便于溯源 |

### 4.3 边 `edges[]`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 稳定 ID |
| `source` / `target` | string | 节点 `id` |
| `kind` | enum | `agree` \| `clash` \| `complement`（对撞高亮主要针对 `clash`） |
| `label` | string | 悬浮/说明用短文案（争议焦点、补充关系说明） |

### 4.4 时间漂移（P0 行为）

- 演示端根据滑条当前年份 `Y`：**`publishedAt > Y` 的节点隐藏或置灰**（与 PRD「尚未发布则隐藏」一致，具体视觉实现可二选一，需在实现计划中写死一种）。  
- 边可随端点可见性联动隐藏，避免悬空边。

### 4.5 对撞 / 共识模式

- **P0**：**对撞模式**（强调 `kind: clash` 的边样式与悬浮文案）。  
- **共识模式**：若档期不足，可 **二期**；若一期实现，则定义为 **边过滤/弱化 clash、突出聚类或 agree** 的同一数据集视图切换（不新增第二套 JSON）。

---

## 5. 示例数据生成（新增）

### 5.1 目的

在 **不依赖** 知乎密钥与大模型可用性的前提下，为前端与静态部署提供 **完全符合第 4 节 JSON 合同** 的可运行样本，用于：联调 G6、抽屉、时间滑条、三议题切换；以及 Vercel **开箱即演示**。

### 5.2 交付物（路径约定）

| 文件 | 说明 |
|------|------|
| `web/public/data/manifest.json` | 与 **第 3.3 节** 一致，三条 `topics` 指向下方三份图谱 |
| `web/public/data/topic-1.json` | **问题 1** 占位槽位对应的完整图谱 JSON |
| `web/public/data/topic-2.json` | **问题 2** |
| `web/public/data/topic-3.json` | **问题 3** |

三份 `topic-*.json` 须 **各自独立合法**：`schemaVersion`、`topic`、`timeRange`、`nodes`、`edges` 齐全；`nodes` 可为 **≤10** 条（与搜索上限对齐的演示规模），**阵营分布** 建议至少覆盖四种 `camp` 中的三种以上，**边** 中须含若干 `kind: clash` 以便对撞模式可见。

### 5.3 内容来源与标注

- **虚构合成数据**：允许人写或脚本生成；`topic.sourceNote` 建议标明 `synthetic_fixture` 或等价说明，避免与真实知乎快照混淆。  
- **由 pipeline 落盘的真实快照**：若某槽位已替换为真实跑数结果，可改写 `sourceNote` / `topic.title` 与 `manifest` 中的 `label`。

### 5.4 生成方式（实现任选其一或组合）

1. **手写 JSON**：按第 4 节字段表直接编辑，最快验证 schema。  
2. **小型生成脚本**（Python/Node 均可）：在本仓库内维护脚本，按合同随机或模板化生成节点/边与 `publishedAt` 分布，**输出到** `web/public/data/` 或 `pipeline/out/` 再拷贝。  
3. **pipeline 的 fixture 模式**（可选）：子命令在 **不调外部 API** 时写出上述三文件，便于 CI 与新人一键拉齐演示数据。

### 5.5 与时间漂移、抽屉的最低验收

- 每条 `nodes[].publishedAt` 应落在 `timeRange.minYear`～`timeRange.maxYear` 之间或略超出以演示「未出现」的隐藏逻辑。  
- 每条节点具备非空的 `summary`、`quote`、`author.name`，`predictionScore` 内具备可展示的 **`predictionDeviation`**（数值或枚举再由 UI 格式化）。  
- `edges` 无悬空 `source`/`target`。

---

## 6. 知乎搜索 API 约束（开发期）

依据 `docs/zhihu_api/zhihu_search.md`：

- `Count` 最大 **10**；本版示例 **10 条**。  
- 鉴权：`Authorization: Bearer <secret>`，`X-Request-Timestamp`。  
- 模型输入当前以 **`ContentText` 为正文代理**；`Title`、`VoteUpCount`、`EditTime`、`Url` 等一并传入，便于摘要与溯源展示。

---

## 7. 可视化与前端技术点

- **力导向图**：**AntV G6**（与 PRD 一致）；阵营颜色与设计稿/PRD 四色对齐。  
- **对撞边**：`clash` 使用虚线/动画样式（实现级细节）。  
- **右侧抽屉**：选中节点驱动；展示 4.2 中字段。  
- **三议题建议框**：见第 3 节。

---

## 8. 风险与演示预案（与 PRD 一致）

- **线上零外部依赖**，避免现场网络与密钥问题。  
- 本地生成失败时，仍保留 **上一次成功写入** 的 `public/data/*.json` 作为演示底稿。

---

## 9. 自检记录（占位扫描）

- 无 `TBD`：三议题占位文案、文件命名、`manifest` 形状已写明。  
- **第 5 节** 已要求按合同生成三份示例图谱 + `manifest`，与「空 `nodes`」兜底二选一：优先 **非空示例**；若暂空，UI 须提示「数据待生成」（见实现计划）。  
- **待实现阶段验证**：G6 与 Next 静态导出在包体积与按需加载上的配置。

---

## 10. 下一文档

用户确认本 spec 无歧义后，使用 **writing-plans** 技能产出实现计划（目录脚手架、`pipeline` 接口形状、页面与组件拆分顺序、**第 5 节示例数据** 的生成脚本或手写路径、占位 JSON 与 `manifest` 的落地顺序）。
