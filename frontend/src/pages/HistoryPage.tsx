import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

type AgentRun = Tables<'agent_runs'> & { agentName?: string }

const STATUS_ICON = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  running: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  pending: <Clock className="w-4 h-4 text-gray-400" />,
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: runData }, { data: agentData }] = await Promise.all([
        supabase.from('agent_runs').select('*').order('started_at', { ascending: false }).limit(50),
        supabase.from('agents').select('id, name'),
      ])
      const agentMap = Object.fromEntries((agentData ?? []).map(a => [a.id, a.name]))
      setRuns((runData ?? []).map(r => ({ ...r, agentName: agentMap[r.agent_id] })))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Run History</h1>
      <p className="text-gray-400 mb-8">Every execution your agents have completed.</p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl py-16 text-center">
          <p className="text-gray-500">No runs yet. Activate an agent to see history here.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-medium px-5 py-3">Agent</th>
                <th className="text-left text-gray-500 font-medium px-5 py-3">Status</th>
                <th className="text-left text-gray-500 font-medium px-5 py-3">Tokens</th>
                <th className="text-left text-gray-500 font-medium px-5 py-3">Model</th>
                <th className="text-left text-gray-500 font-medium px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 text-white">{run.agentName ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      {STATUS_ICON[run.status]}
                      <span className="capitalize text-gray-300">{run.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{run.tokens_used.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-400">{run.model_used?.split('/')[1] ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(run.started_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
