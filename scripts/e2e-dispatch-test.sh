#!/bin/bash
# End-to-end test for the Bullpen task dispatch pipeline
# Creates a task via Convex CLI, then runs it through the full dispatch cycle
#
# Usage: ./scripts/e2e-dispatch-test.sh
# Requires: BULLPEN_API_TOKEN env var, npx convex available

set -euo pipefail

SITE_URL="${CONVEX_SITE_URL:-https://ceaseless-hedgehog-380.convex.site}"
TOKEN="${BULLPEN_API_TOKEN:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$TOKEN" ]; then
  echo "❌ BULLPEN_API_TOKEN not set"
  exit 1
fi

echo "🧪 Bullpen E2E Dispatch Pipeline Test"
echo "======================================"

# Step 1: Create task via Convex CLI
echo ""
echo "1️⃣  Creating test task..."
TASK_ID=$(cd "$SCRIPT_DIR/../apps/dashboard" && npx convex run tasks:create \
  '{"title":"E2E Automated Test","description":"Automated pipeline test — create, poll, claim, log, complete.","taskType":"general"}' 2>/dev/null)
TASK_ID=$(echo "$TASK_ID" | tr -d '"')
echo "   ✅ Task created: $TASK_ID"

# Step 2: Poll for pending tasks
echo ""
echo "2️⃣  Polling for pending tasks..."
PENDING=$(curl -sf -H "Authorization: Bearer $TOKEN" "${SITE_URL}/api/tasks/pending")
FOUND=$(echo "$PENDING" | jq -r ".tasks[] | select(._id == \"$TASK_ID\") | ._id")
if [ "$FOUND" = "$TASK_ID" ]; then
  echo "   ✅ Task found in pending queue"
else
  echo "   ❌ Task NOT found in pending queue"
  echo "   Response: $PENDING"
  exit 1
fi

# Step 3: Claim task
echo ""
echo "3️⃣  Claiming task..."
CLAIM=$(curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":\"$TASK_ID\",\"sessionKey\":\"e2e-test\"}" \
  "${SITE_URL}/api/tasks/claim")
echo "   ✅ Claimed: $CLAIM"

# Step 4: Post log entry
echo ""
echo "4️⃣  Posting execution log..."
LOG=$(curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":\"$TASK_ID\",\"message\":\"E2E test executing...\",\"type\":\"info\"}" \
  "${SITE_URL}/api/tasks/log")
echo "   ✅ Log posted: $LOG"

# Step 5: Update live context
echo ""
echo "5️⃣  Updating live context..."
CTX=$(curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":\"$TASK_ID\",\"liveContext\":{\"phase\":\"testing\",\"progress\":\"50%\"}}" \
  "${SITE_URL}/api/tasks/context")
echo "   ✅ Context updated: $CTX"

# Step 6: Report completion
echo ""
echo "6️⃣  Reporting completion..."
RESULT=$(curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":\"$TASK_ID\",\"status\":\"completed\",\"result\":\"E2E test passed. All 6 pipeline stages verified.\"}" \
  "${SITE_URL}/api/tasks/result")
echo "   ✅ Result reported: $RESULT"

# Step 7: Verify no longer pending
echo ""
echo "7️⃣  Verifying task left pending queue..."
PENDING2=$(curl -sf -H "Authorization: Bearer $TOKEN" "${SITE_URL}/api/tasks/pending")
STILL=$(echo "$PENDING2" | jq -r ".tasks[] | select(._id == \"$TASK_ID\") | ._id")
if [ -z "$STILL" ]; then
  echo "   ✅ Task no longer in pending queue"
else
  echo "   ❌ Task still in pending queue!"
  exit 1
fi

echo ""
echo "🎉 All 7 steps passed! Pipeline is working end-to-end."
echo "   Task ID: $TASK_ID"
