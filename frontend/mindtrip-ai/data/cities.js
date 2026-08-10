// 心旅 AI — 城市实体（探索世界页数据源）
// status: 'open' = 可进入城市路线页；'closed' = 地图占位光点（未开放，不预置场景数据）
// coords: 真实经纬度 [lng, lat]，用于探索页版图投影

const cities = {
  jingdezhen: {
    id: 'jingdezhen',
    name: '景德镇',
    coords: [117.21, 29.29],
    status: 'open',
    tagline: '千年窑火，从瓷到心',
    scene_count: 10,
    theme: '手作 · 窑火 · 山野'
  },
  suzhou: {
    id: 'suzhou',
    name: '苏州',
    coords: [120.58, 31.30],
    status: 'closed',
    tagline: '园林与昆曲，慢下来的江南',
    scene_count: 0,
    theme: ''
  },
  hangzhou: {
    id: 'hangzhou',
    name: '杭州',
    coords: [120.15, 30.28],
    status: 'closed',
    tagline: '湖山入梦，茶香满城',
    scene_count: 0,
    theme: ''
  },
  dali: {
    id: 'dali',
    name: '大理',
    coords: [100.19, 25.61],
    status: 'closed',
    tagline: '苍山洱海，风花雪月',
    scene_count: 0,
    theme: ''
  },
  chengdu: {
    id: 'chengdu',
    name: '成都',
    coords: [104.07, 30.67],
    status: 'closed',
    tagline: '巴适烟火，慢生活本身',
    scene_count: 0,
    theme: ''
  }
};

function openCities() {
  return Object.values(cities).filter(c => c.status === 'open');
}

function isOpen(id) {
  return !!(cities[id] && cities[id].status === 'open');
}

module.exports = { cities, openCities, isOpen };
