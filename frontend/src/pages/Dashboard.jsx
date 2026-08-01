import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getProgress, updateProfile } from '../api'

const MOTIVATIONAL = [
  "Every small step you take today is a win. Keep going. 💪",
  "Your body is resilient. Trust the process.",
  "Recovery isn't linear — and that's okay. You're doing great.",
  "Movement is medicine. Even 5 minutes counts.",
  "You showed up today. That's already something to be proud of.",
  "Progress, not perfection. You're on the right track.",
  "Some days are hard. Today, you chose to try anyway. That's courage.",
]

function getMessage(workoutsThisWeek, streak) {
  if (streak >= 7) return `🔥 ${streak}-day streak! You're unstoppable!`
  if (streak >= 3) return `⚡ ${streak} days strong! Building something real.`
  if (workoutsThisWeek >= 3) return "Great week! Your consistency is showing. 🌟"
  if (workoutsThisWeek >= 1) return "You've started — that's the hardest part. Keep going! 🌱"
  return MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function StatCard({ value, label, icon, accent = false }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl p-4 flex flex-col items-center gap-1"
      style={{
        background: accent
          ? 'linear-gradient(135deg, rgba(79,110,247,0.08), rgba(107,140,255,0.05))'
          : 'rgba(255,255,255,0.7)',
        border: `1px solid ${accent ? 'rgba(79,110,247,0.15)' : 'rgba(255,255,255,0.6)'}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
      <span
        className="text-2xl font-bold leading-none"
        style={{ color: accent ? 'var(--color-primary)' : 'var(--color-text)' }}
      >
        {value}
      </span>
      <span className="text-xs font-medium" style={{ color: 'var(--color-text-3)' }}>
        {label}
      </span>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, dismissIntro } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(!user?.has_seen_intro)

  useEffect(() => {
    getProgress()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDismissIntro = async () => {
    setShowIntro(false)
    try {
      await updateProfile({ has_seen_intro: true })
      dismissIntro()
    } catch (_) {}
  }

  const firstName = user?.name?.split(' ')[0] || 'there'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="px-5 pt-8 pb-4"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-3)' }}>
          {greeting},
        </p>
        <h1
          className="text-3xl font-bold leading-tight"
          style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
        >
          {firstName} 👋
        </h1>
        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-text-3)' }}>
          {today}
        </p>
      </motion.div>

      {/* Welcome Intro — only for new users */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 overflow-hidden"
          >
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(79,110,247,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">✨</span>
                <div className="flex-1">
                  <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    Welcome to Healisa, {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-2)' }}>
                    This is your space. We track your sessions, follow up on your progress, and help you find
                    the better version of yourself — one step at a time. Big results come from consistent small efforts.
                  </p>
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-2)' }}>
                    How it works:
                  </p>
                  <div className="space-y-2 mb-4">
                    {[
                      { icon: '💬', label: 'Chat with Noah', sub: 'Your safe space to talk, vent, or just check in' },
                      { icon: '📝', label: 'Log workouts', sub: 'Track every session to see your growth over time' },
                      { icon: '📊', label: 'Watch your progress', sub: 'Insights and predictions that adapt to you' },
                    ].map(({ icon, label, sub }) => (
                      <div key={label} className="flex items-center gap-2.5">
                        <span className="text-base flex-shrink-0">{icon}</span>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{label}</p>
                          <p className="text-[11px]" style={{ color: 'var(--color-text-3)' }}>{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <motion.button
                    onClick={handleDismissIntro}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #4f6ef7, #6b8cff)',
                      boxShadow: '0 4px 12px rgba(79,110,247,0.3)',
                    }}
                  >
                    Let's get started
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivation Card */}
      <motion.div variants={fadeUp} className="mb-5">
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, #4f6ef7 0%, #7b9fff 100%)',
            boxShadow: '0 8px 24px rgba(79,110,247,0.3)',
          }}
        >
          <p className="text-sm leading-relaxed text-white font-medium">
            {getMessage(stats?.workouts_this_week ?? 0, stats?.current_streak ?? 0)}
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/chat">
          <motion.div
            whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(79,110,247,0.15)' }}
            whileTap={{ scale: 0.97 }}
            className="rounded-2xl p-5 cursor-pointer transition-shadow"
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(79,110,247,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)', boxShadow: '0 4px 12px rgba(79,110,247,0.3)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Chat with Noah</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>Your safe space to unwind</p>
          </motion.div>
        </Link>

        <Link to="/workouts">
          <motion.div
            whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(247,111,154,0.15)' }}
            whileTap={{ scale: 0.97 }}
            className="rounded-2xl p-5 cursor-pointer transition-shadow"
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(247,111,154,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #f76f9a 0%, #ff9ab5 100%)', boxShadow: '0 4px 12px rgba(247,111,154,0.3)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5L4 4" /><path d="M17.5 6.5L20 4" />
                <path d="M14 4v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4" />
                <rect x="4" y="10" width="16" height="5" rx="2" />
              </svg>
            </div>
            <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Log Workout</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>Track your activity & progress</p>
          </motion.div>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="mb-6">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-2)', letterSpacing: '0.01em' }}>
          THIS WEEK
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={stats?.workouts_this_week ?? 0} label="workouts" icon="🏋️" />
          <StatCard value={stats?.current_streak ?? 0} label="day streak" icon="🔥" accent />
          <StatCard value={stats?.total_workouts ?? 0} label="all time" icon="📊" />
        </div>
      </motion.div>

      {/* Premium badge */}
      {user?.premium && (
        <motion.div
          variants={fadeUp}
          className="mb-6 px-4 py-3 rounded-2xl flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #fefce8, #fffbeb)',
            border: '1px solid #fde68a',
          }}
        >
          <span className="text-lg">✨</span>
          <div>
            <p className="text-xs font-bold" style={{ color: '#92400e' }}>Premium Access</p>
            <p className="text-xs" style={{ color: '#b45309' }}>All features unlocked</p>
          </div>
        </motion.div>
      )}

      {/* Recent Workouts */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-2)', letterSpacing: '0.01em' }}>
            RECENT ACTIVITY
          </h2>
          <Link to="/workouts" className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
            See all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2" style={{ borderColor: '#e2e8f0', borderTopColor: '#4f6ef7', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : stats?.workouts && stats.workouts.length > 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.6)',
            }}
          >
            {stats.workouts.slice(0, 3).map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: i < Math.min(stats.workouts.length, 3) - 1 ? '1px solid rgba(226,232,240,0.6)' : 'none',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #e8eeff, #f0f0ff)' }}
                >
                  🏋️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                    {w.exercise_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                    {w.duration_minutes} min · {new Date(w.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                {/* Intensity dots */}
                <div className="flex gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: n <= Math.round(w.intensity / 2) ? '#4f6ef7' : '#e2e8f0' }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl px-6 py-10 text-center"
            style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)' }}
          >
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-3)' }}>
              No workouts yet. Start with one today!
            </p>
            <Link
              to="/workouts"
              className="inline-block mt-3 text-xs font-semibold px-4 py-2 rounded-lg text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              Log Your First Workout
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
