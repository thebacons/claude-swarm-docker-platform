#!/bin/bash
# Context Manager Hook - Prevents token overflow and suggests compaction

# Get current token count (approximate)
get_token_count() {
    local log_file="${CLAUDE_SESSION_LOG:-/tmp/claude-session.log}"
    if [ -f "$log_file" ]; then
        wc -w < "$log_file" 2>/dev/null || echo 0
    else
        echo 0
    fi
}

# Get warning and critical thresholds from environment
WARNING_THRESHOLD="${CONTEXT_WARNING_THRESHOLD:-90000}"
CRITICAL_THRESHOLD="${CONTEXT_CRITICAL_THRESHOLD:-95000}"

# Check current usage
CURRENT_TOKENS=$(get_token_count)

# Determine alert level
if [ "$CURRENT_TOKENS" -gt "$CRITICAL_THRESHOLD" ]; then
    echo "🚨 CRITICAL: Token usage at ${CURRENT_TOKENS}/100k!" >&2
    echo "IMMEDIATE ACTION REQUIRED:" >&2
    echo "1. Use /compact to reduce context" >&2
    echo "2. Save current work and start new session" >&2
    echo "3. Risk of session failure if continued!" >&2
    exit 1  # Block further operations
elif [ "$CURRENT_TOKENS" -gt "$WARNING_THRESHOLD" ]; then
    echo "⚠️ WARNING: Token usage at ${CURRENT_TOKENS}/100k ($(( CURRENT_TOKENS * 100 / 100000 ))%)" >&2
    echo "Recommend using /compact soon" >&2
fi

# Log usage for tracking
echo "$(date) | Tokens: $CURRENT_TOKENS" >> /home/claude/workspace/logs/context-usage.log

exit 0