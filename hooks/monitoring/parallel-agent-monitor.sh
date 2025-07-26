#!/bin/bash
# Parallel Agent Monitor - Tracks and manages subagent spawning

# Configuration
MAX_SUBAGENTS="${MAX_SUBAGENTS:-15}"
SUBAGENT_LOG="/home/claude/workspace/logs/subagent-activity.log"
RESOURCE_LOG="/home/claude/workspace/logs/resource-usage.log"

# Initialize logs
mkdir -p "$(dirname "$SUBAGENT_LOG")"

# Function to count active subagents
count_active_subagents() {
    pgrep -f "claude.*subagent" | wc -l
}

# Function to check system resources
check_resources() {
    local mem_available=$(free -m | awk '/^Mem:/ {print $7}')
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
    
    echo "Memory Available: ${mem_available}MB, CPU Load: ${cpu_load}"
}

# Main monitoring logic
ACTIVE_AGENTS=$(count_active_subagents)

# Log subagent activity
echo "$(date) | Active subagents: $ACTIVE_AGENTS | Event: ${CLAUDE_AGENT_EVENT:-check}" >> "$SUBAGENT_LOG"

# Check if approaching limits
if [ "$ACTIVE_AGENTS" -ge "$MAX_SUBAGENTS" ]; then
    echo "⚠️ SUBAGENT LIMIT REACHED!" >&2
    echo "Currently running: $ACTIVE_AGENTS subagents (max: $MAX_SUBAGENTS)" >&2
    echo "Wait for some to complete before spawning more." >&2
    exit 1
elif [ "$ACTIVE_AGENTS" -ge $(( MAX_SUBAGENTS * 80 / 100 )) ]; then
    echo "📊 Subagent usage: $ACTIVE_AGENTS/$MAX_SUBAGENTS (80% capacity)" >&2
fi

# Check resources when spawning
if [ "$CLAUDE_AGENT_EVENT" = "spawn" ]; then
    RESOURCES=$(check_resources)
    echo "$(date) | Resources: $RESOURCES" >> "$RESOURCE_LOG"
    
    # Extract memory value
    MEM_AVAILABLE=$(echo "$RESOURCES" | grep -oP '\d+(?=MB)')
    
    if [ "$MEM_AVAILABLE" -lt 1000 ]; then
        echo "⚠️ LOW MEMORY WARNING!" >&2
        echo "Available: ${MEM_AVAILABLE}MB" >&2
        echo "Consider reducing parallel agents." >&2
    fi
fi

# Suggest parallel execution for complex tasks
if [ "$ACTIVE_AGENTS" -eq 0 ] && [ -n "$CLAUDE_COMPLEX_TASK" ]; then
    echo "💡 No subagents active. Use Task tool to spawn up to 5 for:" >&2
    echo "- Data collection (parallel research)" >&2
    echo "- Analysis (concurrent processing)" >&2
    echo "- Solution generation (diverse ideas)" >&2
fi

exit 0