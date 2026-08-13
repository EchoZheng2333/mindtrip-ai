/**
 * 心旅 AI (MindTrip AI) — v1.2
 * Express + EJS 服务入口
 */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const JsonSessionStore = require('./services/session-store');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- 视图引擎 ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- 中间件 ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// 本地第三方库（html2canvas 等）：避免演示现场依赖 CDN
app.use('/vendor', express.static(path.join(__dirname, 'node_modules', 'html2canvas', 'dist')));

// Session 配置（JSON 文件持久化）
app.use(session({
  genid: () => uuidv4(),
  store: new JsonSessionStore(),
  secret: 'mindtrip-ai-v1.1-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 小时
  }
}));

// ---------- 路由 ----------
const pagesRouter = require('./routes/pages');
const apiRouter = require('./routes/api');

app.use('/', pagesRouter);
app.use('/api/v1', apiRouter);

// 404 处理
app.use((req, res) => {
  res.status(404).render('error', {
    title: '页面未找到',
    message: '这条路走不通，或许该换个方向。'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('error', {
    title: '出了点问题',
    message: '心旅暂时迷路了，请稍后再试。'
  });
});

// ---------- 启动 ----------
const llm = require('./services/llm');

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║         心旅 AI v1.2 已启动           ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  → 本地访问:  http://localhost:${PORT}`);
  console.log(`  → 按 Ctrl+C 停止服务`);
  console.log('');
  console.log(`  → LLM 动态文案: ${llm.isAvailable() ? '✅ 已启用 (DeepSeek)' : '⚠️  未配置（使用硬编码文案）'}`);
  console.log(`  → 高德地图: ${process.env.AMAP_KEY ? '✅ 已启用' : '⚠️  未配置（降级 SVG 示意地图）'}`);
  console.log('');
  console.log('  配置说明: 复制 .env.example 为 .env，填入 API Key');
  console.log('');
});

module.exports = app;
