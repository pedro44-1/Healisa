import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getWorkouts, logWorkout } from '../api'

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

function IntensityBar({ value }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <div
          key={n}
          className="h-1.5 rounded-full flex-1 transition-colors duration-300"
          style={{
            background: n <= value
              ? n <= 3 ? '#34d399'
                : n <= 6 ? '#fbbf24'
                : '#f87171'
              : '#e2e8f0',
          }}
        />
      ))}
    </div>
  )
}

function WorkoutItem({ w, index }) {
  const intensityColor = w.intensity <= 3 ? '#34d399' : w.intensity <= 6 ? '#fbbf24' : '#f87171'
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex items-start gap-3 px-4 py-4"
      style={{
        borderBottom: '1px solid rgba(226,232,240,0.5)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #e8eeff, #f0f0ff)' }}
      >
        🏋️
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {w.exercise_name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
              {w.duration_minutes} min ·{' '}
              {new Date(w.logged_at).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div
              className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
              style={{ background: `${intensityColor}20`, color: intensityColor }}
            >
              {w.intensity}/10
            </div>
            {w.calories_burned > 0 && (
              <p className="text-[10px] font-semibold" style={{ color: '#f97316' }}>
                {w.calories_burned} kcal
              </p>
            )}
          </div>
        </div>
        <div className="mt-2">
          <IntensityBar value={w.intensity} />
        </div>
        {w.notes && (
          <p className="text-xs mt-2 italic" style={{ color: 'var(--color-text-3)' }}>
            "{w.notes}"
          </p>
        )}
      </div>
    </motion.div>
  )
}

const EXERCISE_SUGGESTIONS = ['Walking', 'Stretching', 'Swimming', 'Yoga', 'Cycling', 'Light strength', 'Foam rolling']

export default function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  // Form
  const [exercise, setExercise] = useState('')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [notes, setNotes] = useState('')

  const fetchWorkouts = () => {
    setLoading(true)
    getWorkouts()
      .then((res) => setWorkouts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchWorkouts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!exercise.trim() || !duration) return
    setSubmitting(true)
    try {
      const res = await logWorkout({
        exercise_name: exercise.trim(),
        duration_minutes: parseInt(duration),
        intensity,
        notes: notes.trim() || null,
      })
      setWorkouts((prev) => [res.data, ...prev])
      setShowForm(false)
      setExercise('')
      setDuration('')
      setIntensity(5)
      setNotes('')
      showToast('Workout logged! 🏋️')
    } catch {
      showToast('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const intensityLabel = intensity <= 3 ? 'Easy' : intensity <= 6 ? 'Moderate' : 'Intense'

  return (
    <div className="px-5 pt-8 pb-4">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 z-50 px-5 py-3 rounded-full text-sm font-semibold text-white"
            style={{
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #1a1f36, #2d3555)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Workouts
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
            {workouts.length} logged
          </p>
        </div>
        <motion.button
          onClick={() => setShowForm((v) => !v)}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
          style={{
            background: showForm
              ? '#e2e8f0'
              : 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)',
            boxShadow: showForm ? 'none' : '0 4px 12px rgba(79,110,247,0.3)',
            color: showForm ? 'var(--color-text)' : '#fff',
            transition: 'all 0.2s',
          }}
        >
          {showForm ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Log Workout
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Log Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '2px solid rgba(79,110,247,0.2)',
                boxShadow: '0 4px 20px rgba(79,110,247,0.08)',
              }}
            >
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Log a Workout
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Exercise */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-3)' }}>
                    Exercise
                  </label>
                  <input
                    type="text"
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    onFocus={() => setFocusedField('exercise')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. Stretching, Walking, Swimming"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: focusedField === 'exercise' ? '#fff' : '#f8faff',
                      border: `2px solid ${focusedField === 'exercise' ? '#4f6ef7' : '#e2e8f0'}`,
                      outline: 'none',
                      color: 'var(--color-text)',
                      boxShadow: focusedField === 'exercise' ? '0 0 0 3px rgba(79,110,247,0.1)' : 'none',
                    }}
                  />
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {EXERCISE_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setExercise(s)}
                        className="text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                        style={{
                          background: exercise === s ? '#e8eeff' : '#f3f4f6',
                          color: exercise === s ? '#4f6ef7' : '#6b7280',
                          border: exercise === s ? '1px solid #c7d2fe' : '1px solid transparent',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-3)' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    onFocus={() => setFocusedField('duration')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="30"
                    min="1" max="480"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: focusedField === 'duration' ? '#fff' : '#f8faff',
                      border: `2px solid ${focusedField === 'duration' ? '#4f6ef7' : '#e2e8f0'}`,
                      outline: 'none',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                {/* Intensity */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
                      Intensity
                    </label>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold px-2 py-0.5 rounded-lg"
                        style={{
                          background: intensity <= 3 ? '#d1fae5' : intensity <= 6 ? '#fef3c7' : '#fee2e2',
                          color: intensity <= 3 ? '#059669' : intensity <= 6 ? '#d97706' : '#dc2626',
                        }}
                      >
                        {intensity}/10 — {intensityLabel}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1" max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full"
                    style={{ accentColor: '#4f6ef7' }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px]" style={{ color: '#34d399' }}>Easy</span>
                    <span className="text-[10px]" style={{ color: '#fbbf24' }}>Moderate</span>
                    <span className="text-[10px]" style={{ color: '#f87171' }}>Intense</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-3)' }}>
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did it feel? Any discomfort?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                    style={{ background: '#f8faff', border: '2px solid #e2e8f0', outline: 'none', color: 'var(--color-text)', fontFamily: 'inherit' }}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)',
                    boxShadow: '0 4px 14px rgba(79,110,247,0.35)',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Saving…' : 'Save Workout'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2" style={{ borderColor: '#e2e8f0', borderTopColor: '#4f6ef7', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : workouts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <p className="text-5xl mb-3">🌱</p>
          <p className="text-base font-semibold" style={{ color: 'var(--color-text-2)' }}>
            No workouts yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-3)' }}>
            Tap "Log Workout" above to get started
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        >
          <AnimatePresence>
            {workouts.map((w, i) => (
              <WorkoutItem key={w.id} w={w} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
