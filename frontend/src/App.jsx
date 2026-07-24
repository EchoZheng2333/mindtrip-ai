import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MeditationChamber from './components/MeditationChamber'
import ItineraryMatrix from './components/ItineraryMatrix'
import MerchantDashboard from './components/MerchantDashboard'

const API_BASE = '/api/v1'

const DEFAULT_EMOTION = { energy: 0.5, pace: 0.5 }
const DEFAULT_BIG_FIVE = { O: 0.5, C: 0.5, E: 0.5, A: 0.5, N: 0.5 }
const DEFAULT_ARCHETYPES = {
  explorer: 0.3, creator: 0.3, sage: 0.3, hero: 0.3,
  outlaw: 0.3, magician: 0.3, lover: 0.3, jester: 0.3,
  everyman: 0.3, caregiver: 0.3, ruler: 0.3, innocent: 0.3,
}

export default function App() {
  const [page, setPage] = useState('chamber') // chamber | matrix | dashboard
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emotion, setEmotion] = useState(DEFAULT_EMOTION)
  const [bigFive, setBigFive] = useState(DEFAULT_BIG_FIVE)
  const [archetypes, setArchetypes] = useState(DEFAULT_ARCHETYPES)
  const [result, setResult] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/plan-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion, big_five: bigFive, archetypes }),
      })
      if (!res.ok) throw new Error(`API Error: ${res.status}`)
      const data = await res.json()
      setResult(data)
      setPage('matrix')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMindPrint = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/generate-mind-print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion, big_five: bigFive, archetypes }),
      })
      if (!res.ok) throw new Error(`API Error: ${res.status}`)
      const data = await res.json()
      if (data.mind_print) {
        data.mind_print = JSON.parse(data.mind_print)
      }
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPage('chamber')
    setResult(null)
    setError(null)
  }

  return (
    <div className="app-container min-h-screen">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 border-red-200"
          >
            <p className="text-cute-pop">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {page === 'chamber' && (
          <MeditationChamber
            key="chamber"
            emotion={emotion}
            bigFive={bigFive}
            archetypes={archetypes}
            loading={loading}
            onEmotionChange={setEmotion}
            onBigFiveChange={setBigFive}
            onArchetypeChange={setArchetypes}
            onSubmit={handleSubmit}
            onNavigate={(p) => setPage(p)}
          />
        )}
        {page === 'matrix' && result && (
          <ItineraryMatrix
            key="matrix"
            result={result}
            onReset={reset}
            onNavigate={(p) => setPage(p)}
          />
        )}
        {page === 'dashboard' && (
          <MerchantDashboard
            key="dashboard"
            onNavigate={(p) => setPage(p)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}