# 02 · 画像页实时心灵指数 + 光尘 20 粒 + 停留时长权重修复

Status: resolved

## 背景
用户选定"更活的玩法"：途中每打卡一次，画像页再看时显示实时刷新的心灵指数；同时光尘从 9 粒加到 20 粒。

## 实现
- `routes/pages.js`：/profile 用 `calcReturnScore` 实时算当前指数（出发前 + 已积累打卡/快评奖励），传 `liveScore` / `checkinCount`；**修复停留时长丢失**：组装 `checkinRecords`（scene_id + stay_duration_minutes，与 /api/v1/return 一致），此前直接传 scene_id 字符串数组导致深度停留权重（1.5×）永远不生效、全部按默认 30min 计算
- `views/profile.ejs`：
  - 光尘 9→20 粒（6-9s 各自节奏）
  - 标题条件渲染：无打卡「出发前心灵指数」/ 有打卡「旅途中 · 心灵指数」
  - 副文字：无打卡「出发前基线 · 途中打卡与快评会持续刷新」/ 有打卡「出发前 X · 已打卡 N 个场景，指数随旅途生长」
  - animateSoul 起点动画：无打卡从 0 滚到基线（展示起点），有打卡从出发前滚到实时值（展示生长）
  - JS 常量 PRE_SCORE / LIVE_SCORE / HAS_TRIP（EJS 注入）

## 验证
- 无打卡：标题「出发前心灵指数」、HAS_TRIP=false、LIVE=85（=基线），圆环 0→85
- 打卡 90min 深度 + 30min 常规：标题「旅途中」、LIVE=95（85+6+4），深度停留权重生效
- 归途接口 /api/v1/return 同 session return_score 一致（顶层字段）

## 备注
- 与领域术语表一致：心灵指数 = 出发前算出 → 旅途中被停留时长/快评持续校准 → 归途生成最终值
