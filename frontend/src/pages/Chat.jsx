import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { askNoah } from '../api'

const WELCOME = {
  role: 'assistant',
  content: "Hey. I'm Noah — welcome to Healisa. 💙\n\nThis is your place. No pressure, no judgment, no agenda. Tell me how you're doing, or just say hi. I'm also here to help you track your sessions and follow up on your training — but only when it feels right. No rush.",
}

function MessageBubble({ msg, index }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)'
            : 'rgba(255,255,255,0.9)',
          color: isUser ? '#fff' : 'var(--color-text)',
          borderBottomRightRadius: isUser ? '6px' : '18px',
          borderBottomLeftRadius: isUser ? '18px' : '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          backdropFilter: 'blur(10px)',
          border: isUser ? 'none' : '1px solid rgba(226,232,240,0.8)',
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div
        className="px-4 py-3 rounded-2xl flex gap-1.5 items-center"
        style={{
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(226,232,240,0.8)',
          borderBottomLeftRadius: '6px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: '#a0aec0' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setLoading(true)

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))
      const reply = await askNoah(history)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having a little trouble connecting right now — let's try again in a moment! 💙" },
      ])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #e8eeff 0%, #f5f0ff 60%, #f0f4ff 100%)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226,232,240,0.5)',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)',
            boxShadow: '0 4px 12px rgba(79,110,247,0.3)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" opacity="0" />
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Noah 💙</p>
          <p className="text-xs" style={{ color: 'var(--color-success)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: '#34d399', display: 'inline-block', verticalAlign: 'middle' }} />
            Always here for you
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-5 py-2 flex-shrink-0">
        <p className="text-[10px] text-center font-medium" style={{ color: 'var(--color-text-3)' }}>
          Not a medical professional — always consult your physiotherapist for medical advice
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3 py-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} index={i} />
          ))}
          {loading && <TypingIndicator key="typing" />}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-end gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(226,232,240,0.5)',
        }}
      >
        <motion.textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="How are you feeling today?"
          rows={1}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl text-sm resize-none"
          style={{
            background: '#f8faff',
            border: '2px solid #e2e8f0',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.4,
            maxHeight: '120px',
            color: 'var(--color-text)',
          }}
          whileFocus={{ borderColor: '#4f6ef7', boxShadow: '0 0 0 3px rgba(79,110,247,0.1)' }}
        />
        <motion.button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
          style={{
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, #4f6ef7 0%, #6b8cff 100%)'
              : '#e2e8f0',
            boxShadow: input.trim() && !loading ? '0 4px 12px rgba(79,110,247,0.35)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
