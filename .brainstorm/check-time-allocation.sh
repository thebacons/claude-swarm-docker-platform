#!/bin/bash
# Enforces time allocation for Bacon's Constructive Brainstorming Approach

PHASE_FILE=".brainstorm/current-phase.txt"
START_TIME_FILE=".brainstorm/phase-start-time.txt"
TOTAL_TIME_FILE=".brainstorm/total-time-minutes.txt"

# Default total time: 2 hours (120 minutes)
TOTAL_TIME=${BRAINSTORM_TOTAL_TIME:-120}
echo $TOTAL_TIME > $TOTAL_TIME_FILE

# Time allocation percentages
declare -A PHASE_ALLOCATION=(
    ["PROBLEM_DEFINITION"]=10    # 10% - 12 minutes
    ["DATA_GATHERING"]=25        # 25% - 30 minutes
    ["ANALYSIS"]=25              # 25% - 30 minutes
    ["SOLUTION_GENERATION"]=20   # 20% - 24 minutes
    ["SOLUTION_SELECTION"]=10    # 10% - 12 minutes
    ["PLANNING_ACTION"]=10       # 10% - 12 minutes
)

# Get current phase and start time
CURRENT_PHASE=$(cat $PHASE_FILE 2>/dev/null || echo "UNKNOWN")
PHASE_START=$(cat $START_TIME_FILE 2>/dev/null || date +%s)
CURRENT_TIME=$(date +%s)

# Calculate elapsed time in minutes
ELAPSED_SECONDS=$((CURRENT_TIME - PHASE_START))
ELAPSED_MINUTES=$((ELAPSED_SECONDS / 60))

# Calculate allocated time for current phase
PHASE_PERCENT=${PHASE_ALLOCATION[$CURRENT_PHASE]:-10}
ALLOCATED_MINUTES=$((TOTAL_TIME * PHASE_PERCENT / 100))

# Calculate percentage complete
PERCENT_COMPLETE=$((ELAPSED_MINUTES * 100 / ALLOCATED_MINUTES))

# Warning thresholds
if [ $PERCENT_COMPLETE -ge 100 ]; then
    echo "⏰ TIME LIMIT EXCEEDED for $CURRENT_PHASE phase!"
    echo "   Allocated: ${ALLOCATED_MINUTES}min, Used: ${ELAPSED_MINUTES}min"
    echo "   Run: echo 'phase-complete' > .brainstorm/phase-complete.signal"
    exit 1
elif [ $PERCENT_COMPLETE -ge 75 ]; then
    echo "⚠️  75% time used for $CURRENT_PHASE phase (${ELAPSED_MINUTES}/${ALLOCATED_MINUTES}min)"
elif [ $PERCENT_COMPLETE -ge 50 ]; then
    echo "⏱️  50% time used for $CURRENT_PHASE phase (${ELAPSED_MINUTES}/${ALLOCATED_MINUTES}min)"
elif [ $PERCENT_COMPLETE -ge 25 ]; then
    echo "📊 25% time used for $CURRENT_PHASE phase (${ELAPSED_MINUTES}/${ALLOCATED_MINUTES}min)"
fi

# Special reminder for data gathering phase
if [[ $CURRENT_PHASE == "DATA_GATHERING" ]] && [ $ELAPSED_MINUTES -gt 5 ]; then
    if [ ! -f .brainstorm/data-sources.md ]; then
        echo "📚 REMINDER: Document your data sources in .brainstorm/data-sources.md"
    fi
fi

exit 0