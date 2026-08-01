import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Workouts from './pages/Workouts'
import Progress from './pages/Progress'
import Layout from './pages/Layout'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.55, 0, 1, 0.45] } },
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <LoadingRing />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <LoadingRing />
    </div>
  )
  return user ? <Navigate to="/dashboard" replace /> : children
}

function LoadingRing() {
  return (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#e2e8f0', borderTopColor: '#4f6ef7', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}

const AnimatedRoutes = () => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PublicRoute><AnimatedPage><Login /></AnimatedPage></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AnimatedPage><Register /></AnimatedPage></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="chat" element={<AnimatedPage><Chat /></AnimatedPage>} />
          <Route path="workouts" element={<AnimatedPage><Workouts /></AnimatedPage>} />
          <Route path="progress" element={<AnimatedPage><Progress /></AnimatedPage>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
