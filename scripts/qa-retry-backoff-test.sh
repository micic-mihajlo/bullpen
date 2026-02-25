#!/bin/bash
# Failure-mode + retry/backoff validation for Bullpen HTTP scripts.
# Spins up a local mock server that injects transient errors.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MOCK_PORT="${MOCK_PORT:-18891}"
MOCK_URL="http://127.0.0.1:${MOCK_PORT}"

export CONVEX_SITE_URL="$MOCK_URL"
export BULLPEN_API_TOKEN="test-token"
export HTTP_RETRY_MAX_ATTEMPTS=4
export HTTP_RETRY_BASE_DELAY=0.05
export HTTP_RETRY_BACKOFF_FACTOR=2
export HTTP_RETRY_MAX_DELAY=0.2

STATE_FILE="$(mktemp)"
SERVER_LOG="$(mktemp)"

cleanup() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$STATE_FILE" "$SERVER_LOG"
}
trap cleanup EXIT

cat >"$STATE_FILE" <<'JSON'
{"pending":0,"claim":0,"log":0,"result":0}
JSON

python3 - <<'PY' "$MOCK_PORT" "$STATE_FILE" >"$SERVER_LOG" 2>&1 &
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

port = int(sys.argv[1])
state_path = sys.argv[2]

RETRIABLE = {"pending": 2, "claim": 1, "log": 2, "result": 1}


def load_state():
    with open(state_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_state(s):
    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(s, f)


class H(BaseHTTPRequestHandler):
    def _auth_ok(self):
        return self.headers.get("Authorization") == "Bearer test-token"

    def _send(self, code, obj):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(obj).encode("utf-8"))

    def do_GET(self):
        if not self._auth_ok():
            return self._send(401, {"error": "Unauthorized"})
        if self.path != "/api/tasks/pending":
            return self._send(404, {"error": "Not found"})

        s = load_state()
        s["pending"] += 1
        save_state(s)
        if s["pending"] <= RETRIABLE["pending"]:
            return self._send(503, {"error": "transient pending failure", "attempt": s["pending"]})
        return self._send(200, {"tasks": []})

    def do_POST(self):
        if not self._auth_ok():
            return self._send(401, {"error": "Unauthorized"})

        s = load_state()
        if self.path == "/api/tasks/claim":
            s["claim"] += 1
            save_state(s)
            if s["claim"] <= RETRIABLE["claim"]:
                return self._send(500, {"error": "transient claim failure", "attempt": s["claim"]})
            return self._send(200, {"success": True})
        if self.path == "/api/tasks/log":
            s["log"] += 1
            save_state(s)
            if s["log"] <= RETRIABLE["log"]:
                return self._send(429, {"error": "rate limited", "attempt": s["log"]})
            return self._send(200, {"success": True})
        if self.path == "/api/tasks/result":
            s["result"] += 1
            save_state(s)
            if s["result"] <= RETRIABLE["result"]:
                return self._send(502, {"error": "bad gateway", "attempt": s["result"]})
            return self._send(200, {"success": True})
        return self._send(404, {"error": "Not found"})

    def log_message(self, *_):
        return

HTTPServer(("127.0.0.1", port), H).serve_forever()
PY
SERVER_PID=$!

sleep 0.2

"$SCRIPT_DIR/dispatch-tasks.sh" >/dev/null
"$SCRIPT_DIR/claim-task.sh" "jt1" >/dev/null
"$SCRIPT_DIR/post-log.sh" "jt1" "hello" "info" >/dev/null
"$SCRIPT_DIR/report-result.sh" "jt1" "completed" "ok" >/dev/null

PENDING_COUNT=$(python3 - <<'PY' "$STATE_FILE"
import json,sys
print(json.load(open(sys.argv[1]))["pending"])
PY
)
CLAIM_COUNT=$(python3 - <<'PY' "$STATE_FILE"
import json,sys
print(json.load(open(sys.argv[1]))["claim"])
PY
)
LOG_COUNT=$(python3 - <<'PY' "$STATE_FILE"
import json,sys
print(json.load(open(sys.argv[1]))["log"])
PY
)
RESULT_COUNT=$(python3 - <<'PY' "$STATE_FILE"
import json,sys
print(json.load(open(sys.argv[1]))["result"])
PY
)

[ "$PENDING_COUNT" -eq 3 ]
[ "$CLAIM_COUNT" -eq 2 ]
[ "$LOG_COUNT" -eq 3 ]
[ "$RESULT_COUNT" -eq 2 ]

echo "PASS: retry/backoff recovered from transient failures (pending=$PENDING_COUNT claim=$CLAIM_COUNT log=$LOG_COUNT result=$RESULT_COUNT)"

# Non-retriable auth failure should fail quickly
set +e
BULLPEN_API_TOKEN="wrong-token" "$SCRIPT_DIR/dispatch-tasks.sh" >/dev/null 2>&1
RC=$?
set -e
if [ "$RC" -eq 0 ]; then
  echo "FAIL: expected unauthorized call to fail"
  exit 1
fi

echo "PASS: non-retriable unauthorized failure is not masked"
