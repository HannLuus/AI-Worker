import { useEffect, useState } from 'react'
import { Mail, Copy, CheckCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function MagicInboxCard() {
  const { user } = useAuth()
  const [address, setAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [emailCount, setEmailCount] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase
      .from('inboxes')
      .select('id, address')
      .eq('owner_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAddress(data.address)
          supabase
            .from('received_emails')
            .select('id', { count: 'exact', head: true })
            .eq('inbox_id', data.id)
            .then(({ count }) => setEmailCount(count ?? 0))
        }
      })
  }, [user])

  function copy() {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!address) return null

  return (
    <div className="bg-gray-900 border border-violet-600/30 rounded-2xl p-5 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600/20 border border-violet-600/30 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Your Magic Inbox</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {emailCount > 0 ? `${emailCount} email${emailCount > 1 ? 's' : ''} received` : 'No emails yet — forward some to get started'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 font-mono text-sm text-violet-300 truncate">
          {address}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-2.5 rounded-xl transition-colors flex-shrink-0"
        >
          {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-800 pt-4 space-y-3">
          <p className="text-sm font-medium text-white">How to set up email forwarding</p>

          <div className="space-y-2">
            {[
              { label: 'Gmail', steps: 'Settings → See all settings → Forwarding and POP/IMAP → Add a forwarding address → paste your Magic Inbox address → confirm.' },
              { label: 'Outlook', steps: 'Settings → Mail → Forwarding → Enable forwarding → paste your Magic Inbox address → Save.' },
              { label: 'Apple Mail', steps: 'Preferences → Rules → Add Rule → Forward to address → paste your Magic Inbox address.' },
            ].map(({ label, steps }) => (
              <details key={label} className="group">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors list-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  {label}
                </summary>
                <p className="text-xs text-gray-500 mt-1.5 ml-3.5 leading-relaxed">{steps}</p>
              </details>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <p className="text-xs text-amber-300">
              <strong>Tip:</strong> Your agent will read emails that arrive in this inbox and include a smart summary in your daily briefing — automatically, every morning.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
