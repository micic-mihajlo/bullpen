#!/bin/bash
# Post execution log entry to Convex
# Usage: ./scripts/post-log.sh <taskId> <message> [type]
# Type: info | warning | error | success (default: info)

set -euo pipefail

SITE_URL="${CONVEX_SITE_URL:-https://ceaseless-hedgehog-380.convex.site}"
TOKEN="${BULLPEN_API_TOKEN:-}"
TASK_ID="${1:-}"
MESSAGE="${2:-}"
TYPE="${3:-info}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/http-with-retry.sh"

if [ -z "$TOKEN" ] || [ -z "$TASK_ID" ] || [ -z "$MESSAGE" ]; then
  echo '{"error":"Usage: post-log.sh <taskId> <message> [type]"}' >&2
  exit 1
fi

http_request_with_retry "POST" "${SITE_URL}/api/tasks/log" "{\"taskId\":\"$TASK_ID\",\"message\":$(echo "$MESSAGE" | jq -Rs .),\"type\":\"$TYPE\"}"
