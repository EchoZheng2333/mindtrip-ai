// 心旅 AI — DeepSeek LLM 服务
// 动态生成诗意推荐文案与归途总结
// 无 API Key 时自动降级为硬编码文案

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';
const TIMEOUT_MS = 12000;

/**
 * 检查 LLM 是否可用
 */
function isAvailable() {
  return DEEPSEEK_API_KEY.length > 0;
}

/**
 * 调用 DeepSeek API
 */
async function callLLM(systemPrompt, userPrompt, maxTokens = 500) {
  if (!isAvailable()) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.85,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('DeepSeek API timeout');
    } else {
      console.error('DeepSeek API call failed:', err.message);
    }
    return null;
  }
}

/**
 * 批量生成场景"为什么适合你"文案
 * 一次调用为所有场景生成个性化推荐理由
 *
 * @param {Object} profile - 用户人格画像
 * @param {Array} scenes - 场景列表（含 name, poetic_desc, type）
 * @returns {Object|null} { scene_id: why_fit_text, ... } 或 null（降级）
 */
async function generateWhyFitBatch(profile, scenes) {
  if (!isAvailable()) return null;

  const sceneList = scenes.map((s, i) => `${i + 1}. ${s.name}（${s.type}）：${s.poetic_desc}`).join('\n');

  const systemPrompt = `你是"心旅AI"的文案引擎，擅长用诗意、人文的语言撰写旅行推荐文案。你的文字风格：含蓄、温暖、有画面感，像一首短诗而非广告语。每段文案不超过60字，使用第二人称"你"。`;

  const userPrompt = `用户的人格画像是"${profile.name}"：${profile.poetic_desc}
用户的审美偏好：${profile.preference}
四维倾向：审美${profile.dim_scores?.审美 || 0} 情绪${profile.dim_scores?.情绪 || 0} 社交${profile.dim_scores?.社交 || 0} 节奏${profile.dim_scores?.节奏 || 0}

请为以下每个场景生成一段"为什么适合你"的推荐文案，解释该场景如何与用户的心灵频率共振：

${sceneList}

请严格按以下 JSON 格式返回（不要加 markdown 代码块标记，直接返回纯 JSON）：
{"场景1名称": "文案内容", "场景2名称": "文案内容", ...}`;

  const result = await callLLM(systemPrompt, userPrompt, 800);
  if (!result) return null;

  try {
    // 尝试提取 JSON（LLM 可能会加一些额外文字）
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // 映射 scene_id → why_fit
    const mapped = {};
    for (const scene of scenes) {
      if (parsed[scene.name]) {
        mapped[scene.id] = parsed[scene.name];
      }
    }

    // 确保所有场景都有文案
    if (Object.keys(mapped).length === 0) return null;
    return mapped;
  } catch (e) {
    console.error('Failed to parse LLM why_fit response:', e.message);
    return null;
  }
}

/**
 * 生成归途诗意总结
 *
 * @param {Object} data - { profileName, preScore, returnScore, improvement, returnTags, checkinCount, reviewCount }
 * @returns {string|null} 诗意总结文本，或 null（降级）
 */
async function generateReturnPoem(data) {
  if (!isAvailable()) return null;

  const systemPrompt = `你是"心旅AI"的文案引擎，擅长用诗意、温暖的语言总结旅行对心灵的改变。风格：像写给朋友的一封信的结尾，真诚而不矫情。80字以内。`;

  const userPrompt = `请为以下旅行数据生成一段归途诗意总结：

人格：${data.profileName}
出发前心灵指数：${data.preScore}
归途后心灵指数：${data.returnScore}
提升了${data.improvement}分
归途状态：${data.returnTags.join('、')}
打卡了${data.checkinCount}个场景，留下了${data.reviewCount}条感受

请直接返回总结文案，不要加引号或其他标记。`;

  const result = await callLLM(systemPrompt, userPrompt, 200);
  return result;
}

module.exports = { isAvailable, generateWhyFitBatch, generateReturnPoem };
