import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navItems = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/chat',
    label: 'Coach',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    to: '/workouts',
    label: 'Workouts',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5L4 4" />
        <path d="M17.5 6.5L20 4" />
        <path d="M14 4v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4" />
        <rect x="4" y="10" width="16" height="5" rx="2" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Glassmorphic bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.06)',
          height: 'var(--nav-h)',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors duration-200 ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-3)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active dot indicator */}
                <div className="relative">
                  {item.icon}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 left-1/2 w-1 h-1 rounded-full"
                      style={{
                        background: 'var(--color-primary)',
                        transform: 'translateX(-50%)',
                        marginLeft: '10px',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 gap-0.5 text-[var(--color-text-3)] cursor-pointer"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">Logout</span>
        </button>
      </nav>
    </div>
  )
}
