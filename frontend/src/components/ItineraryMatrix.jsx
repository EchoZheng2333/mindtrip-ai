import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 情绪标签对应颜色（保留）
const EMOTION_COLORS = {
  '枯竭沉寂': 'bg-purple-100 text-purple-700',
  '能量枯竭': 'bg-blue-100 text-blue-700',
  '舒缓平静': 'bg-green-100 text-green-700',
  '亢奋活跃': 'bg-red-100 text-red-700',
  '精力充沛': 'bg-orange-100 text-orange-700',
  '平稳均衡': 'bg-[var(--color-retro-ink)]/10 text-[var(--color-retro-ink)]',
}

// === 左栏：去技术化表达映射 ===
function humanizeParams(params) {
  if (!params) return {}
  const p = params.privacy_weight || 0.5
  const c = params.crowd_threshold || 0.5
  const s = params.stay_duration_min || 45
  return {
    space_preference: p > 0.7 ? '避开喧嚣，优选巷弄秘境' : '动静皆宜，开放探索',
    environment_craving: c < 0.4 ? '渴望安静，仅听自然微音' : '可接受适度热闹',
    pace_advice: p > 0.7 ? `慢步呼吸，静心停留 ${s} 分钟` : '自在漫步，随心停留',
    hidden_gem: params.hidden_gem_bonus > 0 ? '今日有隐藏宝石等待发现 💎' : null,
  }
}

// === 中栏：商户卡片数据 ===
function TimelineCard({ merchant, index, isActive, score, onClick, onNext, onPrev, total, hasNext, hasPrev }) {
  return (
    <motion.div
      layout
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0.6, z: 100, opacity: 0, y: 50 }}
      animate={{
        scale: isActive ? 1 : 0.85,
        z: isActive ? 0 : -60,
        opacity: isActive ? 1 : 0.4,
        y: isActive ? 0 : -10,
        filter: isActive ? 'blur(0px)' : 'blur(2px)',
      }}
      exit={{ scale: 0.8, z: -100, opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 80, damping: 15, mass: 0.8 }}
      onClick={isActive ? onClick : undefined}
      style={{ perspective: 1000, cursor: isActive ? 'pointer' : 'pointer' }}
    >
      <div
        className={`w-full max-w-sm rounded-2xl overflow-hidden transition-all duration-500
          ${isActive
            ? 'bg-white/85 backdrop-blur-md shadow-2xl border border-[var(--color-cute-pop)]/20'
            : 'bg-white/50 backdrop-blur-sm shadow-lg border border-transparent hover:bg-white/70'
          }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 图片占位 */}
        <div className="h-32 bg-gradient-to-br from-[var(--color-bg-wabi)] to-[var(--color-bg-wabi)]/70 flex items-center justify-center relative overflow-hidden">
          <span className="text-4xl opacity-30">🏺</span>
          {/* 扑克牌暗纹水印 — 悬停时浮现 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-6xl text-[var(--color-cute-pop)]/10"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, rotate: 5 }}
            transition={{ duration: 0.4 }}
          >
            {['♠', '♥', '♦', '♣'][index % 4]}
          </motion.div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-[var(--color-text-dark)] text-lg">{merchant.name}</h3>
            <span className="text-xs font-mono text-[var(--color-cute-pop)] bg-[var(--color-cute-pop)]/5 px-2 py-0.5 rounded-full">
              #{index + 1}
            </span>
          </div>
          <p className="text-xs text-[var(--color-retro-ink)] opacity-60 mt-0.5">{merchant.category}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {merchant.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-retro-ink)]/5 text-[var(--color-retro-ink)]">
                {tag}
              </span>
            ))}
          </div>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 text-[10px] text-[var(--color-retro-ink)] opacity-50 italic"
            >
              {index === 0 ? '🌅 起点·从这里开始漫步' :
               index === total - 1 ? '🌇 终点·让心灵在此沉淀' :
               '🚶 赶路·沿小路向深处探索'}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// === 右栏：杂志叙事组件 ===
function MagazineDetail({ merchant, index, total }) {
  if (!merchant) return null

  return (
    <motion.div
      key={merchant.merchant_id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="px-2"
    >
      {/* 21:9 电影画幅大图 */}
      <motion.div
        className="w-full rounded-2xl overflow-hidden mb-8 relative"
        style={{ aspectRatio: '21/9' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-wabi)]/80 to-[var(--color-bg-wabi)]/30 flex items-center justify-center">
          <span className="text-7xl opacity-20">🏺</span>
        </div>
        {/* 视差动效 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-wabi)]/40 to-transparent"
          animate={{ backgroundPosition: ['0% 0%', '0% 5%', '0% 0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* 大字引言 — 衬线字体，字距错落 */}
      <motion.p
        className="font-serif text-2xl leading-relaxed text-[var(--color-text-dark)] mb-6 tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        “这家藏在{merchant.tags?.[0] || '弄堂'}深处的{merchant.name}……”
      </motion.p>

      {/* 散文式正文 — 无卡片，直接悬浮在背景上 */}
      <motion.div
        className="space-y-6 text-sm leading-relaxed text-[var(--color-retro-ink)] opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="font-serif leading-[1.9] tracking-wide">
          在{merchant.name}，时间以另一种速度流淌。{merchant.category}不仅仅是器物，更是匠人用双手与泥土对话的痕迹。
          每一道开片纹路，都是{merchant.tags?.[1] || '岁月'}的印记。
        </p>

        {/* 古怪可爱分割线 */}
        <div className="flex items-center gap-3 py-2">
          <span className="h-px flex-1 bg-[var(--color-cute-pop)]/20" />
          <span className="text-lg" style={{ color: 'var(--color-cute-pop)' }}>♥</span>
          <span className="h-px flex-1 bg-[var(--color-cute-pop)]/20" />
        </div>

        <p className="font-serif leading-[1.9] tracking-wide">
          你来到这里，带着{index === 0 ? '一颗渴望安静的心' : '上一站留下的余温'}。
          {merchant.is_hidden_gem ? '这是一颗隐藏的宝石，只有懂得倾听的人才能找到。' : '这里的氛围与你产生了温暖的共振。'}
        </p>

        <div className="flex items-center gap-3 py-2">
          <span className="h-px flex-1 bg-[var(--color-cute-pop)]/20" />
          <span className="text-lg" style={{ color: 'var(--color-cute-pop)' }}>♥</span>
          <span className="h-px flex-1 bg-[var(--color-cute-pop)]/20" />
        </div>

        <p className="font-serif leading-[1.9] tracking-wide">
          在景德镇的三宝村深处，宋代同温的泥土仍在呼吸。你触摸的不仅是器物，而是一千年的光阴。
        </p>
      </motion.div>

      {/* 历史注脚 — 博物馆标签风格 */}
      <motion.p
        className="mt-8 text-xs italic text-right text-[var(--color-retro-ink)] opacity-40 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        * 跨时空注脚：景德镇柴烧，始于宋真宗年间。
      </motion.p>
    </motion.div>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function ItineraryMatrix({ result, onReset, onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showMagazine, setShowMagazine] = useState(true)
  const [direction, setDirection] = useState(0) // 1: next, -1: prev

  if (!result) return null

  const { emotion_label, routing_parameters, route } = result
  const merchants = route?.merchant_details || []
  const scores = route?.scores_detail || []
  const human = humanizeParams(routing_parameters)
  const activeMerchant = merchants[activeIndex]

  const goNext = useCallback(() => {
    if (activeIndex < merchants.length - 1) {
      setDirection(1)
      setActiveIndex(i => i + 1)
    }
  }, [activeIndex, merchants.length])

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      setDirection(-1)
      setActiveIndex(i => i - 1)
    }
  }, [activeIndex])

  // 3D 转场动画变体
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      scale: 0.7,
    }),
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-wabi)' }}>
      {/* ===== 顶部品牌栏 ===== */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[var(--color-bg-wabi)]/50">
        <div className="flex items-center gap-4">
          <button onClick={onReset} className="text-xs text-[var(--color-retro-ink)] opacity-40 hover:opacity-100 transition-opacity">
            ← 返回
          </button>
          <span className="text-xs text-[var(--color-retro-ink)] opacity-20">|</span>
          <h1 className="text-sm font-serif font-bold text-[var(--color-text-dark)] tracking-wide">
            心旅 AI <span className="opacity-40 font-normal">──</span> 寻回内心的旅行
          </h1>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs text-[var(--color-retro-ink)] opacity-40 hover:opacity-100 transition-opacity"
        >
          ⚙️ B端工作台
        </button>
      </div>

      {/* ===== 三栏内容区 ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===== 左栏 (25%)：灵魂画像面板 ===== */}
        <motion.div
          className="w-[25%] p-6 overflow-y-auto border-r border-[var(--color-bg-wabi)]/50"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 心理状态 */}
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold text-[var(--color-retro-ink)] opacity-40 mb-3 uppercase tracking-[0.2em]">
              心理状态
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${EMOTION_COLORS[emotion_label] || 'bg-gray-100'}`}>
                  {emotion_label}
                </span>
              </div>
              <div className="text-sm text-[var(--color-retro-ink)] leading-relaxed font-serif">
                {human.space_preference}
              </div>
            </div>
          </div>

          {/* 环境渴望 */}
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold text-[var(--color-retro-ink)] opacity-40 mb-3 uppercase tracking-[0.2em]">
              环境渴望
            </h3>
            <p className="text-sm text-[var(--color-retro-ink)] leading-relaxed font-serif">
              {human.environment_craving}
            </p>
          </div>

          {/* 建议节奏 */}
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold text-[var(--color-retro-ink)] opacity-40 mb-3 uppercase tracking-[0.2em]">
              建议节奏
            </h3>
            <p className="text-sm text-[var(--color-retro-ink)] leading-relaxed font-serif">
              {human.pace_advice}
            </p>
          </div>

          {/* 隐藏宝石 */}
          {human.hidden_gem && (
            <motion.div
              className="text-sm text-[var(--color-cute-pop)] leading-relaxed font-serif"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-[10px] font-semibold opacity-40 uppercase tracking-[0.2em] block mb-2" style={{ color: 'var(--color-cute-pop)' }}>
                今日惊喜
              </span>
              {human.hidden_gem}
            </motion.div>
          )}

          {/* 底部装饰 */}
          <div className="mt-8 pt-6 border-t border-[var(--color-bg-wabi)]/50">
            <p className="text-[10px] text-[var(--color-retro-ink)] opacity-30 font-serif italic">
              心旅 AI · 寻回内心的旅行
            </p>
          </div>
        </motion.div>

        {/* ===== 中栏 (40%)：横向曲线时间轴 ===== */}
        <motion.div
          className="w-[40%] p-6 flex flex-col overflow-hidden relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-[10px] font-semibold text-[var(--color-retro-ink)] opacity-40 mb-4 uppercase tracking-[0.2em]">
            心流时间轴
          </h2>

          {/* 3D 卡片舞台 */}
          <div className="flex-1 relative flex items-center justify-center" style={{ perspective: 1200, minHeight: 320 }}>
            <AnimatePresence mode="popLayout" custom={direction}>
              {merchants.map((m, i) => (
                i === activeIndex && (
                  <TimelineCard
                    key={m.merchant_id + '-card'}
                    merchant={m}
                    index={i}
                    isActive={true}
                    score={scores.find(s => s.merchant_id === m.merchant_id)}
                    onClick={() => setShowMagazine(true)}
                    total={merchants.length}
                    hasNext={activeIndex < merchants.length - 1}
                    hasPrev={activeIndex > 0}
                  />
                )
              ))}
            </AnimatePresence>

            {/* 前后卡片预览（缩略） */}
            {activeIndex > 0 && (
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 w-20 h-28 rounded-xl bg-white/40 backdrop-blur-sm border border-[var(--color-bg-wabi)] flex items-center justify-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                onClick={goPrev}
              >
                <span className="text-xs text-[var(--color-retro-ink)] opacity-60">‹</span>
              </div>
            )}
            {activeIndex < merchants.length - 1 && (
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-28 rounded-xl bg-white/40 backdrop-blur-sm border border-[var(--color-bg-wabi)] flex items-center justify-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                onClick={goNext}
              >
                <span className="text-xs text-[var(--color-retro-ink)] opacity-60">›</span>
              </div>
            )}
          </div>

          {/* 横向波浪曲线 */}
          <div className="relative h-12 mt-2 overflow-hidden">
            {/* 复古松烟绿虚线 */}
            <svg className="w-full h-full" viewBox="0 0 400 40" preserveAspectRatio="none">
              <motion.path
                d="M 0,20 Q 50,5 100,20 T 200,20 T 300,20 T 400,20"
                fill="none"
                stroke="var(--color-retro-ink)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.3"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              {/* 当前节点圆点 */}
              <motion.circle
                cx={30 + (activeIndex / Math.max(merchants.length - 1, 1)) * 340}
                cy={20}
                r="5"
                fill="var(--color-cute-pop)"
                initial={false}
                animate={{ cx: 30 + (activeIndex / Math.max(merchants.length - 1, 1)) * 340 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
              {/* 节点圆点 */}
              {merchants.map((_, i) => (
                <circle
                  key={i}
                  cx={30 + (i / Math.max(merchants.length - 1, 1)) * 340}
                  cy={20}
                  r="3"
                  fill={i === activeIndex ? 'var(--color-cute-pop)' : 'var(--color-retro-ink)'}
                  opacity={i === activeIndex ? 1 : 0.2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                />
              ))}
            </svg>
          </div>

          {/* 导航按钮 */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="text-xs text-[var(--color-retro-ink)] opacity-40 hover:opacity-100 disabled:opacity-10 transition-all px-3 py-1 rounded-full border border-[var(--color-retro-ink)]/10"
            >
              ← 上一站
            </button>
            <span className="text-[10px] text-[var(--color-retro-ink)] opacity-30">
              {activeIndex + 1} / {merchants.length}
            </span>
            <button
              onClick={goNext}
              disabled={activeIndex >= merchants.length - 1}
              className="text-xs text-[var(--color-retro-ink)] opacity-40 hover:opacity-100 disabled:opacity-10 transition-all px-3 py-1 rounded-full border border-[var(--color-retro-ink)]/10"
            >
              下一站 →
            </button>
          </div>
        </motion.div>

        {/* ===== 右栏 (35%)：跨时空共鸣视窗 ===== */}
        <motion.div
          className="w-[35%] p-6 overflow-y-auto border-l border-[var(--color-bg-wabi)]/50"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-[10px] font-semibold text-[var(--color-retro-ink)] opacity-40 mb-6 uppercase tracking-[0.2em]">
            跨时空共鸣
          </h2>

          <AnimatePresence mode="wait">
            {showMagazine && activeMerchant ? (
              <MagazineDetail
                key={activeMerchant.merchant_id}
                merchant={activeMerchant}
                index={activeIndex}
                total={merchants.length}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-64 text-[var(--color-retro-ink)] opacity-20"
              >
                <p className="text-sm font-serif italic">点击商户查看叙事</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}