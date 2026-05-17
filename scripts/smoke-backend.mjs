#!/usr/bin/env node
/**
 * Quick probes against the live self-hosted API (anon key, same as the SPA).
 * Usage from repo root: node scripts/smoke-backend.mjs
 * Or: node --env-file=.env scripts/smoke-backend.mjs
 *
 * Does not replace browser tests for login/OAuth; validates Kong + PostgREST + keys.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function parseEnvFile(path) {
  const out = {}
  let text
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    return out
  }
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i <= 0) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1)
    out[k] = v
  }
  return out
}

const fileEnv = {
  ...parseEnvFile(join(root, '.env')),
  ...parseEnvFile(join(root, '.env.example')),
}
const env = { ...fileEnv, ...process.env }
const base = (env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '').replace(
  /\/$/,
  '',
)
const key = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY

if (!base || !key) {
  console.error('Missing Supabase URL or anon key (.env or .env.example).')
  process.exit(1)
}

const headers = { apikey: key, Authorization: `Bearer ${key}` }

async function probe(path, label) {
  const url = `${base}${path}`
  const r = await fetch(url, { headers })
  const text = await r.text()
  let summary
  try {
    const j = JSON.parse(text)
    summary = Array.isArray(j) ? `rows=${j.length}` : JSON.stringify(j).slice(0, 160)
  } catch {
    summary = text.slice(0, 120)
  }
  console.log(`${label}\t${r.status}\t${summary}`)
  if (r.status >= 500) return false
  if (r.status === 401 || r.status === 403) {
    console.warn(`  (warn) ${label}: ${r.status} — anon may be rejected by RLS or invalid JWT; endpoint still reached.`)
    return true
  }
  return r.status >= 200 && r.status < 300
}

let failed = false
for (const [path, label] of [
  ['/rest/v1/agents?select=id&limit=1', 'agents'],
  ['/rest/v1/inboxes?select=id&limit=1', 'inboxes'],
  ['/rest/v1/agent_runs?select=id&limit=1', 'agent_runs'],
  ['/rest/v1/profiles?select=id&limit=1', 'profiles'],
]) {
  try {
    const ok = await probe(path, label)
    if (!ok) failed = true
  } catch (e) {
    const msg = e?.cause?.message || e?.cause?.code || e?.message || String(e)
    console.error(`${label}\tERROR\t`, msg)
    failed = true
  }
}

try {
  const studioUrl = base.replace(/\/$/, '').replace(/^https:\/\/([^.]+)\./, 'https://studio.')
  const studio = await fetch(studioUrl, {
    method: 'HEAD',
    redirect: 'manual',
  })
  console.log(`studio\t${studio.status}\tHEAD ${studioUrl}`)
} catch (e) {
  const msg = e?.cause?.message || e?.cause?.code || e?.message || String(e)
  console.error('studio\tERROR\t', msg)
  failed = true
}

process.exit(failed ? 1 : 0)
