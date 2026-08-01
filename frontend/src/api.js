/**
 * API client — all backend calls go through here.
 * Uses VITE_API_URL env var (defaults to localhost for dev).
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('healisa_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)
export const getMe = () => api.get('/api/auth/me')
export const updateProfile = (data) => api.patch('/api/profile', data)

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const sendChat = (messages) => api.post('/api/chat', { messages })

// ─── Workouts ─────────────────────────────────────────────────────────────────

export const logWorkout = (data) => api.post('/api/workouts', data)
export const getWorkouts = () => api.get('/api/workouts')

// ─── Progress ─────────────────────────────────────────────────────────────────

export const getProgress = () => api.get('/api/progress')

export default api
