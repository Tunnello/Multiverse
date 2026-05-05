# 观点对撞机 — 界面功能规格

> 日期：2026-05-05  
> 分支：main  
> 涵盖：页面布局、组件交互、数据展示、行为逻辑

---

## 一、页面整体布局

上-中-下 三段式，全屏高度，深色主题（bg-zinc-900）。

```
┌──────────────────────────────────────────────┐
│  Header：标题 | TopicSearch 搜索框 | 占位     │
├────────────────────────────┬─────────────────┤
│                            │   Sidebar       │
│    GraphCanvas             │   可折叠         │
│    力导向图                │                 │
│                            │                 │
├────────────────────────────┴─────────────────┤
│  Footer：YearSlider 年份滑块                  │
└──────────────────────────────────────────────┘
```

### 涉及文件
- `web/app/page.tsx` — 顶层状态管理与布局编排
- `web/components/GraphCanvas.tsx` — 力导向图画布
- `web/components/Sidebar.tsx` — 右侧可折叠侧边栏
- `web/components/NodeDrawer.tsx` — 节点详情固定面板
- `web/components/TopicSearch.tsx` — 顶部话题搜索下拉
- `web/components/YearSlider.tsx` — 底部年份滑块

---

## 二、Header（顶部栏）

| 元素 | 说明 |
|---|---|
| 标题 | "观点对撞机"，白色加粗，左侧固定 |
| TopicSearch | 中央搜索框，placeholder "请输入探索的主题"，支持输入过滤、键盘上下导航、点击外部关闭下拉 |
| 占位 | 右侧 100px 占位，保持布局对称 |

### TopicSearch 交互
- 下拉列表显示 manifest.topics，匹配当前输入过滤
- 选中话题后更新 `selectedTopicId` 和 `selectedTopicUrl`，触发数据重新加载
- 年份重置为该话题的 `maxYear`

---

## 三、GraphCanvas（力导向图）

### 3.1 布局算法

d3-force，**无聚类**：

| 参数 | 值 | 说明 |
|---|---|---|
| manyBody.strength | -150 | 全局节点斥力 |
| preventOverlap | true | 碰撞避免 |
| nodeSize | 30 | 碰撞检测半径 |
| linkDistance | 150 | 边的理想长度 |
| x.strength | 0.05 | 微弱水平向心力 |
| y.strength | 0.05 | 微弱垂直向心力 |
| alphaDecay | 0.015 | 模拟冷却速度 |

### 3.2 视觉映射

| 属性 | 映射 |
|---|---|
| 节点颜色 | `opinionType`：赞成 #22C55E / 中立 #3B82F6 / 反对 #EF4444 |
| 节点标签 | `author.name`，白色，11px，居节点下方 |
| 边颜色 | `kind === "clash"` 红色 #F87171，其余灰色 #94A3B8 |
| 边样式 | clash 类型为虚线 `[6, 4]`，其余实线 |

### 3.3 交互行为

| 操作 | 行为 |
|---|---|
| 悬浮节点 | 显示 tooltip，内含全部字段（见 3.4） |
| 单击节点 | 黄色描边 + 光晕高亮（`state.selected`），打开右侧 NodeDrawer |
| 单击已选中节点 | 取消选中 |
| 单击画布空白 | 取消选中，关闭 NodeDrawer |
| 双击节点 | 新标签页打开 `zhihu.url` |
| 拖拽画布 | 平移视图（drag-canvas） |
| 缩放画布 | 滚轮缩放（zoom-canvas） |
| 拖拽节点 | 移动节点位置（drag-element + click-select） |

选定模式使用 G6 内置 `click-select` behavior，`state: "selected"`。`onClick` 回调通过 `graph.getElementState()` 判断 toggle 状态向 React 通知。

### 3.4 Tooltip 内容

```
┌─────────────────────────────────┐
│ label (加粗)                     │
│ [opinionType 徽章] [camp 徽章]  │
│ keyPoint                         │
│ "quote" (斜体)                   │
│ 作者名 · badgeText · 👍赞同数    │
│ ──────────────── (分隔线)       │
│ 标题: zhihuTitle                 │
│ 类型: contentType  ID: contentId │
│ 内容: contentText (截断120字)    │
│ 链接: 打开原文 (可点击)          │
│ 评论: N    编辑: YYYY-MM-DD      │
│ 权威: N    排名: X.XX            │
│ 预测偏离: X.X                    │
└─────────────────────────────────┘
```

悬浮触发：`pointerenter`，tooltip 插件渲染 HTML。

---

## 四、NodeDrawer（节点详情面板）

右侧固定面板，宽 360px，深色背景，可滚动。

### 4.1 内容分区

**标题栏**
- 节点 label + 关闭按钮（×）

**立场 & 阵营**
- opinionType 彩色徽章 + camp 灰色徽章

**LLM 生成字段**
- 核心观点 (keyPoint)
- 立场原因 (opinionReason)
- 摘要 (summary)
- 引言 (quote)，斜体引号样式

**作者信息**
- 作者名 + badgeText（如有）
- 赞同数 (voteUpCount) + 👍 emoji
- 预测偏离 (predictionScore.predictionDeviation)

**知乎原始数据**（如有 zhihu 对象）
- 原标题 (zhihuTitle)
- 类型 (contentType) + Content ID (contentId)，并排
- 内容全文 (contentText)，最大高度可滚动，保留换行
- 打开知乎原文 → 链接，蓝色，新标签页
- 评论数 (commentCount) + 编辑时间 (editTime)，并排
- 权威等级 (authorityLevel) + 排名分 (rankingScore)，并排

### 4.2 状态

- `node === null` → 不渲染
- 年份筛选后 `selectedNodeId` 对应的节点不存在 → 不渲染

---

## 五、Sidebar（可折叠侧边栏）

默认展开，宽 256px。折叠后显示窄条（8px）带 ❮ 图标可重新打开。

### 5.1 区块

**历史记录**
- 标题 "历史记录"
- 遍历 manifest.topics，渲染为按钮列表
- 当前选中话题高亮（蓝底蓝字）
- 点击切换话题，同时更新数据和年份

**议题信息**
- 标题 "议题信息"
- 显示：标题、时间范围 (minYear–maxYear)、节点数、边数、数据来源（如有）

**立场图例**
- 标题 "立场图例"
- 赞成（绿点）- 支持该议题的观点立场
- 中立（蓝点）- 对该议题持中立态度
- 反对（红点）- 反对该议题的观点立场

**边类型图例**
- 标题 "边类型"
- 红色实线 — 对撞（冲突观点）
- 灰色实线 — 一致 / 补充
- 红色虚线 — 对撞虚线示意

---

## 六、YearSlider（年份滑块）

底部 Footer，水平滑块。

- 范围：`doc.timeRange.minYear` – `doc.timeRange.maxYear`
- 初始值：加载数据时设为 `maxYear`
- 切换话题时重置为 `maxYear`
- 拖动时实时调用 `filterGraphByYear(doc, year)` 过滤节点和边

---

## 七、数据流

```
manifest.json ──→ ManifestSchema.parse ──→ manifest state
                                            │
                    TopicSearch.onSelect    → selectedTopicId + selectedTopicUrl
                                              │
topic-N.json ──→ GraphDocumentSchema.parse ──→ doc state
                                              │
                    YearSlider.onChange      → year state
                                              │
                    filterGraphByYear()      → filtered { nodes, edges }
                                              │
                    GraphCanvas.onSelect     → selectedNodeId
                                              │
                    NodeDrawer               ← selectedNode
```

### Schema 版本

- `schemaVersion: "1.0"`
- 前端：Zod (`web/lib/graphSchema.ts`, `web/lib/manifestSchema.ts`)
- 后端：Pydantic (`pipeline/app/models.py`)

---

## 八、颜色常量

定义于 `web/lib/campColors.ts`：

| opinionType | 颜色 | 色值 |
|---|---|---|
| 赞成 | 绿色 | #22C55E |
| 中立 | 蓝色 | #3B82F6 |
| 反对 | 红色 | #EF4444 |

边颜色内联于 GraphCanvas：

| 边类型 | 颜色 | 色值 |
|---|---|---|
| clash | 红色 | #F87171 |
| agree / complement | 灰色 | #94A3B8 |

选中状态内联于 GraphCanvas：

| 状态 | 样式 |
|---|---|
| selected | 黄色描边 #FACC15，线宽 3px，黄色光晕 25% 透明度 |
