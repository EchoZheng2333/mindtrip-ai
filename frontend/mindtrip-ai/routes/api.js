// 心旅 AI — API 路由
const express = require('express');
const router = express.Router();

const questions = require('../data/questions');
const { scenes } = require('../data/scenes');
const routes = require('../data/routes');
const { matchPersonality } = require('../services/matching');
const { calcReturnScore } = require('../services/soul-score');
const { generateWhyFitBatch, generateReturnPoem } = require('../services/llm');
const { scoreSceneFit, sceneFitReason, buildConstraintNote } = require('../services/constraints');
const db = require('../services/db');

// 快测 8 题 + 行程约束 3 题
const ALL_QUESTIONS = [...questions, ...(questions.constraintQuestions || [])];

// ============================================================
// GET /api/quiz — 获取测评题库（8 道快测 + 3 道行程约束）
// ============================================================
router.get('/quiz', (req, res) => {
  // 返回题目但不包含维度分（维度分在服务端计算）
  const safeQuestions = questions.map(q => ({
    id: q.id,
    scenario: q.scenario,
    options: q.options.map(o => ({ text: o.text }))
  }));
  const safeConstraints = (questions.constraintQuestions || []).map(q => ({
    id: q.id,
    is_constraint: true,
    scenario: q.scenario,
    options: q.options.map(o => ({ text: o.text }))
  }));
  res.json({ questions: safeQuestions, constraints: safeConstraints });
});

// ============================================================
// POST /api/submit_quiz — 提交测评答案，返回人格画像
// ============================================================
router.post('/submit_quiz', (req, res) => {
  const { answers } = req.body;
  const totalCount = ALL_QUESTIONS.length;

  if (!answers || !Array.isArray(answers) || answers.length !== totalCount) {
    return res.status(400).json({
      success: false,
      message: `请完成全部 ${totalCount} 道题目`
    });
  }

  const personality = matchPersonality(answers, ALL_QUESTIONS);

  // 从答案中抽出行程约束（同行人 / 预算 / 目的）
  const constraints = {};
  for (const answer of answers) {
    const q = ALL_QUESTIONS.find(x => x.id === answer.question_id);
    if (q && q.is_constraint && q.key) {
      const opt = q.options[answer.option_index];
      if (opt && opt.value) constraints[q.key] = opt.value;
    }
  }

  // 存入 session
  req.session.personality = personality;
  req.session.constraints = constraints;
  req.session.checkins = [];
  req.session.reviews = [];
  req.session.route_edits = [];

  res.json({ success: true, profile: personality, constraints });
});

// ============================================================
// GET /api/profile — 获取当前用户人格画像
// ============================================================
router.get('/profile', (req, res) => {
  if (!req.session.personality) {
    return res.status(404).json({
      success: false,
      message: '请先完成测评'
    });
  }
  res.json(req.session.personality);
});

// ============================================================
// GET /api/v1/route/:type — 获取动线推荐（main | alternative）
// why-fit 为独立异步接口（见下方），此处让位
// ============================================================
router.get('/route/:type', async (req, res, next) => {
  if (req.params.type === 'why-fit') return next(); // 让位给专门的 why-fit 路由
  const routeType = req.params.type;
  const route = routes[routeType];

  if (!route) {
    return res.status(404).json({
      success: false,
      message: '动线不存在'
    });
  }

  // 按城市过滤（城市路线页参数化）
  const cityId = req.query.city;
  if (cityId && route.city !== cityId) {
    return res.status(404).json({ success: false, message: '该城市暂无此动线' });
  }

  // 展开时间轴，挂载完整场景数据
  const timeline = route.timeline.map(node => {
    const scene = scenes[node.scene_id];
    if (!scene) return null;

    return {
      ...scene,
      transit_from_prev: node.transit_from_prev,
      order: node.order,
      time_slot: node.time_slot,
      time_range: node.time_range,
      note: node.note
    };
  }).filter(Boolean);

  // 分层采集：按行程约束做动线适配说明
  const constraints = req.session.constraints || null;
  const constraintNote = constraints ? buildConstraintNote(constraints) : '';

  res.json({
    name: route.name,
    desc: route.desc,
    timeline,
    constraints: constraints ? { ...constraints, note: constraintNote } : null
  });
});

// ============================================================
// GET /api/v1/route/why-fit — 异步生成"为什么适合你"文案
// 不阻塞动线首屏：进入动线页先渲染本地数据，文案后台生成后渐进更新
// 带 session 级缓存：同人格 + 同动线只调一次 LLM
// ============================================================
router.get('/route/why-fit', async (req, res) => {
  if (!req.session.personality) return res.json({ ok: false });

  const routeType = req.query.type || 'main';
  const route = routes[routeType];
  if (!route) return res.json({ ok: false });

  const cityId = req.query.city;
  if (cityId && route.city !== cityId) return res.json({ ok: false });

  const profile = req.session.personality.profile;
  const cacheKey = profile.name + '|' + routeType + '|' + route.city;

  // session 级缓存命中：直接返回
  if (req.session.why_fit_cache && req.session.why_fit_cache[cacheKey]) {
    return res.json({ ok: true, why_fit: req.session.why_fit_cache[cacheKey] });
  }

  const timeline = route.timeline.map(node => scenes[node.scene_id]).filter(Boolean);
  const llmWhyFit = await generateWhyFitBatch(profile, timeline);
  if (!llmWhyFit) return res.json({ ok: false });

  if (!req.session.why_fit_cache) req.session.why_fit_cache = {};
  req.session.why_fit_cache[cacheKey] = llmWhyFit;
  res.json({ ok: true, why_fit: llmWhyFit });
});

// ============================================================
// GET /api/scene/:id — 获取场景详情
// ============================================================
router.get('/scene/:id', (req, res) => {
  const scene = scenes[req.params.id];

  if (!scene) {
    return res.status(404).json({
      success: false,
      message: '场景不存在'
    });
  }

  // 附加打卡状态
  const checkins = req.session.checkins || [];
  const checkedIn = checkins.includes(req.params.id);

  res.json({
    ...scene,
    checked_in: checkedIn
  });
});

// ============================================================
// POST /api/checkin — 场景打卡
// ============================================================
router.post('/checkin', (req, res) => {
  const { scene_id, stay_duration_minutes } = req.body;

  if (!scene_id) {
    return res.status(400).json({
      success: false,
      message: '缺少 scene_id'
    });
  }

  if (!scenes[scene_id]) {
    return res.status(404).json({
      success: false,
      message: '场景不存在'
    });
  }

  if (!req.session.checkins) {
    req.session.checkins = [];
  }

  // 避免重复打卡
  if (!req.session.checkins.includes(scene_id)) {
    req.session.checkins.push(scene_id);
  }

  // 存储停留时长（用于 v1.1 心灵指数加权）
  if (stay_duration_minutes !== undefined) {
    if (!req.session.stay_durations) {
      req.session.stay_durations = {};
    }
    req.session.stay_durations[scene_id] = stay_duration_minutes;
  }

  res.json({
    success: true,
    checkins: req.session.checkins,
    message: '已打卡！心旅 AI 记录下了你在这里的足迹。'
  });
});

// ============================================================
// POST /api/review — 提交快评
// ============================================================
router.post('/review', (req, res) => {
  const { scene_id, recommend, comment, stay_minutes } = req.body;

  if (!scene_id || recommend === undefined) {
    return res.status(400).json({
      success: false,
      message: '请提供 scene_id 和 recommend'
    });
  }

  if (!scenes[scene_id]) {
    return res.status(404).json({
      success: false,
      message: '场景不存在'
    });
  }

  if (!req.session.reviews) {
    req.session.reviews = [];
  }

  req.session.reviews.push({
    scene_id,
    recommend,
    comment: comment || ''
  });

  // v1.2: 如果前端传了停留时长，更新 session 中的记录
  if (stay_minutes !== undefined && stay_minutes >= 0) {
    if (!req.session.stay_durations) {
      req.session.stay_durations = {};
    }
    req.session.stay_durations[scene_id] = stay_minutes;
  }

  const positiveCount = req.session.reviews.filter(r => r.recommend).length;

  const message = recommend
    ? '已记录你的点评，AI会据此优化推荐。感谢你的分享！'
    : '已记录，下次会推荐更符合你的心旅场景。';

  res.json({
    success: true,
    message,
    positive_count: positiveCount
  });
});

// ============================================================
// GET /api/v1/return — 获取归途心灵评估
// v1.2: 接入 LLM 动态生成诗意总结
// ============================================================
router.get('/return', async (req, res) => {
  if (!req.session.personality) {
    return res.status(404).json({
      success: false,
      message: '请先完成测评'
    });
  }

  const preScore = req.session.personality.soul_score;
  const checkins = req.session.checkins || [];
  const reviews = req.session.reviews || [];
  const stayDurations = req.session.stay_durations || {};

  // 构建带停留时长的打卡记录
  const checkinRecords = checkins.map(sceneId => ({
    scene_id: sceneId,
    stay_duration_minutes: stayDurations[sceneId] || 30
  }));

  const result = calcReturnScore(preScore, checkinRecords, reviews);

  // v1.2: 尝试用 LLM 生成诗意总结
  const llmPoem = await generateReturnPoem({
    profileName: req.session.personality.profile.name,
    preScore,
    returnScore: result.return_score,
    improvement: result.improvement,
    returnTags: result.return_tags,
    checkinCount: result.checkin_count,
    reviewCount: result.review_count
  });

  // 降级：无 LLM 时使用模板文案
  const poeticSummary = llmPoem || [
    `这趟心旅，你的心灵指数从 ${preScore} 提升到 ${result.return_score}，提升了 ${result.improvement} 分。`,
    result.return_tags.join('、'),
    `你一共走过了 ${result.checkin_count} 个场景，留下了 ${result.review_count} 条感受。`
  ].join('');

  // 心灵足迹：行程回顾（打卡过的场景详情）
  const checkinPlaces = checkins
    .map(id => scenes[id])
    .filter(Boolean)
    .map(s => ({
      id: s.id,
      name: s.name,
      emoji: s.emoji || '',
      type: s.type,
      poetic_desc: (s.poetic_desc || '').substring(0, 42)
    }));

  // 美学 DNA：偏好 + 测评标签
  const profile = req.session.personality;
  const dnaTags = [profile.profile?.preference, ...(profile.quiz_tags || []).slice(0, 2)]
    .filter(Boolean);
  const aestheticDna = dnaTags.length > 0 ? dnaTags.join(' · ') : '自然沉浸 · 人文感知';

  res.json({
    pre_score: preScore,
    return_score: result.return_score,
    improvement: result.improvement,
    pre_tags: req.session.personality.pre_tags,
    return_tags: result.return_tags,
    checkin_count: result.checkin_count,
    review_count: result.review_count,
    positive_count: result.positive_count,
    profile_name: req.session.personality.profile.name,
    poetic_summary: poeticSummary,
    llm_generated: llmPoem !== null,
    checkin_places: checkinPlaces,
    aesthetic_dna: aestheticDna
  });
});

// ============================================================
// GET /api/v1/scenes — 获取全部场景列表（供推荐页构建备选池）
// 分层采集：有行程约束时附上契合分与推荐理由
// ============================================================
router.get('/scenes', (req, res) => {
  const constraints = req.session.constraints || null;
  const cityId = req.query.city;
  const sceneList = Object.values(scenes)
    .filter(s => !cityId || s.city === cityId)
    .map(s => {
    const item = {
      id: s.id,
      name: s.name,
      type: s.type,
      time_slot: s.time_slot,
      poetic_desc: s.poetic_desc,
      crowd_level: s.crowd_level,
      coords: s.coords,
      nav_url: s.nav_url,
      emoji: s.emoji,
      image: s.image || '',
      checked_in: (req.session.checkins || []).includes(s.id),
      time_limited: s.time_limited || '',
      business_hours: s.business_hours || '',
      special_events: s.special_events || [],
      price_level: s.price_level || '中'
    };
    if (constraints) {
      item.fit_score = scoreSceneFit(s, constraints);
      item.fit_reason = sceneFitReason(s, constraints);
    }
    return item;
  });
  // 有约束时按契合分降序（备选池优先展示更合适的）
  if (constraints) {
    sceneList.sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0));
  }
  res.json({ scenes: sceneList });
});

// ============================================================
// POST /api/v1/route/edit — 记录动线编辑行为（隐式问卷）
// 分层采集：用户拖拽换序 / 备选池替换 → 落盘并微调画像
// ============================================================
router.post('/route/edit', (req, res) => {
  const { action, day_index, from_idx, to_idx, scene_in, scene_out } = req.body;

  if (!['reorder', 'replace'].includes(action)) {
    return res.status(400).json({ success: false, message: '未知的编辑动作' });
  }

  if (!req.session.route_edits) {
    req.session.route_edits = [];
  }
  req.session.route_edits.push({
    action,
    day_index: day_index !== undefined ? day_index : null,
    from_idx: from_idx !== undefined ? from_idx : null,
    to_idx: to_idx !== undefined ? to_idx : null,
    scene_in: scene_in || null,
    scene_out: scene_out || null,
    ts: Date.now()
  });

  // 隐式画像微调：替换场景时，换入场景的调性给对应维度加权
  // 类型 → 四维映射：手作≈情绪(沉浸)，景点≈审美，餐饮/夜间≈社交
  const TYPE_DIM = { 手作: '情绪', 景点: '审美', 餐饮: '社交', 夜间: '社交' };
  let adjusted = null;
  if (action === 'replace' && scene_in && req.session.personality) {
    const inScene = scenes[scene_in];
    const dim = inScene && TYPE_DIM[inScene.type];
    const dims = req.session.personality.dim_scores;
    if (dim && dims && dims[dim] !== undefined) {
      dims[dim] = Math.min(Math.round(dims[dim]) + 1, 12);
      adjusted = dim;
    }
  }

  res.json({
    success: true,
    edit_count: req.session.route_edits.length,
    adjusted,
    message: adjusted
      ? `已记录你的调整，画像维度「${adjusted}」相应微调`
      : '已记录你的调整'
  });
});

// ============================================================
// POST /api/v1/share — 旅程分享：保存归途数据，返回分享 token
// 生成无状态分享页（其他设备可访问），支撑传播转发
// ============================================================
router.post('/share', (req, res) => {
  if (!req.session.personality) {
    return res.status(400).json({ success: false, message: '请先完成测评' });
  }
  const { nickname, profile_name, aesthetic_dna, pre_score, return_score, improvement,
          pre_tags, return_tags, poetic_summary, checkin_places } = req.body;
  const token = db.createShare({
    nickname: nickname || db.getNickname(req.sessionID) || '旅人',
    profile_name: profile_name || req.session.personality.profile.name,
    aesthetic_dna: aesthetic_dna || '',
    pre_score: pre_score || 0,
    return_score: return_score || 0,
    improvement: improvement || 0,
    pre_tags: pre_tags || [],
    return_tags: return_tags || [],
    poetic_summary: poetic_summary || '',
    checkin_places: checkin_places || []
  });
  res.json({ success: true, token, share_url: '/share/' + token });
});

// ============================================================
// GET /api/v1/weather — 当日天气（高德 Web 服务代理，降级友好）
// 说明：高德一个 Key 只能绑定一个平台类型。
//   - AMAP_WEB_KEY: "Web服务"类型 Key（天气/POI 查询）
//   - AMAP_KEY: "Web端(JS API)"类型 Key（前端地图）
// 缺 Web 服务 Key 时静默降级，前端自动隐藏天气卡片
// ============================================================
router.get('/weather', async (req, res) => {
  const key = process.env.AMAP_WEB_KEY || process.env.AMAP_KEY || '';
  if (!key) return res.json({ ok: false });

  try {
    const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=360200&key=${encodeURIComponent(key)}&extensions=base`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    let r;
    try {
      r = await fetch(url, { signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
    const data = await r.json();
    if (data && data.status === '1' && data.lives && data.lives[0]) {
      const l = data.lives[0];
      res.json({
        ok: true,
        weather: l.weather,
        temperature: l.temperature,
        winddirection: l.winddirection,
        windpower: l.windpower,
        humidity: l.humidity,
        city: l.city
      });
    } else {
      res.json({ ok: false });
    }
  } catch (e) {
    res.json({ ok: false });
  }
});

// ============================================================
// GET /api/v1/reset — 重置 session
// ============================================================
router.get('/reset', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '重置失败' });
    }
    res.json({ success: true, message: '已重置，欢迎再次开启心旅。' });
  });
});

module.exports = router;
