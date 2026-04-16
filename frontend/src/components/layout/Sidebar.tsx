import { NavLink } from 'react-router-dom'
import {
  BotMessageSquare,
  LayoutDashboard,
  Plus,
  History,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  daily: 'Daily · $5/mo',
  active: 'Active · $15/mo',
  frequent: 'Frequent · $29/mo',
  custom: 'Custom',
}

const PLAN_COLORS: Record<string, string> = {
  free: 'text-gray-400',
  daily: 'text-violet-400',
  active: 'text-blue-400',
  frequent: 'text-amber-400',
  custom: 'text-emerald-400',
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()

  const tier = profile?.plan_tier ?? 'free'
  const tokensUsed = profile?.tokens_used_this_month ?? 0
  const tokenBudget = profile?.token_budget_monthly ?? 50000
  const usagePct = Math.min((tokensUsed / tokenBudget) * 100, 100)

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/new-agent', icon: Plus, label: 'New Agent' },
    { to: '/dashboard/history', icon: History, label: 'Run History' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <BotMessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">AI Coworker</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-gray-400">Token usage</span>
            </div>
            <span className={`text-xs font-medium ${PLAN_COLORS[tier]}`}>
              {PLAN_LABELS[tier]}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-amber-500' : 'bg-violet-500'
              }`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {tokensUsed.toLocaleString()} / {tokenBudget.toLocaleString()} tokens
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
