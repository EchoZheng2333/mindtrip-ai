# 城市实体化 + /route 参数化

Status: resolved
Type: task

## 背景

访谈确认（grill-with-docs 2026-08-09，ADR-0001）：把「城市」提升为一等实体，为跨城复制留口子。

## 任务

- 新建 `data/cities.js`：`jingdezhen`（open）+ 苏州/杭州/大理/成都（closed 占位，仅地图光点，不预置场景数据）。字段：`id / name / coords(地图坐标) / status / tagline`
- `scenes.js`、`routes.js` 每个条目加 `city: 'jingdezhen'` 归属字段
- `/route` 按 `?city=` 参数化：读 cities.js 校验，open 城市渲染动线；**无参数时重定向 `/explore`**；未开放城市给提示
- 探索页城市卡点击 → `/route?city=jingdezhen`
- 现有场景/动线/约束/打卡逻辑不动，只加城市维度筛选

## 验收

`/route?city=jingdezhen` 正常；`/route` 跳 /explore；cities.js 结构清晰可扩展。

## Comments
