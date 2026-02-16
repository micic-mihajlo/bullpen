#!/bin/bash
# Report task result back to Convex
# Usage: ./scripts/report-result.sh <taskId> <status> [result] [error]
# Status: completed | failed

set -euo pipefail

SITE_URL="${CONVEX_SITE_URL:-https://ceaseless-hedgehog-380.convex.site}"
TOKEN="${BULLPEN_API_TOKEN:-}"
TASK_ID="${1:-}"
STATUS="${2:-}"
RESULT="${3:-}"
ERROR="${4:-}"

if [ -z "$TOKEN" ] || [ -z "$TASK_ID" ] || [ -z "$STATUS" ]; then
  echo '{"error":"Usage: report-result.sh <taskId> <status> [result] [error]"}' >&2
  exit 1
fi

BODY="{\"taskId\":\"$TASK_ID\",\"status\":\"$STATUS\""
[ -n "$RESULT" ] && BODY="$BODY,\"result\":$(echo "$RESULT" | jq -Rs .)"
[ -n "$ERROR" ] && BODY="$BODY,\"error\":$(echo "$ERROR" | jq -Rs .)"
BODY="$BODY}"

curl -sf \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  "${SITE_URL}/api/tasks/result"
