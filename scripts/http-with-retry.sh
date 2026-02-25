#!/bin/bash
# Shared HTTP helper with retry/backoff for Bullpen scripts.
# Usage:
#   source "$(dirname "$0")/http-with-retry.sh"
#   http_request_with_retry METHOD URL [BODY_JSON]
# Outputs response body to stdout on success; non-zero on failure.

set -euo pipefail

# Retry policy (override via env)
HTTP_RETRY_MAX_ATTEMPTS="${HTTP_RETRY_MAX_ATTEMPTS:-4}"   # total attempts (1 + retries)
HTTP_RETRY_BASE_DELAY="${HTTP_RETRY_BASE_DELAY:-0.5}"     # seconds
HTTP_RETRY_BACKOFF_FACTOR="${HTTP_RETRY_BACKOFF_FACTOR:-2}" # exponential factor
HTTP_RETRY_MAX_DELAY="${HTTP_RETRY_MAX_DELAY:-8}"         # seconds cap

should_retry_status() {
  local status="$1"
  case "$status" in
    408|409|425|429|500|502|503|504) return 0 ;;
    *) return 1 ;;
  esac
}

compute_backoff_delay() {
  local attempt="$1"
  awk -v base="$HTTP_RETRY_BASE_DELAY" \
      -v factor="$HTTP_RETRY_BACKOFF_FACTOR" \
      -v maxd="$HTTP_RETRY_MAX_DELAY" \
      -v n="$attempt" 'BEGIN {
        d=base;
        for (i=1; i<n; i++) d*=factor;
        if (d>maxd) d=maxd;
        srand();
        j=rand()*0.25;
        printf "%.3f", d+j;
      }'
}

http_request_with_retry() {
  local method="$1"
  local url="$2"
  local body="${3:-}"

  if [ -z "${BULLPEN_API_TOKEN:-}" ]; then
    echo '{"error":"BULLPEN_API_TOKEN not set"}' >&2
    return 1
  fi

  local attempt=1
  local tmp_body
  local tmp_err
  tmp_body="$(mktemp)"
  tmp_err="$(mktemp)"
  trap 'rm -f "$tmp_body" "$tmp_err"' RETURN

  while [ "$attempt" -le "$HTTP_RETRY_MAX_ATTEMPTS" ]; do
    local status

    if [ -n "$body" ]; then
      status=$(curl -sS -o "$tmp_body" -w "%{http_code}" \
        -X "$method" \
        -H "Authorization: Bearer ${BULLPEN_API_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "$body" \
        "$url" 2>"$tmp_err") || status="000"
    else
      status=$(curl -sS -o "$tmp_body" -w "%{http_code}" \
        -X "$method" \
        -H "Authorization: Bearer ${BULLPEN_API_TOKEN}" \
        "$url" 2>"$tmp_err") || status="000"
    fi

    if [[ "$status" =~ ^2[0-9][0-9]$ ]]; then
      cat "$tmp_body"
      return 0
    fi

    local retriable=false
    if [ "$status" = "000" ]; then
      retriable=true
    elif should_retry_status "$status"; then
      retriable=true
    fi

    if [ "$retriable" = false ] || [ "$attempt" -ge "$HTTP_RETRY_MAX_ATTEMPTS" ]; then
      if [ -s "$tmp_body" ]; then
        cat "$tmp_body" >&2
      elif [ -s "$tmp_err" ]; then
        cat "$tmp_err" >&2
      else
        echo "HTTP request failed with status $status" >&2
      fi
      return 1
    fi

    sleep "$(compute_backoff_delay "$attempt")"
    attempt=$((attempt + 1))
  done

  return 1
}
