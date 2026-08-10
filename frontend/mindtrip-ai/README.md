# 心旅 AI (MindTrip AI) v1.2

> 心理-美学算法评测 × 文旅场景匹配推荐系统 — Node.js 版

## 快速启动

```bash
cd mindtrip-ai
npm install      # 安装依赖（首次）
cp .env.example .env  # 复制环境配置（可选）
npm start        # 启动服务
```

启动后访问 **http://localhost:3000**

开发模式（文件修改自动重启）：
```bash
npm run dev
```

## 项目结构

```
mindtrip-ai/
├── server.js               # 入口：Express 配置与启动
├── package.json
├── routes/
│   ├── pages.js            # 7 个页面路由
│   └── api.js              # 8 个 API 接口
├── data/
│   ├── questions.js        # 8 道情境测评题
│   ├── profiles.js         # 6 种审美人格
│   ├── scenes.js           # 10 个场景（含真实经纬度）
│   ├── routes.js           # 2 条动线（主线+备选）
│   └── sessions/           # session JSON 持久化目录
├── services/
│   ├── matching.js         # 人格匹配算法
│   ├── soul-score.js       # 心灵指数计算（含停留权重）
│   └── session-store.js    # JSON 文件 session 存储
├── views/                  # EJS 模板
│   ├── _head.ejs           # 公共头部
│   ├── _foot.ejs           # 公共尾部
│   ├── index.ejs           # 首页
│   ├── consent.ejs         # 隐私授权
│   ├── quiz.ejs            # 测评
│   ├── profile.ejs         # 画像结果
│   ├── route.ejs           # 动线推荐（含高德地图）
│   ├── scene.ejs           # 场景详情
│   ├── return.ejs          # 归途评估
│   └── error.ejs           # 错误页
└── public/
    └── css/
        └── style.css       # 全局样式
```

## 高德地图配置

动线页默认使用 SVG 示意地图。要启用真实高德地图：

1. 前往 [高德开放平台](https://lbs.amap.com/) 注册账号
2. 创建「Web端(JS API)」应用，获取 Key
3. 编辑 `views/route.ejs`，将 `YOUR_AMAP_KEY` 替换为你的 Key

未配置 Key 时自动降级为 SVG 示意地图，不影响其他功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Express.js |
| 模板 | EJS |
| Session | express-session + JSON 文件持久化 |
| 前端 | 原生 HTML + CSS + JS |
| 地图 | 高德地图 JS API 2.0（可降级 SVG） |
| LLM | DeepSeek API（动态诗意文案，可降级硬编码） |

## 版本更新历史

### v1.2 新增

- ✅ **API 版本号**：所有接口统一 `/api/v1/` 前缀
- ✅ **停留时长传后端**：快评时自动传 stayMinutes，参与归途指数加权计算
- ✅ **DeepSeek LLM 接入**：动态生成"为什么适合你"推荐文案和归途诗意总结
- ✅ **优雅降级**：无 LLM Key 时自动用硬编码文案，无地图 Key 时降级 SVG
- ✅ **离开场景按钮**：不快评也能记录停留时长

### v1.1 新增

- ✅ **模块化架构**：Flask 单文件 → Express 三层拆分（routes/data/services）
- ✅ **JSON 持久化**：Session 数据写入文件，重启不丢失
- ✅ **真实经纬度**：10 个场景全部配置景德镇真实坐标
- ✅ **高德地图**：支持真实地图标记+路线连线（可降级 SVG）
- ✅ **停留时间追踪**：打卡后启动计时，为心灵指数提供停留权重
- ✅ **手作场景**：主线第 3 站改为「三宝拉坯手作坊」深度体验

## LLM 配置（可选）

v1.2 支持 DeepSeek API 动态生成诗意文案。配置方式：

1. 前往 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册并获取 API Key
2. 复制 `.env.example` 为 `.env`
3. 填入 `DEEPSEEK_API_KEY=sk-xxxxxxxx`
4. 重启服务，启动时会显示 `LLM 动态文案: ✅ 已启用`

未配置时使用硬编码文案，不影响功能。
