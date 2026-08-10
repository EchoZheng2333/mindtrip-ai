# 01 · 画像页背景提亮 + 动效四件套

Status: resolved

## 背景
用户反馈 profile 页两个问题：① 几乎看不到背景图（蝴蝶图 0.24 × 蒙版 0.62，实际可见度 ~9%）② 缺少动态效果（仅一个 1s hero 淡入）。经 grill-with-docs 访谈（两轮 6 决策，全部采纳推荐项）定案：

## 决策
- 背景：整体提亮——图 0.24→**0.48**、蒙版 0.62→**0.32**
- 动效四件套（柔和缓慢，尊重 prefers-reduced-motion）：
  1. 背景呼吸：`bgBreath` 8s 循环 scale 1↔1.035（容器 inset:-3% 防露边）+ 9 粒暖金光尘 `dustFloat` 6-9s 漂移
  2. 雷达图中心展开：数据多边形 JS rAF 1.2s ease-out 从中心 (100,100) 向四顶点插值生长，网格 200ms 淡入，顶点/标签展开完成后渐现
  3. 心灵指数圆环：SVG circle stroke-dashoffset 按分数填充（r=36, C=226.2）+ 环内数字 0→X 滚动（soul_score 范围 55-85，按 0-100 百分比）
  4. 卡片交错：6 区块 `.stagger` 120ms + 100ms 间隔淡入上移 14px
- 降级：`prefers-reduced-motion` 下全部直显（CSS @media + JS REDUCE 分支）

## 实现
- `views/profile.ejs` 重写：背景层（bg/veil/dust）+ `.stagger` 交错 + 圆环结构（soul-ring-wrap）+ 雷达动画（radar-data/radar-grid/radar-node）+ JS 四函数（staggerIn/spawnDust/animateRadar/animateSoul）
- EJS 注入：`RADAR_TARGET`（目标顶点数组）、`SOUL_SCORE`（clamp 0-100）

## 验证
- profile 页 200 渲染；SOUL_SCORE=85、RADAR_TARGET 4 顶点正确注入；stagger 6 区块齐全
- 数据结构零改动
