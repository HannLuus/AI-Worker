import { Link } from 'react-router-dom'
import { Bot, Mail, Clock, Zap, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

const PLANS = [
  { name: 'Free', price: '$0', period: '', tokens: '50K tokens/mo', freq: 'Once daily', agents: '1 agent', cta: 'Start free', highlight: false },
  { name: 'Daily', price: '$5', period: '/mo', tokens: '300K tokens/mo', freq: 'Once daily', agents: 'Up to 5 agents', cta: 'Get started', highlight: false },
  { name: 'Active', price: '$15', period: '/mo', tokens: '1M tokens/mo', freq: 'Up to hourly', agents: 'Up to 15 agents', cta: 'Get started', highlight: true },
  { name: 'Frequent', price: '$29', period: '/mo', tokens: '5M tokens/mo', freq: 'Every 5 minutes', agents: 'Unlimited agents', cta: 'Get started', highlight: false },
]

const EXAMPLES = [
  { icon: Mail, title: 'Email Prioritiser', desc: 'Reads your inbox every morning, flags urgent items, summarises everything else. You open one email instead of fifty.' },
  { icon: Bot, title: 'News Briefing', desc: 'Monitors topics you care about — markets, industry news, competitors — and delivers a clean summary before you start work.' },
  { icon: Zap, title: 'Business Monitor', desc: 'Checks your key metrics, sales pipeline, or website stats and tells you what changed and what needs attention.' },
  { icon: Clock, title: 'Market Watcher', desc: 'Tracks stocks, crypto, or commodities every 5 minutes and alerts you when something moves significantly.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800/50 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-violet-400" />
          AI Coworker
        </div>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
          <Link to="/auth" className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-colors font-medium">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-600/20 text-violet-300 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Your personal assistant — without the salary
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Tell it what you want.<br />
          <span className="text-violet-400">Get it in your inbox.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI Coworker builds a personal AI assistant that works 24/7 — reading your emails, monitoring news, watching your business — and delivers a clear briefing to your inbox every morning.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/auth" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-lg">
            Create your free agent
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#how" className="text-gray-400 hover:text-white transition-colors text-sm">See how it works ↓</a>
        </div>
        <p className="text-sm text-gray-600 mt-5">No credit card. No setup. Takes 2 minutes.</p>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Three steps. No technical knowledge needed.</p>
        <div className="grid grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Tell it what you need', desc: 'Chat with our AI setup assistant. Tell it what you want — check my emails, monitor the news, watch my business stats. It asks a few questions and builds your agent.' },
            { step: '02', title: 'We build your agent', desc: 'Your personal AI agent is created instantly. It knows what to look for, when to run, and how to prioritise what matters to you.' },
            { step: '03', title: 'It arrives in your inbox', desc: 'Every morning (or more often if you choose) your briefing lands in your email. Clear, prioritised, actionable. Like a personal assistant handed you a brief.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="relative">
              <div className="text-5xl font-bold text-gray-800 mb-4">{step}</div>
              <h3 className="text-white font-semibold text-lg mb-3">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-gray-800/50">
        <h2 className="text-3xl font-bold text-center mb-4">What can your agent do?</h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Real examples — not marketing fluff.</p>
        <div className="grid grid-cols-2 gap-5">
          {EXAMPLES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 bg-violet-600/20 border border-violet-600/30 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value prop */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-800/50 text-center">
        <h2 className="text-3xl font-bold mb-6">The same as a personal assistant.<br /><span className="text-violet-400">At a fraction of the cost.</span></h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          A human assistant costs thousands per month. Ours starts at $0. It doesn't complain about the workload. It doesn't take sick days. It doesn't ask for a raise. It just delivers — every single day.
        </p>
        <div className="grid grid-cols-3 gap-6 mt-12 text-left">
          {[
            { label: 'Available', value: '24/7', sub: 'Never offline' },
            { label: 'Starting from', value: '$0', sub: 'Free forever plan' },
            { label: 'Setup time', value: '2 min', sub: 'No tech skills needed' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <p className="text-gray-500 text-sm mb-2">{label}</p>
              <p className="text-3xl font-bold text-violet-400">{value}</p>
              <p className="text-gray-500 text-xs mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20 border-t border-gray-800/50">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-gray-400 text-center mb-4 max-w-xl mx-auto">The more your agent does, the more it costs — just like a real assistant. You always know exactly what you're paying for.</p>
        <p className="text-gray-600 text-sm text-center mb-16">Pricing is based on token usage — the more frequently your agent runs and the more it analyses, the more tokens it uses.</p>
        <div className="grid grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 border transition-all ${plan.highlight ? 'border-violet-500 bg-violet-600/10' : 'border-gray-800 bg-gray-900'}`}>
              {plan.highlight && <div className="text-xs bg-violet-600 text-white px-2.5 py-1 rounded-full font-medium inline-block mb-3">Most popular</div>}
              <h3 className="text-white font-bold text-lg">{plan.name}</h3>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>
              <div className="space-y-2 mb-6">
                {[plan.tokens, plan.freq, plan.agents].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Link to="/auth" className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${plan.highlight ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600 text-xs mt-8">Cancel anytime. No contracts. Upgrade or downgrade whenever you need.</p>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to meet your new coworker?</h2>
        <p className="text-gray-400 text-lg mb-10">Your first agent is free. No credit card. No setup. Just tell it what you want.</p>
        <Link to="/auth" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-10 py-4 rounded-2xl transition-colors text-lg">
          Create your free agent
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            AI Coworker — aicoworker.sbs
          </div>
          <p className="text-gray-700 text-xs">No salary. No complaints. Just results.</p>
        </div>
      </footer>
    </div>
  )
}
