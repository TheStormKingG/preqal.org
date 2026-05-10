#!/bin/bash
# run-sync.sh — launchd wrapper for sync-from-storage.cjs
# Loads PATH for homebrew node and reads SUPABASE_SERVICE_KEY from .env.secrets

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SECRETS_FILE="$REPO_ROOT/.env.secrets"

if [ -f "$SECRETS_FILE" ]; then
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
fi

exec node "$SCRIPT_DIR/sync-from-storage.cjs"
