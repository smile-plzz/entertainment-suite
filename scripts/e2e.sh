#!/bin/bash

LOG_FILE="vercel_dev.log"

echo "Starting Vercel development server for E2E tests (logging to $LOG_FILE)..."
# Start vercel dev in the background, redirecting output to LOG_FILE
vercel dev --yes > "$LOG_FILE" 2>&1 &
VERCEL_PID=$!

echo "Vercel PID: $VERCEL_PID"

# Give the server some time to start
sleep 20

echo "Running E2E tests..."

# Test 1: Check if the main page loads and contains expected content
RESPONSE=$(curl -s http://localhost:3000/)

if echo "$RESPONSE" | grep -q "Entertainment Suite"; then
  echo "Test 1 (Main Page Content): PASS"
  TEST_RESULT=0
else
  echo "Test 1 (Main Page Content): FAIL"
  TEST_RESULT=1
fi

# Shut down the Vercel server
echo "Attempting to stop Vercel server with PID $VERCEL_PID..."
kill $VERCEL_PID
sleep 2 # Give it a moment to shut down
if kill -0 $VERCEL_PID 2>/dev/null; then
    echo "Vercel server still running, forcing kill..."
    kill -9 $VERCEL_PID
fi
echo "Vercel development server stopped."

# Report overall test result
exit $TEST_RESULT