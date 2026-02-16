#!/bin/bash
# Claim a Bullpen task for execution
# Usage: ./scripts/claim-task.sh <taskId> [workerTemplateId] [sessionKey]

set -euo pipefail

SITE_URL="${CONVEX_SITE_URL:-https://ceaseless-hedgehog-380.convex.site}"
TOKEN="${BULLPEN_API_TOKEN:-}"
TASK_ID="${1:-}"
TEMPLATE_ID="${2:-}"
SESSION_KEY="${3:-openclaw-dispatch}"

if [ -z "$TOKEN" ] || [ -z "$TASK_ID" ]; then
  echo '{"error":"Usage: claim-task.sh <taskId> [workerTemplateId] [sessionKey]"}' >&2
  exit 1
fi

BODY="{\"taskId\":\"$TASK_ID\""
[ -n "$TEMPLATE_ID" ] && BODY="$BODY,\"workerTemplateId\":\"$TEMPLATE_ID\""
[ -n "$SESSION_KEY" ] && BODY="$BODY,\"sessionKey\":\"$SESSION_KEY\""
BODY="$BODY}"

curl -sf \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  "${SITE_URL}/api/tasks/claim"
