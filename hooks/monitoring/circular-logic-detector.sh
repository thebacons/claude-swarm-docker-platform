#!/bin/bash
# Circular Logic Detector - Tracks repeated failed approaches

# Pattern history file
PATTERN_HISTORY="/home/claude/workspace/logs/approach-history.log"
mkdir -p "$(dirname "$PATTERN_HISTORY")"

# Extract current approach from Claude's response
CURRENT_APPROACH="${CLAUDE_CURRENT_APPROACH:-$1}"

# Check if this approach has been tried before
if [ -n "$CURRENT_APPROACH" ]; then
    # Count how many times this approach appears in history
    REPEAT_COUNT=$(grep -c "$CURRENT_APPROACH" "$PATTERN_HISTORY" 2>/dev/null || echo 0)
    
    if [ "$REPEAT_COUNT" -ge 2 ]; then
        echo "🔄 CIRCULAR REASONING DETECTED!" >&2
        echo "You've tried this approach $REPEAT_COUNT times already." >&2
        echo "" >&2
        echo "Previous approaches that failed:" >&2
        tail -5 "$PATTERN_HISTORY" | nl >&2
        echo "" >&2
        echo "REQUIRED: Try a completely different strategy!" >&2
        echo "Consider:" >&2
        echo "- Different tools or methods" >&2
        echo "- Questioning your assumptions" >&2
        echo "- Using Task tool for parallel exploration" >&2
        
        # Trigger PM Agent if available
        if [ -n "$PM_CONTAINER" ]; then
            docker exec "$PM_CONTAINER" claude --dangerously-skip-permissions \
                "Main agent stuck in circular reasoning. Force different approach!" 2>/dev/null &
        fi
        
        exit 1  # Block the repetitive approach
    fi
    
    # Log this approach
    echo "$(date) | $CURRENT_APPROACH" >> "$PATTERN_HISTORY"
fi

# Clean up old entries (keep last 100)
if [ -f "$PATTERN_HISTORY" ] && [ $(wc -l < "$PATTERN_HISTORY") -gt 100 ]; then
    tail -100 "$PATTERN_HISTORY" > "$PATTERN_HISTORY.tmp"
    mv "$PATTERN_HISTORY.tmp" "$PATTERN_HISTORY"
fi

exit 0