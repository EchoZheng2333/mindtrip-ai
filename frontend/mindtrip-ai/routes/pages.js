// 心旅 AI — 页面路由
const express = require('express');
const router = express.Router();
const { cities, isOpen } = require('../data/cities');
const { calcReturnScore } = require('../services/soul-score');

// 首页 —— 品牌主张
router.get('/', (req, res) => {
  res.render('index', { title: '心旅 AI' });
});

// 隐私授权页
router.get('/consent', (req, res) => {
  res.render('consent', { title: '隐私授权' });
});

// 测评页
router.get('/quiz', (req, res) => {
  // 检查是否已完成测评（已有人格画像数据）
  if (req.session.personality) {
    return res.redirect('/profile');
  }
  res.render('quiz', { title: '心灵测评' });
});

// 画像结果页 —— 需要完成测评；心灵指数为实时值（出发前基线 + 途中打卡/快评已积累）
router.get('/profile', (req, res) => {
  if (!req.session.personality) {
    return res.redirect('/quiz');
  }
  const checkins = req.session.checkins || [];
  const reviews = req.session.reviews || [];
  const stayDurations = req.session.stay_durations || {};
  // 组装带停留时长的打卡记录（与归途接口一致，保证深度停留权重生效）
  const checkinRecords = checkins.map(sceneId => ({
    scene_id: sceneId,
    stay_duration_minutes: stayDurations[sceneId] || 30
  }));
  const live = calcReturnScore(req.session.personality.soul_score, checkinRecords, reviews);
  res.render('profile', {
    title: '心灵画像',
    personality: req.session.personality,
    liveScore: live.return_score,
    checkinCount: checkins.length
  });
});

// 探索世界页 —— 需要完成测评（地图选城）
router.get('/explore', (req, res) => {
  if (!req.session.personality) {
    return res.redirect('/quiz');
  }
  res.render('explore', {
    title: '探索世界',
    personality: req.session.personality,
    cities: Object.values(cities)
  });
});

// 城市路线页 —— 需要完成测评 + 开放城市
router.get('/route', (req, res) => {
  if (!req.session.personality) {
    return res.redirect('/quiz');
  }
  const cityId = req.query.city;
  // 无城市参数：先选城
  if (!cityId) {
    return res.redirect('/explore');
  }
  // 未开放城市：回到选城页
  if (!isOpen(cityId)) {
    return res.redirect('/explore');
  }
  res.render('route', {
    title: '心旅推荐',
    personality: req.session.personality,
    amapKey: process.env.AMAP_KEY || '',
    city: cities[cityId]
  });
});

// 场景详情页
router.get('/scene/:id', (req, res) => {
  res.render('scene', {
    title: '场景详情',
    sceneId: req.params.id
  });
});

// 归途评估页 —— 需要完成测评
router.get('/return', (req, res) => {
  if (!req.session.personality) {
    return res.redirect('/quiz');
  }
  res.render('return', {
    title: '归途评估'
  });
});

module.exports = router;
