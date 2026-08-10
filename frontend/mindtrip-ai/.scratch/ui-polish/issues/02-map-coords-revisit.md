# 02 · 探索页坐标问题二次修复（投影观感 + 渲染顺序）

Status: resolved

## 背景
用户反馈 ui-polish/01 修复后坐标问题"依然存在"。核查发现两个真实 bug：

## 根因
1. **渲染顺序倒置（致命）**：`renderMap()` 是 async（fetch 完才 append 省份 path），`renderCities()` 同步先执行 → 光点 g 元素先入 SVG、省份 path 后入；省份 fill 为不透明 #3E3528，**光点被省份完全遮挡**
2. **投影观感**：Web 墨卡托把北方（黑龙江/新疆）大幅拉伸、南方压缩，地图"头重脚轻"，与用户认知的中国标准地图（Albers 等积圆锥观感）差异大

## 修复（views/explore.ejs）
- 投影改**经度按 cos(纬度) 收敛 + 纬度等距**（近似中国标准地图，上窄下宽）：`rawProj = { x: (lng-105)·cos(lat), y: 54-lat }`，中央经线 105°E
- **bounds 归一化**：`computeBounds()` 先遍历全部顶点算投影范围，`proj()` 归一化到 viewBox——版图与光点共用同一 proj，绝对对齐
- **渲染顺序修复**：`renderCities()` 移入 `renderMap()` 的 fetch 成功后调用（省份渲染完再放光点 → 光点顶层可见）；fetch 失败时兜底仍渲染光点（线性近似投影）

## 验证（硬验证）
- 射线法 point-in-polygon：5 城光点全部落在正确省份多边形内——景德镇→江西(410,223)、苏州→江苏(441,204)、杭州→浙江(439,213)、大理→云南(235,256)、成都→四川(276,210)
- 投影 bounds：x∈[-24.4, 20.0]，y∈[0.4, 50.6]，归一化后地图占满 viewBox
- explore 页 200，新代码（computeBounds/rawProj/renderCities 顺序）就位
