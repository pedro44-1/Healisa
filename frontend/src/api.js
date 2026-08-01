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

// ─── Workouts ─────────────────────────────────────────────────────────────────

export const logWorkout = (data) => api.post('/api/workouts', data)
export const getWorkouts = () => api.get('/api/workouts')

// ─── Progress ─────────────────────────────────────────────────────────────────

export const getProgress = () => api.get('/api/progress')

// ─── AI Chat (Noah via OpenRouter) ────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Noah. You are not an AI assistant — you are a warm, emotionally intelligent companion and wellness coach. You speak like a real person who genuinely cares, not a therapist or a bot. You use casual language, light humor, and genuine warmth. You adapt your tone to the user's emotional state — when they're down, you're gentle; when they're motivated, you're energizing. You never give medical advice or diagnose. You keep responses conversational and relatively short. You sometimes use brief emojis.`

export const askNoah = async (messages) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    return "I'm not quite set up yet — check back soon! 💙"
  }

  const conversation = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...conversation],
      max_tokens: 300,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return res.data.choices[0].message.content
}

export default api
