#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   scripts/preflight-production.sh /path/to/.env.production
# or
#   scripts/preflight-production.sh    (uses .env.production in cwd)

ENV_FILE="${1:-.env.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Env file not found: $ENV_FILE"
  echo "   Copy .env.production.example -> .env.production and fill values."
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

required=(
  NEXT_PUBLIC_LANDING_URL
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_CONVEX_URL
  NEXT_PUBLIC_CONVEX_SITE_URL
  OPENCLAW_GATEWAY_URL
  OPENCLAW_GATEWAY_TOKEN
  BULLPEN_WEBHOOK_URL
)

missing=0
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "❌ Missing required var: $key"
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

if [[ "$OPENCLAW_GATEWAY_URL" != ws://* && "$OPENCLAW_GATEWAY_URL" != wss://* ]]; then
  echo "❌ OPENCLAW_GATEWAY_URL must start with ws:// or wss://"
  exit 1
fi

if [[ "$NEXT_PUBLIC_LANDING_URL" != https://* ]]; then
  echo "❌ NEXT_PUBLIC_LANDING_URL must be https://..."
  exit 1
fi
if [[ "$NEXT_PUBLIC_APP_URL" != https://* ]]; then
  echo "❌ NEXT_PUBLIC_APP_URL must be https://..."
  exit 1
fi

echo "✅ Env validation passed"

echo "🔍 Build checks"
pnpm --filter @bullpen/landing build >/tmp/bullpen-landing-build.log 2>&1 || {
  echo "❌ landing build failed. See /tmp/bullpen-landing-build.log"
  exit 1
}
pnpm --filter @bullpen/dashboard build >/tmp/bullpen-dashboard-build.log 2>&1 || {
  echo "❌ dashboard build failed. See /tmp/bullpen-dashboard-build.log"
  exit 1
}

echo "✅ Build checks passed"
echo "🚀 Preflight complete. Ready for deploy steps in docs/production-launch-checklist.md"
