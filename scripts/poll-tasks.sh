#!/bin/bash
# Poll Convex for pending tasks and output them for OpenClaw dispatch
# Usage: ./scripts/poll-tasks.sh
# Requires: BULLPEN_API_TOKEN, CONVEX_SITE_URL

set -euo pipefail

SITE_URL="${CONVEX_SITE_URL:-https://ceaseless-hedgehog-380.convex.site}"
TOKEN="${BULLPEN_API_TOKEN:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/http-with-retry.sh"

if [ -z "$TOKEN" ]; then
  echo "Error: BULLPEN_API_TOKEN not set" >&2
  exit 1
fi

# Poll for pending tasks
RESPONSE=$(http_request_with_retry "GET" "${SITE_URL}/api/tasks/pending") || {
  echo "Error: Failed to reach Convex HTTP endpoint" >&2
  exit 1
}

echo "$RESPONSE"
