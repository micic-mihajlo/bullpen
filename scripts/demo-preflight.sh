#!/usr/bin/env bash
set -euo pipefail

# Demo preflight for local recording sessions.
# Purpose: quick confidence check before hitting record.

DASHBOARD_URL="${DASHBOARD_URL:-http://127.0.0.1:3001}"
LANDING_URL="${LANDING_URL:-http://127.0.0.1:3000}"
N8N_URL="${N8N_URL:-http://127.0.0.1:5678}"

pass() { printf "✅ %s\n" "$1"; }
warn() { printf "⚠️  %s\n" "$1"; }
fail() { printf "❌ %s\n" "$1"; }

check_http() {
  local name="$1"
  local url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)
  if [[ "$code" == "200" || "$code" == "307" || "$code" == "308" ]]; then
    pass "$name reachable ($code): $url"
    return 0
  fi
  fail "$name not reachable (HTTP $code): $url"
  return 1
}

echo "Bullpen demo preflight"
echo "----------------------"

overall=0

check_http "Dashboard" "$DASHBOARD_URL" || overall=1
check_http "Landing" "$LANDING_URL" || overall=1
check_http "n8n" "$N8N_URL" || warn "n8n is optional for demo capture"

if git -C /home/mihbot/bullpen rev-parse --git-dir >/dev/null 2>&1; then
  branch=$(git -C /home/mihbot/bullpen rev-parse --abbrev-ref HEAD)
  dirty=$(git -C /home/mihbot/bullpen status --porcelain | wc -l | tr -d ' ')
  pass "Git branch: $branch"
  if [[ "$dirty" != "0" ]]; then
    warn "Working tree has $dirty uncommitted change(s)"
  else
    pass "Working tree clean"
  fi
else
  warn "Not in a git repo (skipping git checks)"
fi

if [[ -z "${BULLPEN_API_TOKEN:-}" ]]; then
  warn "BULLPEN_API_TOKEN is not set in this shell"
else
  pass "BULLPEN_API_TOKEN present"
fi

echo
if [[ "$overall" -eq 0 ]]; then
  echo "Ready to record."
else
  echo "Preflight found blocking issues. Fix items above before recording."
fi

exit "$overall"
