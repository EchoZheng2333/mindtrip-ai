import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MerchantDashboard({ onNavigate }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const dropRef = useRef(null)

  // 模拟商户数据生成
  const mockMerchantData = {
    name: '隐世柴窑工作室',
    tags: ['#侘寂柴烧', '#深巷秘境', '#慢时光', '#手作温度'],
    aesthetics: '侘寂极简 78% · 中式传统 55% · 波西米亚 30%',
    diagnosis: `调性诊断：
    你的器物承载着宋代美学的基因，在当代都市生活中，
    它们是通往内心宁静的渡口。建议强化"深巷秘境"的
    叙事感，用小红书风格的"寻宝攻略"吸引城市探险家。`,
    crowd: '低密度·高粘性',
    suggestion: '建议开启"预约制"，提升客单价与体验深度',
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    setProcessing(true)
    // 模拟上传处理
    setTimeout(() => {
      setProcessing(false)
      setUploaded(true)
      setResult(mockMerchantData)
    }, 2500)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  return (
    <div className="min-h-screen p-8">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('chamber')} className="text-xs text-[var(--color-retro-ink)] opacity-50 hover:opacity-100 transition-opacity">
            ← 返回测评舱
          </button>
          <span className="text-xs text-[var(--color-retro-ink)] opacity-20">|</span>
          <h1 className="text-lg font-serif font-bold text-[var(--color-text-dark)]">
            🏺 匠人工作台
          </h1>
        </div>
        <div className="text-[10px] text-[var(--color-retro-ink)] opacity-40">
          B端平权后台 · v1.0
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!uploaded && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-dark)] mb-2">
                无痛一键入驻
              </h2>
              <p className="text-sm text-[var(--color-retro-ink)] opacity-60 mb-8">
                只需上传 5 张店铺/器物照片，AI 自动生成你的专属调性诊断书
              </p>

              {/* 拖拽上传区 */}
              <motion.div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`dropzone max-w-xl mx-auto ${dragOver ? 'drag-over' : ''} ${processing ? 'pointer-events-none' : ''}`}
                animate={processing ? { scale: [1, 1.02, 1] } : {}}
                transition={processing ? { duration: 1.5, repeat: Infinity } : {}}
              >
                {processing ? (
                  <div className="py-8">
                    {/* 窑炉烧制动效 */}
                    <motion.div
                      className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                      animate={{
                        background: [
                          'rgba(230, 57, 70, 0.1)',
                          'rgba(230, 57, 70, 0.3)',
                          'rgba(230, 57, 70, 0.1)',
                        ],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-4xl">🔥</span>
                    </motion.div>
                    <p className="text-lg font-semibold text-[var(--color-retro-ink)]">窑炉正在烧制...</p>
                    <p className="text-sm text-[var(--color-retro-ink)] opacity-50 mt-1">AI 正在分析你的美学基因</p>
                    {/* 火焰进度条 */}
                    <div className="max-w-xs mx-auto mt-4 h-2 rounded-full bg-[var(--color-bg-wabi)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #E63946, #FF6B7A)' }}
                        animate={{ width: ['0%', '100%'] }}
                        transition={{ duration: 2.5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-6xl mb-4 opacity-40">📸</div>
                    <p className="text-lg font-semibold text-[var(--color-retro-ink)]">
                      {dragOver ? '松手即可上传' : '将照片拖拽至此处'}
                    </p>
                    <p className="text-sm text-[var(--color-retro-ink)] opacity-50 mt-1">
                      或点击此区域选择文件
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[var(--color-retro-ink)] opacity-40">
                      <span>📷 至少 5 张</span>
                      <span>📐 JPG/PNG</span>
                      <span>📦 单张 ≤ 10MB</span>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-2 gap-6">
                {/* 左栏：智能标签 */}
                <div className="glass-card p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🏷️</span>
                      <h3 className="text-lg font-serif font-bold text-[var(--color-text-dark)]">
                        {result.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--color-retro-ink)] opacity-60 mb-4">系统已自动为您打标</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {result.tags.map(tag => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + Math.random() * 0.5 }}
                          className="px-4 py-2 rounded-full text-sm font-medium"
                          style={{
                            background: 'rgba(44, 58, 46, 0.08)',
                            color: 'var(--color-retro-ink)',
                          }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                    <div className="bg-[var(--color-bg-wabi)] rounded-2xl p-4">
                      <p className="text-xs font-semibold text-[var(--color-retro-ink)] mb-2">📊 美学分析</p>
                      <p className="text-sm text-[var(--color-text-dark)]">{result.aesthetics}</p>
                    </div>
                    <div className="mt-3 bg-[var(--color-bg-wabi)] rounded-2xl p-4">
                      <p className="text-xs font-semibold text-[var(--color-retro-ink)] mb-2">👥 客流建议</p>
                      <p className="text-sm text-[var(--color-text-dark)]">{result.crowd}</p>
                      <p className="text-sm text-[var(--color-text-dark)] mt-1">{result.suggestion}</p>
                    </div>
                  </motion.div>
                </div>

                {/* 右栏：AI诊断书海报 */}
                <div className="glass-card p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-serif font-bold text-[var(--color-text-dark)]">
                        📋 AI 调性诊断书
                      </h3>
                      <span className="text-[10px] text-[var(--color-retro-ink)] opacity-40">点击右键保存</span>
                    </div>

                    {/* 海报预览 */}
                    <div className="bg-[var(--color-bg-wabi)] rounded-2xl p-6 mb-4 border border-[var(--color-bg-wabi)]">
                      <div className="text-center mb-4">
                        <div className="text-3xl mb-2">🏺</div>
                        <h4 className="text-xl font-serif font-bold text-[var(--color-text-dark)]">{result.name}</h4>
                        <div className="w-12 h-0.5 bg-[var(--color-cute-pop)] mx-auto my-3" />
                      </div>
                      <div className="space-y-2 text-sm text-[var(--color-text-dark)] leading-relaxed whitespace-pre-line font-serif">
                        {result.diagnosis}
                      </div>
                      <div className="mt-4 pt-4 border-t border-[var(--color-bg-wabi)]">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-[var(--color-retro-ink)] opacity-50">
                            心旅 AI · 2026
                          </div>
                          {/* 模拟二维码 */}
                          <div className="w-12 h-12 bg-white rounded-lg border border-[var(--color-bg-wabi)] flex items-center justify-center">
                            <span className="text-[8px] text-[var(--color-retro-ink)] opacity-50">QR</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-[var(--color-retro-ink)] opacity-50 mb-3">
                        一键保存为图片，分享至朋友圈 / 小红书
                      </p>
                      <button className="btn-secondary text-sm px-6 py-2">
                        💾 保存海报
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* 重新上传 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-6"
              >
                <button
                  className="text-xs text-[var(--color-retro-ink)] opacity-50 hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setUploaded(false)
                    setResult(null)
                  }}
                >
                  🔄 重新上传
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}