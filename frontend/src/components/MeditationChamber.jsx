import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 扑克牌花色符号
const SUITS = ['♠', '♥', '♦', '♣']
const ARCHETYPE_LABELS = {
  explorer: '探险家', creator: '创造者', sage: '智者',
  hero: '英雄', outlaw: '叛逆者', magician: '魔法师',
  lover: ' lover', jester: '小丑', everyman: '普通人',
  caregiver: '照顾者', ruler: '统治者', innocent: '天真者',
}

// 测评题目数据 — 模拟美学偏好选择
const QUESTIONS = [
  {
    id: 0, title: '你被哪类空间吸引？',
    options: [
      { value: 'wabi_sabi', label: '粗粝陶土墙', emoji: '🏺', desc: '自然肌理、岁月痕迹' },
      { value: 'eccentric_cute', label: '波普色彩装置', emoji: '🎨', desc: '大胆撞色、戏谑造型' },
      { value: 'modern_design', label: '极简玻璃盒子', emoji: '🪟', desc: '通透线条、光影几何' },
      { value: 'traditional_chinese', label: '青花瓷庭院', emoji: '🏯', desc: '东方禅意、文人雅趣' },
    ],
  },
  {
    id: 1, title: '你更偏爱哪种器物触感？',
    options: [
      { value: 'wabi_sabi', label: '手捏粗陶', emoji: '🪨', desc: '泥土的温润与拙朴' },
      { value: 'eccentric_cute', label: '搪胶公仔', emoji: '🧸', desc: '光滑可爱的现代材质' },
      { value: 'modern_design', label: '磨砂玻璃', emoji: '🥃', desc: '冷冽精致的工业感' },
      { value: 'bohemian', label: '植物染编织', emoji: '🧶', desc: '柔软自然的纤维触感' },
    ],
  },
  {
    id: 2, title: '你理想的旅行节奏是？',
    options: [
      { value: 'slow', label: '深巷漫游', emoji: '🚶', desc: '一整天只逛一条弄堂' },
      { value: 'balanced', label: '张弛有度', emoji: '⚖️', desc: '半天探索，半天放空' },
      { value: 'fast', label: '城市猎人', emoji: '🏃', desc: '一天打卡十个据点' },
      { value: 'flexible', label: '随遇而安', emoji: '🍃', desc: '不设计划，跟着感觉走' },
    ],
  },
]

function SliderInput({ label, value, onChange, leftLabel, rightLabel }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-[var(--color-retro-ink)]">{label}</span>
        <span className="text-xs font-mono text-[var(--color-text-dark)] opacity-60">{value.toFixed(2)}</span>
      </div>
      <input type="range" min="0" max="1" step="0.01" value={value} onChange={onChange} className="slider-input" />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-[var(--color-text-dark)] opacity-40 mt-0.5">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  )
}

export default function MeditationChamber({
  emotion, bigFive, archetypes, loading,
  onEmotionChange, onBigFiveChange, onArchetypeChange,
  onSubmit, onNavigate,
}) {
  const [quizStep, setQuizStep] = useState(0) // 0: intro, 1-3: questions, 4: tuning
  const [questionIdx, setQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})

  const handleSelectAnswer = (questionId, value) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: value }))
    // 自动进入下一题
    setTimeout(() => {
      if (questionIdx < QUESTIONS.length - 1) {
        setQuestionIdx(prev => prev + 1)
      } else {
        setQuizStep(4) // 进入调参阶段
      }
    }, 400)
  }

  // 扑克牌花色进度
  const totalSteps = 12
  const currentStep = quizStep === 0 ? 0 : quizStep <= 3 ? questionIdx + 1 : 12

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* 顶部导航 — 当前页面标识 */}
      <div className="fixed top-6 left-6 z-20 flex items-center gap-4">
        <button onClick={() => onNavigate('dashboard')} className="text-xs text-[var(--color-retro-ink)] opacity-50 hover:opacity-100 transition-opacity">
          ⚙️ B端工作台
        </button>
      </div>

      {/* 扑克牌花色进度条 */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            className={`suit-dot ${i < currentStep ? 'active' : 'inactive'}`}
            animate={i < currentStep ? { rotateY: 180 } : { rotateY: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            {i < currentStep ? SUITS[i % 4] : '♤'}
          </motion.div>
        ))}
      </div>

      {/* 主内容区 */}
      <AnimatePresence mode="wait">
        {quizStep === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card max-w-lg w-full p-12 text-center animate-breathe"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🧘
            </motion.div>
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text-dark)] mb-4">
              灵魂美学测评舱
            </h1>
            <p className="text-[var(--color-retro-ink)] opacity-70 mb-8 leading-relaxed">
              关闭外界喧嚣，让直觉带你穿越三组选择。<br />
              这不是问卷，而是一场与自我的对话。
            </p>
            <button
              className="btn-primary px-12"
              onClick={() => setQuizStep(1)}
            >
              开始测评
            </button>
          </motion.div>
        )}

        {quizStep >= 1 && quizStep <= 3 && (
          <motion.div
            key={`q-${questionIdx}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl"
          >
            <div className="glass-card p-8 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-[var(--color-cute-pop)] font-semibold">
                  0{questionIdx + 1} / 0{QUESTIONS.length}
                </span>
                <span className="text-xs text-[var(--color-retro-ink)] opacity-40">
                  {QUESTIONS[questionIdx].title}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-dark)] mb-6">
                {QUESTIONS[questionIdx].title}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {QUESTIONS[questionIdx].options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectAnswer(questionIdx, opt.value)}
                    className={`p-0 rounded-2xl border-2 overflow-hidden transition-all duration-300 relative
                      ${selectedAnswers[questionIdx] === opt.value
                        ? 'border-[var(--color-cute-pop)] shadow-lg'
                        : 'border-transparent hover:border-[var(--color-retro-ink)]/20'
                      }`}
                  >
                    {/* 实拍图占位 — 材质感光影背景 */}
                    <div className="h-28 bg-gradient-to-br from-[var(--color-bg-wabi)] to-[var(--color-bg-wabi)]/70 flex items-center justify-center relative overflow-hidden">
                      <span className="text-4xl opacity-30">{opt.emoji}</span>
                      {/* 扑克牌暗纹水印 — 悬停浮现 */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center text-5xl text-[var(--color-cute-pop)]/10 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {['♠', '♥', '♦', '♣'][questionIdx % 4]}
                      </motion.div>
                      {/* 悬停色彩涟漪 */}
                      <motion.div
                        className="absolute inset-0"
                        initial={{ boxShadow: 'inset 0 0 0px rgba(230,57,70,0)' }}
                        whileHover={{ boxShadow: 'inset 0 0 40px rgba(230,57,70,0.12)' }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <div className="p-3 text-left">
                      <span className="font-semibold text-sm text-[var(--color-text-dark)]">{opt.label}</span>
                      <span className="text-xs text-[var(--color-retro-ink)] opacity-60 block mt-0.5">{opt.desc}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {quizStep === 4 && (
          <motion.div
            key="tuning"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl"
          >
            <div className="glass-card p-8 mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="text-center mb-6"
              >
                <span className="text-4xl">🎯</span>
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text-dark)] mt-2">
                  微调你的心灵频率
                </h2>
                <p className="text-sm text-[var(--color-retro-ink)] opacity-60 mt-1">
                  根据你的选择，我们已初步了解你的偏好。再微调几下，让路径更精准。
                </p>
              </motion.div>

              {/* 情绪状态 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--color-retro-ink)] mb-3">🌿 当前情绪状态</h3>
                <SliderInput label="能量水平" value={emotion.energy} leftLabel="枯竭" rightLabel="充盈"
                  onChange={e => onEmotionChange(prev => ({ ...prev, energy: parseFloat(e.target.value) }))} />
                <SliderInput label="行动节奏" value={emotion.pace} leftLabel="慢" rightLabel="快"
                  onChange={e => onEmotionChange(prev => ({ ...prev, pace: parseFloat(e.target.value) }))} />
              </div>

              {/* 大五人格 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--color-retro-ink)] mb-3">📊 大五人格简版</h3>
                <div className="grid grid-cols-2 gap-x-6">
                  {[
                    ['O', '开放性'], ['C', '尽责性'], ['E', '外倾性'], ['A', '宜人性'], ['N', '神经质'],
                  ].map(([key, label]) => (
                    <SliderInput key={key} label={label} value={bigFive[key]}
                      onChange={e => onBigFiveChange(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))} />
                  ))}
                </div>
              </div>

              {/* 荣格原型 */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[var(--color-retro-ink)] mb-3">🏛️ 荣格原型</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {Object.entries(ARCHETYPE_LABELS).map(([key, label]) => (
                    <SliderInput key={key} label={label} value={archetypes[key]}
                      onChange={e => onArchetypeChange(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))} />
                  ))}
                </div>
              </div>

              <button className="btn-primary w-full" onClick={onSubmit} disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    窑炉正在烧制...
                  </span>
                ) : '🔥 开启心流之旅'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}