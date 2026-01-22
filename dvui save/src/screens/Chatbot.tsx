import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { getDeliverables, getStaff, getWorkstreams } from '../data/dataLayer'
import { useTheme } from '../context/ThemeContext'

// Configuration - uses Power Automate Flow as proxy to PwC GenAI
const FLOW_URL = 'https://deccb38910c54d5c87161093a04538.e1.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e61311a7738d44a491d36f6e08ae3e83/triggers/manual/paths/invoke?api-version=1'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function safeJson(obj: unknown, maxChars = 8000): string {
  try {
    const s = JSON.stringify(obj, null, 2)
    return s.length > maxChars ? s.slice(0, maxChars) + '\n…(truncated)…' : s
  } catch {
    return '(context unavailable)'
  }
}

function getAppContext() {
  const deliverables = getDeliverables()
  const staff = getStaff()
  const workstreams = getWorkstreams()

  // Calculate summary stats
  const today = new Date()
  const overdue = deliverables.filter(d =>
    d.status !== 'Completed' && d.dueDate && new Date(d.dueDate) < today
  )
  const atRisk = deliverables.filter(d => d.risk === 'High' && d.status !== 'Completed')
  const completed = deliverables.filter(d => d.status === 'Completed')
  const inProgress = deliverables.filter(d => d.status === 'In Progress')

  // Group by workstream
  const byWorkstream: Record<string, typeof deliverables> = {}
  deliverables.forEach(d => {
    const ws = workstreams.find(w => w.id === d.workstreamId)
    const wsName = ws?.name || 'Unassigned'
    if (!byWorkstream[wsName]) byWorkstream[wsName] = []
    byWorkstream[wsName].push(d)
  })

  // Calculate workstream stats
  const workstreamStats = Object.entries(byWorkstream).map(([name, dels]) => ({
    name,
    total: dels.length,
    completed: dels.filter(d => d.status === 'Completed').length,
    inProgress: dels.filter(d => d.status === 'In Progress').length,
    overdue: dels.filter(d => d.status !== 'Completed' && d.dueDate && new Date(d.dueDate) < today).length,
    avgProgress: Math.round(dels.reduce((sum, d) => sum + (d.progress || 0), 0) / dels.length),
  }))

  return {
    summary: {
      totalDeliverables: deliverables.length,
      completed: completed.length,
      inProgress: inProgress.length,
      overdue: overdue.length,
      atRisk: atRisk.length,
      totalStaff: staff.length,
      totalWorkstreams: workstreams.length,
      overallProgress: Math.round(deliverables.reduce((sum, d) => sum + (d.progress || 0), 0) / deliverables.length),
    },
    workstreamStats,
    deliverables: deliverables.map(d => ({
      title: d.title,
      status: d.status,
      progress: d.progress,
      dueDate: d.dueDate,
      risk: d.risk,
      workstream: workstreams.find(w => w.id === d.workstreamId)?.name || 'Unassigned',
      owner: staff.find(s => s.id === d.ownerId)?.name || 'Unassigned',
    })),
    staff: staff.map(s => ({
      name: s.name,
      title: s.title,
      email: s.email,
      workstreams: s.workstreamIds.map(id => workstreams.find(w => w.id === id)?.name).filter(Boolean),
      skills: s.skills || [],
    })),
    workstreams: workstreams.map(w => ({
      name: w.name,
      description: w.description,
    })),
  }
}

async function callChatCompletions(messages: Message[]): Promise<string> {
  const resp = await fetch(FLOW_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`HTTP ${resp.status} ${resp.statusText}${text ? ` – ${text}` : ''}`)
  }

  const data = await resp.json()
  return data?.choices?.[0]?.message?.content ?? '(no reply)'
}

export default function Chatbot() {
  const { currentTheme } = useTheme()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your Project Governance Assistant. I have access to all your deliverables, staff, and workstreams data. Ask me anything!\n\nTry questions like:\n- "What deliverables are overdue?"\n- "Show me the status of each workstream"\n- "Who owns the most deliverables?"\n- "What\'s the overall project health?"' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function buildGroundedMessages(userText: string): Message[] {
    const ctx = getAppContext()

    const systemPrompt: Message = {
      role: 'system',
      content: `You are an AI assistant for a Project Governance Dashboard.
You have access to REAL data about deliverables, staff, and workstreams.

IMPORTANT RULES:
- Use ONLY the provided App Context data. Do not make up information.
- Give precise, numeric answers when possible.
- Format responses clearly with bullet points or tables when appropriate.
- If asked about something not in the data, say so.
- Be concise but helpful.

Current date: ${new Date().toLocaleDateString()}`,
    }

    const contextMessage: Message = {
      role: 'system',
      content: `App Context (JSON):\n${safeJson(ctx)}`,
    }

    return [
      systemPrompt,
      contextMessage,
      ...messages.filter(m => m.role !== 'system'),
      { role: 'user', content: userText },
    ]
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setMessages(prev => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const outbound = buildGroundedMessages(trimmed)
      const reply = await callChatCompletions(outbound)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${errorMsg}\n\nThis might be a network or authentication issue. Please try again.` }])
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setMessages([
      { role: 'assistant', content: 'Conversation cleared. How can I help you?' },
    ])
    setError(null)
  }

  const cardStyle = {
    background: currentTheme.cardBg,
    border: `1px solid ${currentTheme.cardBorder}`,
    borderRadius: '12px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '1rem' }}>
      {/* Header */}
      <div style={{ ...cardStyle, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot size={24} style={{ color: currentTheme.primary }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', color: currentTheme.textPrimary }}>AI Assistant</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: currentTheme.textSecondary }}>
              Powered by GPT-4o-mini • Connected to your project data
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: `1px solid ${currentTheme.cardBorder}`,
            borderRadius: '8px',
            color: currentTheme.textSecondary,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          <RefreshCw size={14} />
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          ...cardStyle,
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: msg.role === 'user' ? currentTheme.primary : currentTheme.cardBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {msg.role === 'user' ? (
                <User size={16} style={{ color: '#fff' }} />
              ) : (
                <Bot size={16} style={{ color: currentTheme.textSecondary }} />
              )}
            </div>
            <div
              style={{
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: msg.role === 'user' ? currentTheme.primary : currentTheme.bgMain,
                color: msg.role === 'user' ? '#fff' : currentTheme.textPrimary,
                fontSize: '0.9375rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentTheme.cardBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Loader2 size={16} style={{ color: currentTheme.textSecondary, animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            ...cardStyle,
            padding: '0.75rem 1rem',
            background: '#fee2e2',
            borderColor: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={16} />
          Connection issue. Check that the Power Automate flow is enabled and you're signed in.
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ ...cardStyle, padding: '1rem', display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about deliverables, staff, workstreams..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: `1px solid ${currentTheme.cardBorder}`,
            borderRadius: '8px',
            background: currentTheme.bgMain,
            color: currentTheme.textPrimary,
            fontSize: '0.9375rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: loading || !input.trim() ? currentTheme.cardBorder : currentTheme.primary,
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
          Send
        </button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
