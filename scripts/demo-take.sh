#!/usr/bin/env bash
set -euo pipefail

# One-command helper for local Bullpen demo recording takes.
# Runs preflight, optionally opens tabs, then starts a short countdown + cue timer.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRECHECK_SCRIPT="$ROOT_DIR/scripts/demo-preflight.sh"
CUES_SCRIPT="$ROOT_DIR/scripts/demo-cues.sh"

TOTAL_SECONDS="30"
COUNTDOWN_SECONDS="5"
OPEN_TABS="0"
SKIP_PREFLIGHT="0"
SCRIPTED_CUES="0"

usage() {
  cat <<'EOF'
Usage: ./scripts/demo-take.sh [options]

Options:
  --duration <seconds>     Cue timer duration (default: 30)
  --countdown <seconds>    Countdown before cues start (default: 5)
  --open-tabs              Open landing + dashboard in default browser
  --skip-preflight         Skip demo-preflight check
  --scripted-cues          Include action + narration prompts at beat changes
  -h, --help               Show help

Examples:
  ./scripts/demo-take.sh
  ./scripts/demo-take.sh --open-tabs --scripted-cues
  ./scripts/demo-take.sh --duration 45 --countdown 8
EOF
}

is_positive_int() {
  [[ "$1" =~ ^[0-9]+$ ]] && [[ "$1" -gt 0 ]]
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --duration)
      TOTAL_SECONDS="${2:-}"
      shift 2
      ;;
    --countdown)
      COUNTDOWN_SECONDS="${2:-}"
      shift 2
      ;;
    --open-tabs)
      OPEN_TABS="1"
      shift
      ;;
    --skip-preflight)
      SKIP_PREFLIGHT="1"
      shift
      ;;
    --scripted-cues)
      SCRIPTED_CUES="1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1"
      usage
      exit 1
      ;;
  esac
done

if ! is_positive_int "$TOTAL_SECONDS"; then
  echo "--duration must be a positive integer"
  exit 1
fi

if ! is_positive_int "$COUNTDOWN_SECONDS"; then
  echo "--countdown must be a positive integer"
  exit 1
fi

DASHBOARD_URL="${DASHBOARD_URL:-http://127.0.0.1:3001}"
LANDING_URL="${LANDING_URL:-http://127.0.0.1:3000}"

open_url() {
  local url="$1"

  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
    return 0
  fi

  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
    return 0
  fi

  echo "⚠️  Could not find xdg-open/open. Open manually: $url"
}

echo "Bullpen demo take helper"
echo "------------------------"
echo "Duration:  ${TOTAL_SECONDS}s"
echo "Countdown: ${COUNTDOWN_SECONDS}s"
echo "Cues:      $([[ \"$SCRIPTED_CUES\" == \"1\" ]] && echo "scripted" || echo "timing-only")"
echo

if [[ "$SKIP_PREFLIGHT" == "0" ]]; then
  if [[ ! -x "$PRECHECK_SCRIPT" ]]; then
    echo "Missing or non-executable preflight script: $PRECHECK_SCRIPT"
    exit 1
  fi

  echo "Running preflight..."
  "$PRECHECK_SCRIPT"
  echo
fi

if [[ "$OPEN_TABS" == "1" ]]; then
  echo "Opening browser tabs..."
  open_url "$LANDING_URL"
  open_url "$DASHBOARD_URL"
  sleep 1
  echo
fi

echo "Get your recorder focused now."
for ((n=COUNTDOWN_SECONDS; n>=1; n--)); do
  printf "Starting in %ss...\r" "$n"
  sleep 1
done
printf "%-40s\n" ""

echo "🎥 recording run started"
if [[ "$SCRIPTED_CUES" == "1" ]]; then
  "$CUES_SCRIPT" --duration "$TOTAL_SECONDS" --scripted
else
  "$CUES_SCRIPT" --duration "$TOTAL_SECONDS"
fi

echo
echo "Tip: run again for Take B/C, then pick best timeline in post."
