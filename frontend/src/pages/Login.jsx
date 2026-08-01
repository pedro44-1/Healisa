import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login } from '../api'
import { useAuth } from '../context/AuthContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email, password })
      loginUser(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{
        background: 'linear-gradient(160deg, #e8eeff 0%, #f5f0ff 40%, #fff5f7 100%)',
      }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4f6ef7 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #f76f9a 0%, transparent 70%)' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo mark */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)',
              boxShadow: '0 8px 24px rgba(79,110,247,0.35)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" fill="rgba(255,255,255,0.25)" />
              <path d="M16 8c1.5 0 3 .5 4 1.5l1 1-1 1c-1 1-1.5 2.5-1.5 4 0 1.5.5 3 1.5 4l1 1-1 1c-1 1-2.5 1.5-4 1.5-1.5 0-3-.5-4-1.5l-1-1 1-1c1-1 1.5-2.5 1.5-4 0-1.5-.5-3-1.5-4l-1-1 1-1c1-1 2.5-1.5 4-1.5z" fill="white" opacity="0.9" />
              <circle cx="16" cy="16" r="3" fill="white" />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
          >
            Healisa
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-3)' }}>
            Healing starts with a single step
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 8px 32px rgba(79,110,247,0.08), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
            Welcome back
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: focusedField === 'email' ? '#fff' : '#f8faff',
                    border: `2px solid ${focusedField === 'email' ? '#4f6ef7' : '#e2e8f0'}`,
                    color: 'var(--color-text)',
                    outline: 'none',
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(79,110,247,0.12)' : 'none',
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: focusedField === 'password' ? '#fff' : '#f8faff',
                    border: `2px solid ${focusedField === 'password' ? '#4f6ef7' : '#e2e8f0'}`,
                    color: 'var(--color-text)',
                    outline: 'none',
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(79,110,247,0.12)' : 'none',
                  }}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 mt-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)',
                boxShadow: '0 4px 14px rgba(79,110,247,0.35)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>
        </motion.div>

        {/* Register link */}
        <motion.p variants={itemVariants} className="text-center text-sm mt-6" style={{ color: 'var(--color-text-3)' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold transition-colors duration-200"
            style={{ color: 'var(--color-primary)' }}
          >
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
