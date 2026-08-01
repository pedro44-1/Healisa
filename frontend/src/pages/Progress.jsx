import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getProgress } from '../api'

const fadeUp = (i = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
})

function StreakCard({ streak }) {
  const cfg = streak >= 10
    ? { emoji: '🏆', label: 'On Fire', bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', desc: "You're building serious habits." }
    : streak >= 5
    ? { emoji: '🔥', label: 'Strong', bg: 'linear-gradient(135deg, #f97316, #ea580c)', desc: 'Keep building that base.' }
    : streak >= 2
    ? { emoji: '⚡', label: 'Growing', bg: 'linear-gradient(135deg, #4f6ef7, #6b8cff)', desc: 'Consistency is taking shape.' }
    : streak >= 1
    ? { emoji: '🌱', label: 'Started', bg: 'linear-gradient(135deg, #34d399, #10b981)', desc: 'The hardest part is behind you.' }
    : { emoji: '🌿', label: 'Ready', bg: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', desc: 'Your journey starts today.', fg: '#475569' }
  return (
    <motion.div
      variants={fadeUp(0)}
      className="rounded-2xl p-5"
      style={{ background: cfg.bg, boxShadow: streak >= 1 ? '0 8px 24px rgba(79,110,247,0.2)' : '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center gap-4">
        <span className="text-5xl">{cfg.emoji}</span>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold" style={{ color: cfg.fg || '#fff', lineHeight: 1 }}>{streak}</span>
            <span className="text-base font-semibold" style={{ color: cfg.fg || '#fff', opacity: 0.85 }}>day streak</span>
          </div>
          <p className="text-sm font-medium mt-1" style={{ color: cfg.fg || '#fff', opacity: 0.8 }}>{cfg.desc}</p>
        </div>
      </div>
      {/* Streak dots */}
      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full"
            style={{ background: i < (streak > 7 ? 7 : streak) ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function StatCard({ value, label, color }) {
  return (
    <motion.div
      variants={fadeUp()}
      className="rounded-2xl p-4 flex flex-col items-center text-center"
      style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}
    >
      <span className="text-3xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs font-semibold mt-1" style={{ color: 'var(--color-text-2)' }}>{label}</span>
    </motion.div>
  )
}

function PredictionsPanel({ predictions }) {
  if (!predictions) return null
  return (
    <motion.div variants={fadeUp(1)}>
      <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-3)' }}>
        Your Insights
      </h3>

      {/* Insight card */}
      <div
        className="rounded-2xl p-4 mb-3"
        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(79,110,247,0.15)', backdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-start gap-2 mb-2">
          <span className="text-sm flex-shrink-0 mt-0.5">💡</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
            {predictions.insight}
          </p>
        </div>
      </div>

      {/* Calorie estimates */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[
          { label: 'Avg. per session', value: `${predictions.estimated_calories} kcal`, color: '#f97316' },
          { label: 'If 3x / week', value: `${predictions.weekly_calories} kcal`, color: '#4f6ef7' },
          { label: 'Avg. intensity', value: `${predictions.avg_intensity}/10`, color: '#f76f9a' },
          { label: 'Rest between', value: `${predictions.recovery_days_needed} day${predictions.recovery_days_needed > 1 ? 's' : ''}`, color: '#34d399' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <p className="text-lg font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-text-3)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Milestone */}
      <div
        className="rounded-2xl px-4 py-3 mb-3 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg, #e8eeff, #f0f4ff)', border: '1px solid rgba(79,110,247,0.15)' }}
      >
        <span className="text-base">🎯</span>
        <p className="text-xs font-semibold" style={{ color: '#4f6ef7' }}>{predictions.next_milestone}</p>
      </div>

      {/* Training tip */}
      <div
        className="rounded-2xl px-4 py-3 flex items-start gap-2"
        style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }}
      >
        <span className="text-base flex-shrink-0">🧠</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>{predictions.training_tip}</p>
      </div>
    </motion.div>
  )
}

function IntensityBar({ value }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <div
          key={n}
          className="h-1 flex-1 rounded-full"
          style={{
            background: n <= value
              ? n <= 3 ? '#34d399' : n <= 6 ? '#fbbf24' : '#f87171'
              : '#e2e8f0',
          }}
        />
      ))}
    </div>
  )
}

function WorkoutRow({ w, index }) {
  const calColor = '#f97316'
  return (
    <motion.div
      variants={fadeUp(index + 2)}
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ borderBottom: '1px solid rgba(226,232,240,0.4)' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #e8eeff, #f0f0ff)' }}
      >
        🏋️
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{w.exercise_name}</p>
        <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
          {w.duration_minutes} min · {new Date(w.logged_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
        <IntensityBar value={w.intensity} />
      </div>
      {w.calories_burned > 0 && (
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold" style={{ color: calColor }}>{w.calories_burned}</p>
          <p className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>kcal</p>
        </div>
      )}
    </motion.div>
  )
}

export default function Progress() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProgress()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="w-8 h-8 rounded-full border-2" style={{ borderColor: '#e2e8f0', borderTopColor: '#4f6ef7', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 pb-4">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Your Progress</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
          Real insights from your training data 💙
        </p>
      </motion.div>

      <div className="mt-6 space-y-4">
        {/* Streak hero */}
        <StreakCard streak={stats?.current_streak ?? 0} />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={stats?.workouts_this_week ?? 0} label="This week" color="#4f6ef7" />
          <StatCard value={stats?.workouts_this_month ?? 0} label="This month" color="#f76f9a" />
          <StatCard value={stats?.total_workouts ?? 0} label="All time" color="#34d399" />
        </div>

        {/* Predictions + insights */}
        {stats?.predictions && <PredictionsPanel predictions={stats.predictions} />}

        {/* History */}
        <motion.div variants={fadeUp(1)}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-3)' }}>
            Session History
          </h3>
          {stats?.workouts && stats.workouts.length > 0 ? (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}
            >
              {stats.workouts.map((w, i) => <WorkoutRow key={w.id} w={w} index={i} />)}
            </div>
          ) : (
            <div
              className="rounded-2xl px-6 py-10 text-center"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)' }}
            >
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-3)' }}>No sessions yet. Log your first one!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
