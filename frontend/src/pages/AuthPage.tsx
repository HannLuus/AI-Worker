import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { BotMessageSquare } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
              <BotMessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AI Coworker</span>
          </div>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            Your AI team. Working while you sleep. In your inbox every morning.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7c3aed',
                    brandAccent: '#6d28d9',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#1f2937',
                    defaultButtonBackgroundHover: '#374151',
                    inputBackground: '#111827',
                    inputBorder: '#374151',
                    inputBorderHover: '#6d28d9',
                    inputBorderFocus: '#7c3aed',
                    inputText: 'white',
                    inputLabelText: '#9ca3af',
                    inputPlaceholder: '#6b7280',
                    messageText: '#f3f4f6',
                    messageBackground: '#1f2937',
                    anchorTextColor: '#a78bfa',
                    anchorTextHoverColor: '#c4b5fd',
                  },
                  radii: {
                    borderRadiusButton: '10px',
                    buttonBorderRadius: '10px',
                    inputBorderRadius: '10px',
                  },
                },
              },
              style: {
                button: { fontWeight: '600' },
                anchor: { color: '#a78bfa' },
                container: { gap: '16px' },
              },
            }}
            providers={['google']}
            redirectTo={window.location.origin}
          />
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          No credit card required · Cancel anytime
        </p>
      </div>
    </div>
  )
}
