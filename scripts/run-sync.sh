#!/bin/bash
# run-sync.sh — launchd wrapper for IMS DOCX sync + Excel register sync
# Loads PATH for homebrew node and reads SUPABASE_SERVICE_KEY from .env.secrets

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SECRETS_FILE="$REPO_ROOT/.env.secrets"

if [ -f "$SECRETS_FILE" ]; then
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
fi

node "$SCRIPT_DIR/sync-from-storage.cjs" || echo "[run-sync.sh] DOCX sync failed at $(date)" >&2
node "$SCRIPT_DIR/sync-registers-local.cjs" || echo "[run-sync.sh] Register sync failed at $(date)" >&2
