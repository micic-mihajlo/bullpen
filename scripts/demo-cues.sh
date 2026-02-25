#!/usr/bin/env bash
set -euo pipefail

# Demo cue timer for the Bullpen recording loop.
# Helps keep pacing consistent across takes.

TOTAL_SECONDS="30"
SCRIPTED="0"

usage() {
  cat <<'EOF'
Usage: ./scripts/demo-cues.sh [options]

Options:
  --duration <seconds>   Total duration (default: 30)
  --scripted             Print action + narration prompts at each beat
  -h, --help             Show help

Examples:
  ./scripts/demo-cues.sh
  ./scripts/demo-cues.sh --duration 30 --scripted
EOF
}

is_positive_int() {
  [[ "$1" =~ ^[0-9]+$ ]] && [[ "$1" -gt 0 ]]
}

# Backward compatibility: allow first positional arg as duration.
if [[ ${1:-} =~ ^[0-9]+$ ]]; then
  TOTAL_SECONDS="$1"
  shift
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --duration)
      TOTAL_SECONDS="${2:-}"
      shift 2
      ;;
    --scripted)
      SCRIPTED="1"
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

announce() {
  local t="$1"
  case "$t" in
    0)
      echo "🎬 0s  | Beat 1: Command Center"
      if [[ "$SCRIPTED" == "1" ]]; then
        echo "    action: hover active worker row"
        echo "    line: this is your command center. active workers, step progress, and anything needing your review, all at a glance."
      fi
      ;;
    8)
      echo "➡️  8s  | Beat 2: Task Detail panel"
      if [[ "$SCRIPTED" == "1" ]]; then
        echo "    action: click task, scroll thread"
        echo "    line: click into any task to see step-by-step progress, agent output, and the full conversation thread."
      fi
      ;;
    16)
      echo "➡️ 16s | Beat 3: Review + Steering"
      if [[ "$SCRIPTED" == "1" ]]; then
        echo "    action: show approve/reject, type steering message"
        echo "    line: review agent work, approve steps, or steer the worker mid-task with natural language."
      fi
      ;;
    22)
      echo "➡️ 22s | Beat 4: Pipeline + Projects"
      if [[ "$SCRIPTED" == "1" ]]; then
        echo "    action: close panel, scroll pipeline + projects"
        echo "    line: track your pipeline from queue to done, across all client projects."
      fi
      ;;
    28)
      echo "➡️ 28s | Beat 5: Close on header"
      if [[ "$SCRIPTED" == "1" ]]; then
        echo "    action: return to header, green status dot visible"
        echo "    line: bullpen. your ai workforce, managed."
      fi
      ;;
    *)
      ;;
  esac
}

printf "\nBullpen demo cue timer (%ss)\n" "$TOTAL_SECONDS"
printf "Mode: %s\n" "$([[ "$SCRIPTED" == "1" ]] && echo "scripted" || echo "timing-only")"
printf "Press Ctrl+C to stop.\n\n"

start_ts=$(date +%s)
for ((elapsed=0; elapsed<=TOTAL_SECONDS; elapsed++)); do
  announce "$elapsed"

  remaining=$((TOTAL_SECONDS - elapsed))
  printf "\r⏱️  %2ss elapsed | %2ss remaining" "$elapsed" "$remaining"

  if [[ "$elapsed" -lt "$TOTAL_SECONDS" ]]; then
    sleep 1
  fi
done

end_ts=$(date +%s)
actual=$((end_ts - start_ts))
printf "\n\n✅ done in %ss (target: %ss)\n" "$actual" "$TOTAL_SECONDS"
