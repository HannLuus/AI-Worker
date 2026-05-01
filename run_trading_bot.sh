#!/bin/bash
# Trading Bot Runner for Platform Integration
# This script can be called by:
# 1. Cron job on the host machine
# 2. Webhook from Supabase pg_cron (via HTTP endpoint)
# 3. Manual execution

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_ID="${AGENT_ID:-969989c9-14fc-4e64-8a37-ef3640c166f7}"

# Load environment variables
export AGENT_ID="$AGENT_ID"
export SUPABASE_URL="${SUPABASE_URL:-http://72.61.208.230:8000}"
# NOTE: Set SUPABASE_SERVICE_ROLE_KEY in environment or .env file

# Check for required env vars
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "ERROR: SUPABASE_SERVICE_ROLE_KEY not set"
    exit 1
fi

# Change to script directory
cd "$SCRIPT_DIR"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run the bot
python3 trading_bot_platform.py

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "Bot completed successfully"
else
    echo "Bot failed with exit code $exit_code"
fi

exit $exit_code
