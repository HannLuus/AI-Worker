# AI-Coworker Platform: Trading Bot Integration

## Summary

**YES, your platform CAN accommodate the trading bot process.** 

The solution uses a **hybrid architecture** where:
- **Supabase** = State store + Audit trail + Scheduler
- **Python Bot** = Trading executor (runs externally)

---

## Current Status

### ✅ Completed

| Component | Status |
|-----------|--------|
| Database schema (`trading_state` table) | ✅ Created |
| Agent reconfigured as `bot_type = 'trading'` | ✅ Updated |
| Trading state initialized | ✅ Populated |
| Alpaca API connectivity | ✅ Verified |
| Platform-integrated Python bot | ✅ Created |

### 📊 Verification Results

```
✓ Alpaca API Status: 200
✓ Account Status: ACTIVE
✓ Cash: $830.90
✓ Buying Power: $830.90
✓ Next Market Open: 2026-04-17 09:30 AM ET
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI-COWORKER PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   agents     │    │  agent_runs  │    │trading_state │  │
│  │  (metadata)  │◄───│  (history)   │◄───│ (live state) │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         ▲                      ▲                ▲       │
│         │                      │                │       │
│         └──────────────────────┴────────────────┘       │
│                              │                            │
│                    ┌─────────┴──────────┐                │
│                    │   pg_cron scheduler │                │
│                    │   (triggers bot)    │                │
│                    └─────────┬──────────┘                │
└──────────────────────────────┼────────────────────────────┘
                               │ HTTP/Webhook
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL TRADING BOT (Python)                  │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  Read state  │───►│  Trade logic  │───►│ Write state  │ │
│  │ from Supabase│    │  (METV/Macro) │    │ to Supabase  │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                               │                             │
│                               ▼                             │
│                    ┌──────────────┐                        │
│                    │  Alpaca API  │                        │
│                    │(buy/sell/pos)│                        │
│                    └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## How the Platform Accommodates Each Requirement

| Requirement | Platform Solution |
|-------------|-------------------|
| **State persistence** | `trading_state` table in Supabase |
| **5-minute scheduling** | `pg_cron` extension (already installed) |
| **File logging** | Logs stored in `agent_runs.output` + stdout |
| **Daily summaries** | Markdown saved to `agent_runs` table |
| **Alpaca API calls** | Python bot makes direct HTTPS calls |
| **Macro safety** | `geo_hold_active` flag in database |
| **Audit trail** | Every run logged to `agent_runs` |
| **Multi-user support** | RLS policies on all tables |

---

## Database Schema

### `trading_state` Table (NEW)

| Column | Type | Purpose |
|--------|------|---------|
| `phase` | TEXT | IDLE / ENTRY_PENDING / ACTIVE |
| `symbol` | TEXT | METV (trading symbol) |
| `shares_held` | INTEGER | Current position size |
| `cost_basis` | DECIMAL | Average entry price |
| `high_water_mark` | DECIMAL | Highest price seen |
| `trailing_active` | BOOLEAN | Trailing stop enabled? |
| `current_floor` | DECIMAL | Stop loss floor price |
| `ladders_triggered` | TEXT[] | Which ladders fired (L1, L2) |
| `half_profit_taken` | BOOLEAN | Half profit rule executed? |
| `realized_pnl` | DECIMAL | Accumulated realized P&L |
| `alpaca_api_key` | TEXT | Alpaca credentials |
| `alpaca_api_secret` | TEXT | Alpaca credentials |
| `geo_hold_active` | BOOLEAN | Manual pause flag |
| `last_run_at` | TIMESTAMPTZ | Last execution time |
| `last_error` | TEXT | Last error message |

---

## Deployment Options

### Option 1: Local Machine + Supabase (Testing)

```bash
# 1. Setup
cd /home/hann/projects/ai-coworker
python3 -m venv venv
source venv/bin/activate
pip install requests

# 2. Set environment
export SUPABASE_URL=http://72.61.208.230:8000
export SUPABASE_SERVICE_ROLE_KEY=your_service_key
export AGENT_ID=969989c9-14fc-4e64-8a37-ef3640c166f7

# 3. Test run
python3 trading_bot_platform.py

# 4. Schedule with cron
crontab -e
# Add: */5 9-16 * * 1-5 /home/hann/projects/ai-coworker/run_trading_bot.sh
```

### Option 2: Cloud VPS (Production)

Deploy Python bot to DigitalOcean/AWS/any VPS:
- Bot polls Supabase every 5 minutes
- Executes trades via Alpaca API
- Logs everything back to Supabase

### Option 3: Supabase Edge Function (Future)

For fully serverless (requires):
- Store state in DB (not disk)
- Use `pg_cron` to trigger edge function
- Edge function makes Alpaca calls

**Current limitation**: Edge Functions have 50s timeout, which is fine for trading cycles.

---

## Testing the Bot

### 1. Verify Platform Setup

```sql
-- In Supabase SQL Editor
SELECT 
    a.name, 
    a.bot_type,
    ts.phase,
    ts.symbol,
    ts.shares_held,
    ts.last_run_at
FROM agents a
JOIN trading_state ts ON ts.agent_id = a.id
WHERE a.id = '969989c9-14fc-4e64-8a37-ef3640c166f7';
```

### 2. Test Connectivity

```bash
cd /home/hann/projects/ai-coworker
export SUPABASE_SERVICE_ROLE_KEY=your_key
python3 trading_bot_platform.py
```

Expected output:
```
2026-04-17 10:30:00 | INFO | === Platform Bot initialized | Agent: 969989c9-14fc-4e64-8a37-ef3640c166f7 ===
2026-04-17 10:30:00 | INFO | --- Starting trading cycle ---
2026-04-17 10:30:01 | INFO | Market open: False
2026-04-17 10:30:01 | INFO | Market closed.
2026-04-17 10:30:01 | INFO | Agent run updated: success
```

### 3. Check Dashboard

View runs in Supabase:
```sql
SELECT * FROM agent_runs 
WHERE agent_id = '969989c9-14fc-4e64-8a37-ef3640c166f7'
ORDER BY started_at DESC
LIMIT 5;
```

---

## Files Created

| File | Purpose |
|------|---------|
| `trading_bot_platform.py` | Platform-integrated trading bot |
| `init_trading_bot.sql` | Database initialization script |
| `run_trading_bot.sh` | Shell runner for cron |
| `trading_bot.py` | Standalone version (backup) |
| `PLATFORM_INTEGRATION.md` | This document |

---

## Next Steps

1. **Set `SUPABASE_SERVICE_ROLE_KEY`** in your environment
2. **Test the bot** with: `python3 trading_bot_platform.py`
3. **Set up cron** for automated trading (when market is open)
4. **Monitor** via Supabase dashboard (`agent_runs` table)

---

## Key Insight

Your platform **doesn't need to run the trading logic itself**. Instead:
- It provides the **infrastructure** (state, scheduling, audit)
- The Python bot provides the **execution** (trading, API calls)
- They communicate via **Supabase as the source of truth**

This is a clean separation that lets your platform support ANY type of bot (trading, monitoring, data processing, etc.) while keeping the architecture consistent.
