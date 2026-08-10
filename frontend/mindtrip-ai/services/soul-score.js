// 心旅 AI — 心灵指数计算服务
// v1.1: 引入停留体验权重

/**
 * 计算归途心灵指数
 * 
 * 公式：
 * 归途指数 = min(出发前指数 + Σ(基础打卡分 × W_stay + S_sentiment × W_depth), 98)
 * 
 * 其中：
 * - 基础打卡分：4 分/场景
 * - W_stay（停留体验权重）：
 *     < 20min: 0.3（快闪）
 *     20-60min: 1.0（常规）
 *     60-180min: 1.5（深度）
 * - S_sentiment（语义情感得分）：0-5
 * - W_depth（文本深度权重）：1.2（真诚） / 0（随意）
 * 
 * v1.1 demo 简化版：不接入 NLP，用 recommend 字段代替语义分析
 *   推荐(recommend=true) → S_sentiment = 4
 *   不推荐(recommend=false) → S_sentiment = 1
 *   有文字comment → W_depth = 1.2
 *   无文字comment → W_depth = 0
 *
 * @param {number} preScore - 出发前心灵指数
 * @param {Array} checkins - 打卡记录 [{scene_id, stay_duration_minutes}]
 * @param {Array} reviews - 快评记录 [{scene_id, recommend, comment}]
 * @returns {Object} { return_score, improvement, return_tags }
 */
function calcReturnScore(preScore, checkins, reviews) {
  let bonus = 0;

  const reviewMap = {};
  for (const r of reviews) {
    reviewMap[r.scene_id] = r;
  }

  for (const c of checkins) {
    const stayMin = c.stay_duration_minutes || 30; // 默认30分钟

    // 停留权重
    let wStay = 1.0;
    if (stayMin < 20) wStay = 0.3;
    else if (stayMin >= 60 && stayMin <= 180) wStay = 1.5;

    // 基础打卡分
    const baseScore = 4 * wStay;

    // 语义情感分
    const review = reviewMap[c.scene_id];
    let sentimentScore = 0;
    let wDepth = 0;

    if (review) {
      sentimentScore = review.recommend ? 4 : 1;
      wDepth = (review.comment && review.comment.trim().length > 0) ? 1.2 : 0;
    }

    bonus += baseScore + sentimentScore * wDepth;
  }

  const returnScore = Math.min(Math.round(preScore + bonus), 98);
  const improvement = returnScore - preScore;

  // 归途状态标签
  let returnTags = [];
  if (returnScore >= 90) {
    returnTags = ['通透', '丰盈', '被治愈'];
  } else if (returnScore >= 80) {
    returnTags = ['释然', '轻盈', '满足'];
  } else {
    returnTags = ['舒展', '平静', '有收获'];
  }

  // 统计数据
  const checkinCount = checkins.length;
  const reviewCount = reviews.length;
  const positiveCount = reviews.filter(r => r.recommend).length;

  return {
    return_score: returnScore,
    improvement,
    return_tags: returnTags,
    checkin_count: checkinCount,
    review_count: reviewCount,
    positive_count: positiveCount
  };
}

/**
 * 根据出发前心灵指数获取状态标签
 */
function getPreTags(score) {
  if (score <= 61) return ['疲惫', '期待改变'];
  if (score <= 69) return ['迷茫', '渴望出发'];
  return ['平静', '蓄势待发'];
}

module.exports = { calcReturnScore, getPreTags };
