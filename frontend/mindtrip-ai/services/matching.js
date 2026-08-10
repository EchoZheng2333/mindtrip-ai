// 心旅 AI — 人格匹配算法
const profiles = require('../data/profiles');

/**
 * 根据 8 道题的答题结果，匹配最佳人格画像
 * 
 * 算法：
 * 1. 累加每个选项的维度分�� → 用户四维总分
 * 2. 遍历 6 个人格画像
 * 3. 对每个人格，计算匹配度 = Σ min(用户维度分, 人格维度分)
 * 4. 取匹配度最高的人格
 * 
 * @param {Array} answers - [{question_id: 1, option_index: 3}, ...]
 * @param {Array} questions - 题库
 * @returns {Object} { profile, dim_scores, soul_score, pre_tags, quiz_tags }
 */
function matchPersonality(answers, questions) {
  // 1. 累加维度分数
  const dimScores = { 审美: 0, 情绪: 0, 社交: 0, 节奏: 0 };
  const tags = [];

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.question_id);
    if (!question) continue;

    const option = question.options[answer.option_index];
    if (!option) continue;

    // 累加维度分
    for (const [dim, score] of Object.entries(option.dims)) {
      dimScores[dim] = (dimScores[dim] || 0) + score;
    }

    // 收集标签
    if (option.tag) {
      tags.push(option.tag);
    }
  }

  // 2. 计算与每个人格的匹配度
  let bestProfile = null;
  let bestScore = -1;

  for (const profile of profiles) {
    let matchScore = 0;
    for (const dim of Object.keys(dimScores)) {
      matchScore += Math.min(dimScores[dim] || 0, profile.dims[dim] || 0);
    }
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestProfile = profile;
    }
  }

  // 3. 计算出发前心灵指数
  const totalDims = Object.values(dimScores).reduce((a, b) => a + b, 0);
  const soulScore = Math.min(55 + totalDims * 2, 85);

  // 4. 出发前状态标签
  let preTags = [];
  if (soulScore <= 61) {
    preTags = ['疲惫', '期待改变'];
  } else if (soulScore <= 69) {
    preTags = ['迷茫', '渴望出发'];
  } else {
    preTags = ['平静', '蓄势待发'];
  }

  return {
    profile: bestProfile,
    dim_scores: dimScores,
    soul_score: soulScore,
    pre_tags: preTags,
    quiz_tags: [...new Set(tags)] // 去重
  };
}

module.exports = { matchPersonality };
