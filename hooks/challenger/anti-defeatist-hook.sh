#!/bin/bash
# Anti-Defeatist Hook - Challenges premature conclusions
# Triggers when Claude says things like "can't", "impossible", "fundamental limitation"

# Detect defeatist patterns in Claude's response
DEFEATIST_PATTERNS=(
    "fundamental limitation"
    "architectural mismatch"
    "can't be done"
    "impossible"
    "not supported"
    "doesn't work"
    "no solution"
    "bash wrappers are the only way"
    "This is an architectural limitation"
)

# Check if response contains defeatist language
check_defeatist() {
    local response="$1"
    for pattern in "${DEFEATIST_PATTERNS[@]}"; do
        if echo "$response" | grep -qi "$pattern"; then
            return 0  # Found defeatist pattern
        fi
    done
    return 1  # No defeatist patterns
}

# Main hook logic
CLAUDE_RESPONSE="${CLAUDE_RESPONSE:-$(cat)}"

if check_defeatist "$CLAUDE_RESPONSE"; then
    echo "🚨 DEFEATIST PATTERN DETECTED! Triggering challenger..." >&2
    
    # Option 1: Direct challenge via echo
    echo "
⚠️ OBSERVER AGENT INTERVENTION:
Your response contains defeatist language. Before accepting that something 'can't be done':

1. Have you actually tested it?
2. Have you checked the official documentation?
3. Have you tried different approaches?
4. Are you making assumptions instead of verifying?

Remember: If it's recommended in docs, there MUST be a way.
Try harder. Test more. Question your assumptions.
" >&2

    # Option 2: Trigger PM Agent to challenge
    if command -v docker &> /dev/null; then
        docker exec casper-project-manager claude --mcp-config /home/claude/workspace/.claude/settings.local.json --dangerously-skip-permissions "
        The main Claude just said something can't be done. As PM, challenge this assumption:
        - Ask for proof of testing
        - Demand they check documentation
        - Push for alternative approaches
        - Don't accept 'it's impossible' without evidence
        
        Response to challenge: ${CLAUDE_RESPONSE:0:200}...
        " 2>/dev/null &
    fi
    
    # Option 3: Log for Observer Agent pattern detection
    echo "$(date): Defeatist pattern detected in response" >> /tmp/claude-patterns.log
fi

# Always pass through the original response
echo "$CLAUDE_RESPONSE"