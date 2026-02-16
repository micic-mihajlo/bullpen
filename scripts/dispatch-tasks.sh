#!/bin/bash
# Bullpen Task Dispatcher for OpenClaw
# Polls Convex for pending tasks, outputs structured JSON for OpenClaw to act on.
# Designed to be called from a cron job or heartbeat check.
#
# Usage: ./scripts/dispatch-tasks.sh
# Returns: JSON array of tasks with dispatch info, or empty array

set -euo pipefail

SITE_URL="${CONVEX_SITE_URL:-https://ceaseless-hedgehog-380.convex.site}"
TOKEN="${BULLPEN_API_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo '{"error":"BULLPEN_API_TOKEN not set"}' >&2
  exit 1
fi

# Poll for pending tasks
RESPONSE=$(curl -sf \
  -H "Authorization: Bearer $TOKEN" \
  "${SITE_URL}/api/tasks/pending" 2>/dev/null) || {
  echo '{"error":"Failed to reach Convex API"}' >&2
  exit 1
}

echo "$RESPONSE"
