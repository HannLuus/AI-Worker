import { useState } from 'react'
import { User, CreditCard, Bell, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const PLANS = [
  { tier: 'free', name: 'Free', price: '$0', tokens: '50K tokens/mo', freq: 'Once daily', desc: 'Try it out — 1 agent, 2 tasks max.' },
  { tier: 'daily', name: 'Daily', price: '$5/mo', tokens: '300K tokens/mo', freq: 'Once daily', desc: 'Your morning briefing on up to 10 topics.' },
  { tier: 'active', name: 'Active', price: '$15/mo', tokens: '1M tokens/mo', freq: 'Up to hourly', desc: 'News monitoring, pipeline checks.' },
  { tier: 'frequent', name: 'Frequent', price: '$29/mo', tokens: '5M tokens/mo', freq: 'Up to every 5 min', desc: 'Live monitoring, stock watchers.' },
]

export default function SettingsPage() {
  const { profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 mb-8">Manage your account and subscription.</p>

      <div className="space-y-6">
        {/* Profile */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-violet-400" />
            <h2 className="text-white font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Full name</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                value={profile?.email ?? ''}
                disabled
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-violet-400" />
            <h2 className="text-white font-semibold">Subscription</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map(plan => {
              const isCurrent = profile?.plan_tier === plan.tier
              return (
                <div
                  key={plan.tier}
                  className={`rounded-xl p-4 border transition-all ${
                    isCurrent
                      ? 'border-violet-500 bg-violet-600/10'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{plan.name}</p>
                      <p className="text-violet-400 font-bold">{plan.price}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{plan.tokens}</p>
                  <p className="text-xs text-gray-400 mb-2">{plan.freq}</p>
                  <p className="text-xs text-gray-500">{plan.desc}</p>
                  {!isCurrent && (
                    <button className="mt-3 w-full text-xs bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded-lg transition-colors font-medium">
                      Upgrade
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-600 mt-4 text-center">
            The more you invest, the more capable your assistant becomes. Cancel anytime.
          </p>
        </section>

        {/* Notifications */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-violet-400" />
            <h2 className="text-white font-semibold">Notifications</h2>
          </div>
          <p className="text-sm text-gray-400">Agent results are delivered to <span className="text-white">{profile?.email}</span>. Telegram integration coming soon.</p>
        </section>

        {/* Security */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-violet-400" />
            <h2 className="text-white font-semibold">Security</h2>
          </div>
          <button
            onClick={() => supabase.auth.resetPasswordForEmail(profile?.email ?? '')}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Send password reset email
          </button>
        </section>
      </div>
    </div>
  )
}
