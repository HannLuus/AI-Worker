# AI Coworker Platform

## 24/7 Autonomous Agent System

### Key Features
- OpenRouter AI integration (multi-model support)
- Supabase backend
- Vercel hosting
- n8n workflow automation

## Development Setup

- Copy `.env.example` to `.env` and fill secrets. Supabase: API `https://clmb.lucas-dev-server.tech`, Studio `https://studio.clmb.lucas-dev-server.tech` (configure auth redirect URLs in Studio).
- Frontend: `cd frontend && npm install && npm run dev` (Vite default `http://localhost:5173`).
- Smoke-test the live API from a machine that resolves `clmb.lucas-dev-server.tech`: `node scripts/smoke-backend.mjs` (uses `.env` or `.env.example` for URL + anon key).
