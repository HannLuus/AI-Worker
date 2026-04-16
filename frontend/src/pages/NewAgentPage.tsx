import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

const SYSTEM_PROMPT = `You are an AI Coworker setup assistant. Your job is to help the user configure their personal AI agent in a friendly, conversational way.

Ask these questions one at a time (don't ask them all at once):
1. What do you want your agent to do for you? (e.g. summarise emails, monitor news, check business metrics)
2. What specific topics, sources, or platforms should it focus on?
3. What time would you like to receive your daily briefing? (and what timezone are you in)
4. What AI model do you prefer? (Basic = fast & cheap, Standard = smarter, Advanced = best quality)
5. What would you like to name this agent?

After gathering all answers, output a JSON block wrapped in \`\`\`json ... \`\`\` with this structure:
{
  "name": "agent name",
  "description": "one line description",
  "goal": "what the agent does",
  "topics": ["topic1", "topic2"],
  "schedule_cron": "0 6 * * *",
  "timezone": "UTC",
  "model": "openai/gpt-4o-mini",
  "prompt": "detailed system prompt for the agent"
}

Be warm, professional, and concise. Ask one question at a time.`

const WELCOME = `Hello! I'm here to help you set up your personal AI assistant. Think of me as briefing a new employee — the more clearly you tell me what you need, the better I can build it for you.

Let's start simple: **What do you want your agent to do for you every day?**

For example:
- Summarise what's happening in the news on topics I care about
- Check my emails and flag anything urgent
- Give me a daily overview of my business performance
- Monitor a specific market or industry

What's on your mind?`

export default function NewAgentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [agentConfig, setAgentConfig] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      })
      const data = await response.json() as { choices: Array<{ message: { content: string } }> }
      const reply = data.choices[0]?.message?.content ?? 'Sorry, something went wrong.'

      const jsonMatch = reply.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        try {
          const config = JSON.parse(jsonMatch[1]) as Record<string, unknown>
          setAgentConfig(config)
        } catch {
          // not valid JSON yet
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  async function launchAgent() {
    if (!agentConfig || !user) return
    setSaving(true)

    const { data: inserted, error } = await supabase.from('agents').insert({
      owner_id: user.id,
      name: agentConfig.name as string,
      description: agentConfig.description as string,
      prompt_config: agentConfig as unknown as import('@/types/database').Json,
      model: agentConfig.model as string,
      schedule_cron: agentConfig.schedule_cron as string,
      timezone: agentConfig.timezone as string,
      status: 'draft',
    }).select('id').single()

    if (!error && inserted) {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-agent-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action: 'schedule', agent_id: inserted.id }),
      })
      navigate('/dashboard')
    }

    setSaving(false)
  }

  function renderMessage(content: string) {
    const withoutJson = content.replace(/```json[\s\S]*?```/g, '').trim()
    return withoutJson.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: bold }} />
    })
  }

  return (
    <div className="flex flex-col h-screen p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-400" />
          Create New Agent
        </h1>
        <p className="text-gray-400 mt-1">Tell me what you need — I'll build your agent for you.</p>
      </div>

      <div className="flex-1 overflow-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-violet-600/20 border border-violet-600/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-violet-400" />
              </div>
            )}
            <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-gray-900 border border-gray-800 text-gray-200'
                : 'bg-violet-600 text-white'
            }`}>
              {renderMessage(msg.content)}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-violet-600/20 border border-violet-600/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-violet-400" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {agentConfig && (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Agent ready: {agentConfig.name as string}
              </p>
              <p className="text-gray-400 text-xs mt-1">{agentConfig.description as string}</p>
            </div>
            <button
              onClick={launchAgent}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Launching…' : 'Launch Agent'}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Tell me what you need…"
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-4 py-3 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
