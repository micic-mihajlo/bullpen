#!/bin/bash
# Poll Convex for pending tasks and output them for OpenClaw dispatch
# Usage: ./scripts/poll-tasks.sh
# Requires: BULLPEN_API_TOKEN, CONVEX_SITE_URL

SITE_URL="${CONVEX_SITE_URL:-https://ceaseless-hedgehog-380.convex.site}"
TOKEN="${BULLPEN_API_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "Error: BULLPEN_API_TOKEN not set" >&2
  exit 1
fi

# Poll for pending tasks
RESPONSE=$(curl -s -f \
  -H "Authorization: Bearer $TOKEN" \
  "${SITE_URL}/api/tasks/pending")

if [ $? -ne 0 ]; then
  echo "Error: Failed to reach Convex HTTP endpoint" >&2
  exit 1
fi

echo "$RESPONSE"
