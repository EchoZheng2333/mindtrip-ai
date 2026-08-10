// 心旅 AI — 行程约束适配（分层采集 · 出发前硬约束）
// 输入 session.constraints { companions, budget, purpose }
// 输出：场景契合分 / 推荐理由 / 全局说明，用于动线与备选池适配

const TYPE_FIT = {
  手作: { solo: 2, couple: 2, family: 3, friends: 1, therapy: 3, photo: 1, food: 1, culture: 3 },
  景点: { solo: 2, couple: 2, family: 1, friends: 1, therapy: 2, photo: 3, food: 0, culture: 2 },
  餐饮: { solo: 1, couple: 2, family: 2, friends: 3, therapy: 0, photo: 1, food: 3, culture: 1 },
  夜间: { solo: 1, couple: 2, family: 0, friends: 3, therapy: 0, photo: 1, food: 2, culture: 1 }
};

const PRICE_FIT = {
  low: { 低: 2, 中: 0, 高: -2 },
  normal: { 低: 1, 中: 2, 高: 0 },
  premium: { 低: 0, 中: 1, 高: 2 }
};

const COMPANION_LABEL = { solo: '独行', couple: '双人', family: '亲子', friends: '结伴' };
const PURPOSE_LABEL = { therapy: '疗愈', photo: '出片', food: '逛吃', culture: '研学' };
const BUDGET_LABEL = { low: '省着花', normal: '适中', premium: '品质优先' };

/**
 * 计算场景与约束的契合分（越高越推荐）
 */
function scoreSceneFit(scene, constraints) {
  if (!constraints) return 0;
  let score = 0;
  const typeFit = TYPE_FIT[scene.type] || {};
  if (constraints.companions && typeFit[constraints.companions] !== undefined) {
    score += typeFit[constraints.companions];
  }
  if (constraints.purpose && typeFit[constraints.purpose] !== undefined) {
    score += typeFit[constraints.purpose];
  }
  const priceFit = PRICE_FIT[constraints.budget] || {};
  const lvl = scene.price_level || '中';
  if (priceFit[lvl] !== undefined) {
    score += priceFit[lvl];
  }
  return score;
}

/**
 * 生成单个场景的推荐理由（短句，供备选池展示）
 */
function sceneFitReason(scene, constraints) {
  if (!constraints) return '';
  const parts = [];
  const budget = constraints.budget;
  const lvl = scene.price_level || '中';
  if (budget === 'low' && lvl === '高') {
    parts.push('这家消费偏高，预算档位下建议作备选');
  } else if (budget === 'low' && lvl === '低') {
    parts.push('消费友好，适合精打细算');
  } else if (budget === 'premium' && lvl === '高') {
    parts.push('品质之选，体验值得');
  }

  const purpose = constraints.purpose;
  if (purpose === 'photo' && scene.type === '景点') {
    parts.push('出片率高，光线和构图都友好');
  } else if (purpose === 'therapy' && (scene.type === '手作' || scene.type === '景点')) {
    parts.push('安静、慢节奏，适合放下心事');
  } else if (purpose === 'food' && (scene.type === '餐饮' || scene.type === '夜间')) {
    parts.push('味蕾和烟火气都不会失望');
  } else if (purpose === 'culture' && (scene.type === '手作' || scene.type === '景点')) {
    parts.push('瓷都门道，这里最值得花时间');
  }

  const companions = constraints.companions;
  if (companions === 'family' && scene.type === '手作') {
    parts.push('亲子可以一起动手，孩子会喜欢');
  } else if (companions === 'family' && scene.type === '夜间') {
    parts.push('夜间场对小朋友略晚，可考虑白天版');
  } else if (companions === 'solo' && scene.type === '餐饮') {
    parts.push('一个人吃也自在');
  }

  return parts.join('；');
}

/**
 * 生成全局约束说明（动线页顶部展示）
 */
function buildConstraintNote(constraints) {
  if (!constraints) return '';
  const bits = [];
  if (constraints.companions) bits.push(`${COMPANION_LABEL[constraints.companions]}出行`);
  if (constraints.purpose) bits.push(`奔着「${PURPOSE_LABEL[constraints.purpose]}」来`);
  if (constraints.budget) bits.push(`预算${BUDGET_LABEL[constraints.budget]}`);
  if (bits.length === 0) return '';
  return `已按你的行程安排（${bits.join(' · ')}）做了适配，动线和备选都考虑了这些条件。`;
}

module.exports = { scoreSceneFit, sceneFitReason, buildConstraintNote };
