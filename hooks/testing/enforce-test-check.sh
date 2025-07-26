#!/bin/bash
# Test Enforcement Hook - Blocks task completion without tests
# Triggers when marking tasks as "completed" or "done"

# Extract task content from Claude's action
TASK_CONTENT="${CLAUDE_TASK_CONTENT:-}"
TASK_STATUS="${CLAUDE_TASK_STATUS:-}"

# Check if trying to mark something as completed
if [[ "$TASK_STATUS" == "completed" ]] || [[ "$TASK_STATUS" == "done" ]]; then
    # Look for test indicators in the task
    if echo "$TASK_CONTENT" | grep -qiE "(TUT|FUT|SIT|RGT|test)"; then
        # This is a test task - check if tests actually ran
        TEST_LOG="/home/claude/workspace/logs/test-results.log"
        
        # Check if recent test results exist (within last 5 minutes)
        if [ -f "$TEST_LOG" ]; then
            RECENT_TESTS=$(find "$TEST_LOG" -mmin -5 2>/dev/null)
            if [ -z "$RECENT_TESTS" ]; then
                echo "⚠️ TEST ENFORCEMENT: No recent test results found!" >&2
                echo "You must run tests before marking test tasks as completed." >&2
                echo "Required: TUT, FUT, SIT, RGT" >&2
                exit 1  # Block the action
            fi
        else
            echo "⚠️ TEST ENFORCEMENT: No test log found!" >&2
            echo "Run tests and log results before marking as complete." >&2
            exit 1  # Block the action
        fi
    fi
    
    # Check for development tasks that should have tests
    if echo "$TASK_CONTENT" | grep -qiE "(implement|create|fix|update|refactor)"; then
        echo "⚠️ REMINDER: Have you run all required tests?" >&2
        echo "- TUT (Technical Unit Test)" >&2
        echo "- FUT (Functional Unit Test)" >&2
        echo "- SIT (System Integration Test)" >&2
        echo "- RGT (Regression Test)" >&2
        # Don't block, just remind
    fi
fi

# Always allow the action to proceed (unless blocked above)
exit 0