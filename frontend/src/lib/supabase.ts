import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const runtimeEnv = import.meta.env as Record<string, string | undefined>

/** Live production API (self-hosted Kong): https://aicoworker.lucas-dev-server.tech */
const DEFAULT_SUPABASE_URL = 'https://aicoworker.lucas-dev-server.tech'

function getRequiredEnv(primaryKey: string, fallbackKey: string): string {
  const value = runtimeEnv[primaryKey] ?? runtimeEnv[fallbackKey]
  if (!value) {
    throw new Error(
      `Missing Supabase environment variable: set either ${primaryKey} or ${fallbackKey}.`
    )
  }
  return value
}

function getOptionalEnv(primaryKey: string, fallbackKey: string): string | undefined {
  return runtimeEnv[primaryKey] ?? runtimeEnv[fallbackKey]
}

export const supabaseUrl =
  getOptionalEnv('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL') ?? DEFAULT_SUPABASE_URL
const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabaseFunctionsBaseUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1`

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
