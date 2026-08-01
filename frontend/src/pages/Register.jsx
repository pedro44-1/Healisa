import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { register } from '../api'
import { useAuth } from '../context/AuthContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

const GENDERS = [
  { value: 'male', label: 'Male', icon: '♂' },
  { value: 'female', label: 'Female', icon: '♀' },
  { value: 'other', label: 'Other', icon: '⚥' },
]

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await register({
        name,
        email,
        password,
        gender: gender || null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseInt(height) : null,
      })
      loginUser(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-8"
      style={{ background: 'linear-gradient(160deg, #e8eeff 0%, #f5f0ff 40%, #fff5f7 100%)' }}
    >
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
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)',
              boxShadow: '0 8px 24px rgba(79,110,247,0.35)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" fill="rgba(255,255,255,0.25)" />
              <path d="M16 8c1.5 0 3 .5 4 1.5l1 1-1 1c-1 1-1.5 2.5-1.5 4 0 1.5.5 3 1.5 4l1 1-1 1c-1 1-2.5 1.5-4 1.5-1.5 0-3-.5-4-1.5l-1-1 1-1c1-1 1.5-2.5 1.5-4 0-1.5-.5-3-1.5-4l-1-1 1-1c1-1 2.5-1.5 4-1.5z" fill="white" opacity="0.9" />
              <circle cx="16" cy="16" r="3" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Healisa
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-3)' }}>
            Your healing journey starts here
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-7"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 8px 32px rgba(79,110,247,0.08), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-3)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Your name"
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  background: focusedField === 'name' ? '#fff' : '#f8faff',
                  border: `2px solid ${focusedField === 'name' ? '#4f6ef7' : '#e2e8f0'}`,
                  outline: 'none', color: 'var(--color-text)',
                  boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(79,110,247,0.1)' : 'none',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-3)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  background: focusedField === 'email' ? '#fff' : '#f8faff',
                  border: `2px solid ${focusedField === 'email' ? '#4f6ef7' : '#e2e8f0'}`,
                  outline: 'none', color: 'var(--color-text)',
                  boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(79,110,247,0.1)' : 'none',
                }}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-3)' }}>
                Gender (optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(gender === g.value ? '' : g.value)}
                    className="py-2.5 rounded-xl text-sm font-medium flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200"
                    style={{
                      background: gender === g.value ? '#e8eeff' : '#f8faff',
                      border: `2px solid ${gender === g.value ? '#4f6ef7' : '#e2e8f0'}`,
                      color: gender === g.value ? '#4f6ef7' : 'var(--color-text-2)',
                    }}
                  >
                    <span className="text-base">{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight + Height */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-3)' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onFocus={() => setFocusedField('weight')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="70"
                  min="30" max="300"
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: focusedField === 'weight' ? '#fff' : '#f8faff',
                    border: `2px solid ${focusedField === 'weight' ? '#4f6ef7' : '#e2e8f0'}`,
                    outline: 'none', color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-3)' }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  onFocus={() => setFocusedField('height')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="170"
                  min="100" max="250"
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: focusedField === 'height' ? '#fff' : '#f8faff',
                    border: `2px solid ${focusedField === 'height' ? '#4f6ef7' : '#e2e8f0'}`,
                    outline: 'none', color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-3)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  background: focusedField === 'password' ? '#fff' : '#f8faff',
                  border: `2px solid ${focusedField === 'password' ? '#4f6ef7' : '#e2e8f0'}`,
                  outline: 'none', color: 'var(--color-text)',
                  boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(79,110,247,0.1)' : 'none',
                }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white cursor-pointer mt-2"
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
                  Creating account…
                </span>
              ) : 'Start My Journey'}
            </motion.button>
          </form>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-sm mt-5" style={{ color: 'var(--color-text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
