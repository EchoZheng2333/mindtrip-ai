// app.js — 心旅 AI 主应用（原生 JS）
// 功能：SPA 页面路由 + 状态管理 + API 调用

import { MeditationChamber } from './components/MeditationChamber.jsx'
import { ItineraryMatrix } from './components/ItineraryMatrix.jsx'
import { MerchantDashboard } from './components/MerchantDashboard.jsx'

const API_BASE = '/api/v1'

const DEFAULT_EMOTION = { energy: 0.5, pace: 0.5 }
const DEFAULT_BIG_FIVE = { O: 0.5, C: 0.5, E: 0.5, A: 0.5, N: 0.5 }
const DEFAULT_ARCHETYPES = {
  explorer: 0.3, creator: 0.3, sage: 0.3, hero: 0.3,
  outlaw: 0.3, magician: 0.3, lover: 0.3, jester: 0.3,
  everyman: 0.3, caregiver: 0.3, ruler: 0.3, innocent: 0.3,
}

// ===== 全局应用状态 =====
const state = {
  page: 'chamber', // chamber | matrix | dashboard
  loading: false,
  error: null,
  emotion: { ...DEFAULT_EMOTION },
  bigFive: { ...DEFAULT_BIG_FIVE },
  archetypes: { ...DEFAULT_ARCHETYPES },
  result: null,
}

let currentPage = null // 当前页面销毁函数

// ===== 导航函数（暴露给子组件） =====
window.__appNavigate = navigate

// ===== 路由 =====
function navigate(page) {
  state.page = page
  renderPage()
}

// ===== API 调用 =====
async function handleSubmit() {
  state.loading = true
  state.error = null
  renderPage()

  try {
    const res = await fetch(`${API_BASE}/plan-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emotion: state.emotion,
        big_five: state.bigFive,
        archetypes: state.archetypes,
      }),
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    const data = await res.json()
    state.result = data
    state.page = 'matrix'
  } catch (err) {
    state.error = err.message
  } finally {
    state.loading = false
    renderPage()
  }
}

async function handleGenerateMindPrint() {
  state.loading = true
  state.error = null
  renderPage()

  try {
    const res = await fetch(`${API_BASE}/generate-mind-print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emotion: state.emotion,
        big_five: state.bigFive,
        archetypes: state.archetypes,
      }),
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    const data = await res.json()
    if (data.mind_print) {
      data.mind_print = JSON.parse(data.mind_print)
    }
    state.result = data
  } catch (err) {
    state.error = err.message
  } finally {
    state.loading = false
    renderPage()
  }
}

function reset() {
  state.page = 'chamber'
  state.result = null
  state.error = null
  state.emotion = { ...DEFAULT_EMOTION }
  state.bigFive = { ...DEFAULT_BIG_FIVE }
  state.archetypes = { ...DEFAULT_ARCHETYPES }
  renderPage()
}

// ===== 渲染引擎 =====
function renderPage() {
  const app = document.getElementById('app')
  if (!app) return

  // 销毁当前页面
  if (currentPage && currentPage.destroy) {
    currentPage.destroy()
  }
  currentPage = null

  // 渲染错误提示
  if (state.error) {
    const errDiv = document.createElement('div')
    errDiv.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 border-red-200'
    errDiv.style.border = '1px solid rgba(230,57,70,0.3)'
    errDiv.innerHTML = `<p style="color:var(--color-cute-pop)">${state.error}</p>`
    app.appendChild(errDiv)
    // 3秒后自动消失
    setTimeout(() => errDiv.remove(), 3000)
  }

  // 根据页面路由渲染对应组件
  switch (state.page) {
    case 'chamber':
      currentPage = MeditationChamber(app, {
        emotion: state.emotion,
        bigFive: state.bigFive,
        archetypes: state.archetypes,
        loading: state.loading,
        onEmotionChange: (v) => { state.emotion = v },
        onBigFiveChange: (v) => { state.bigFive = v },
        onArchetypeChange: (v) => { state.archetypes = v },
        onSubmit: handleSubmit,
        onNavigate: navigate,
      })
      break
    case 'matrix':
      if (state.result) {
        currentPage = ItineraryMatrix(app, {
          result: state.result,
          onReset: reset,
          onNavigate: navigate,
        })
      } else {
        navigate('chamber')
      }
      break
    case 'dashboard':
      currentPage = MerchantDashboard(app, {
        onNavigate: navigate,
      })
      break
    default:
      navigate('chamber')
  }
}

// ===== 启动应用 =====
document.addEventListener('DOMContentLoaded', () => {
  renderPage()
})
