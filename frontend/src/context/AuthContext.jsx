import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('healisa_token')
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('healisa_token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loginUser = (token, userData) => {
    localStorage.setItem('healisa_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('healisa_token')
    setUser(null)
  }

  // Call this after user dismisses the intro
  const dismissIntro = () => {
    if (user) {
      setUser({ ...user, has_seen_intro: true })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout, dismissIntro }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
