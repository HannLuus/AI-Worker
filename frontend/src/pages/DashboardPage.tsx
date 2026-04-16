import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Bot, Play, Pause, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Tables } from '@/types/database'
import MagicInboxCard from '@/components/MagicInboxCard'

type Agent = Tables<'agents'>

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-400/10', icon: Play },
  paused: { label: 'Paused', color: 'text-amber-400 bg-amber-400/10', icon: Pause },
  draft: { label: 'Draft', color: 'text-gray-400 bg-gray-400/10', icon: Clock },
  error: { label: 'Error', color: 'text-red-400 bg-red-400/10', icon: XCircle },
}

function AgentCard({ agent, onToggle }: { agent: Agent; onToggle: (id: string, action: 'schedule' | 'unschedule') => Promise<void> }) {
  const config = STATUS_CONFIG[agent.status]
  const Icon = config.icon
  const config_ = agent.prompt_config as Record<string, string>
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    const action = agent.status === 'active' ? 'unschedule' : 'schedule'
    await onToggle(agent.id, action)
    setToggling(false)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600/20 border border-violet-600/30 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{agent.description || 'No description'}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-800 pt-3 mt-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {agent.schedule_cron === '0 6 * * *' ? 'Daily at 6am' : agent.schedule_cron}
        </span>
        <span>{agent.model.split('/')[1] ?? agent.model}</span>
        {agent.last_run_at && (
          <span>Last run {new Date(agent.last_run_at).toLocaleDateString()}</span>
        )}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${
            agent.status === 'active'
              ? 'text-amber-400 hover:bg-amber-400/10'
              : 'text-emerald-400 hover:bg-emerald-400/10'
          }`}
        >
          {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : agent.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {agent.status === 'active' ? 'Pause' : 'Resume'}
        </button>
      </div>

      {config_.goal && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{config_.goal}</p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAgents(data ?? [])
        setLoading(false)
      })
  }, [])

  async function toggleAgent(id: string, action: 'schedule' | 'unschedule') {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-agent-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ action, agent_id: id }),
    })
    setAgents(prev => prev.map(a =>
      a.id === id ? { ...a, status: action === 'schedule' ? 'active' : 'paused' } : a
    ))
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{greeting}, {firstName}</h1>
        <p className="text-gray-400 mt-1">
          {activeCount > 0
            ? `You have ${activeCount} agent${activeCount > 1 ? 's' : ''} working for you.`
            : 'Create your first agent to get started.'}
        </p>
      </div>

      <MagicInboxCard />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Agents', value: agents.length, icon: Bot, color: 'text-violet-400' },
          { label: 'Active', value: activeCount, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Tokens Used', value: (profile?.tokens_used_this_month ?? 0).toLocaleString(), icon: Loader2, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Your Agents</h2>
        <Link
          to="/dashboard/new-agent"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl py-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-violet-600/10 border border-violet-600/20 rounded-2xl flex items-center justify-center mb-4">
            <Bot className="w-7 h-7 text-violet-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">No agents yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Your first agent is one conversation away. Tell it what you want, and it will start working tonight.
          </p>
          <Link
            to="/dashboard/new-agent"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} onToggle={toggleAgent} />
          ))}
        </div>
      )}
    </div>
  )
}
