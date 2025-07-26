#!/bin/bash
# Container Claude Wrapper - Adds anti-defeatist checks and MCP configuration

# Set up environment
export CLAUDE_MCP_CONFIG="/home/claude/workspace/.claude/settings.local.json"
export CLAUDE_HOOKS_CONFIG="/home/claude/workspace/hooks/config/claude-hooks.json"

# Check if MCP servers configuration exists
if [ -f "$CLAUDE_MCP_CONFIG" ]; then
    MCP_FLAG="--mcp-config $CLAUDE_MCP_CONFIG"
else
    MCP_FLAG=""
fi

# Check if hooks configuration exists
if [ -f "$CLAUDE_HOOKS_CONFIG" ]; then
    HOOKS_FLAG="--hooks-config $CLAUDE_HOOKS_CONFIG"
else
    HOOKS_FLAG=""
fi

# Function to challenge defeatist responses
challenge_defeatist() {
    local response="$1"
    
    # Check for defeatist patterns
    if echo "$response" | grep -qiE "(can't be done|impossible|fundamental limitation|doesn't work|not supported)"; then
        echo "⚠️ DEFEATIST PATTERN DETECTED!" >&2
        echo "Before accepting limitations:" >&2
        echo "1. Have you actually tested it?" >&2
        echo "2. What does the documentation say?" >&2
        echo "3. Are there alternative approaches?" >&2
        echo "" >&2
        
        # Trigger PM Agent if available
        if [ "$AGENT_ROLE" != "orchestrator" ] && [ -n "$PM_CONTAINER" ]; then
            docker exec "$PM_CONTAINER" claude $MCP_FLAG --dangerously-skip-permissions \
                "Main agent showing defeatist thinking. Challenge them to test and verify." 2>/dev/null &
        fi
    fi
}

# Launch Claude Code with all configurations
if [ "$1" = "challenge-mode" ]; then
    # Special mode that pipes output through defeatist detector
    shift
    claude $MCP_FLAG $HOOKS_FLAG --dangerously-skip-permissions "$@" 2>&1 | \
        while IFS= read -r line; do
            echo "$line"
            challenge_defeatist "$line"
        done
else
    # Normal mode with flags
    claude $MCP_FLAG $HOOKS_FLAG --dangerously-skip-permissions "$@"
fi