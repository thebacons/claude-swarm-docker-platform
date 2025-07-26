#!/bin/bash
# Periodic check for phase time limits in Bacon's Constructive Brainstorming

PHASE_FILE=".brainstorm/current-phase.txt"
START_TIME_FILE=".brainstorm/phase-start-time.txt"
TOTAL_TIME_FILE=".brainstorm/total-time-minutes.txt"
WARNING_FILE=".brainstorm/last-warning.txt"

# Get total allocated time
TOTAL_TIME=$(cat $TOTAL_TIME_FILE 2>/dev/null || echo 120)

# Time allocation percentages
declare -A PHASE_ALLOCATION=(
    ["PROBLEM_DEFINITION"]=10
    ["DATA_GATHERING"]=25
    ["ANALYSIS"]=25
    ["SOLUTION_GENERATION"]=20
    ["SOLUTION_SELECTION"]=10
    ["PLANNING_ACTION"]=10
)

# Get current phase and times
CURRENT_PHASE=$(cat $PHASE_FILE 2>/dev/null || echo "UNKNOWN")
PHASE_START=$(cat $START_TIME_FILE 2>/dev/null || date +%s)
CURRENT_TIME=$(date +%s)
LAST_WARNING=$(cat $WARNING_FILE 2>/dev/null || echo 0)

# Skip if phase is complete or unknown
if [[ $CURRENT_PHASE == "COMPLETE" ]] || [[ $CURRENT_PHASE == "UNKNOWN" ]]; then
    exit 0
fi

# Calculate times
ELAPSED_SECONDS=$((CURRENT_TIME - PHASE_START))
ELAPSED_MINUTES=$((ELAPSED_SECONDS / 60))
PHASE_PERCENT=${PHASE_ALLOCATION[$CURRENT_PHASE]:-10}
ALLOCATED_MINUTES=$((TOTAL_TIME * PHASE_PERCENT / 100))
REMAINING_MINUTES=$((ALLOCATED_MINUTES - ELAPSED_MINUTES))
PERCENT_COMPLETE=$((ELAPSED_MINUTES * 100 / ALLOCATED_MINUTES))

# Don't repeat warnings too frequently (5 minute cooldown)
SECONDS_SINCE_WARNING=$((CURRENT_TIME - LAST_WARNING))
if [ $SECONDS_SINCE_WARNING -lt 300 ]; then
    exit 0
fi

# Phase-specific reminders and warnings
case $CURRENT_PHASE in
    "DATA_GATHERING")
        if [ $PERCENT_COMPLETE -ge 50 ] && [ ! -f .brainstorm/questions.md ]; then
            echo "❓ REMINDER: Document any questions in .brainstorm/questions.md"
            echo $CURRENT_TIME > $WARNING_FILE
        fi
        ;;
    
    "ANALYSIS")
        if [ $PERCENT_COMPLETE -ge 30 ] && [ ! -f .brainstorm/model-search.log ]; then
            echo "🤖 REMINDER: Search Ollama/HuggingFace for relevant AI models!"
            echo "   Run: ollama search [topic] > .brainstorm/model-search.log"
            echo $CURRENT_TIME > $WARNING_FILE
        fi
        if [ $PERCENT_COMPLETE -ge 70 ] && [ ! -f .brainstorm/analysis-qa.md ]; then
            echo "✅ REMINDER: Perform QA on your analysis before proceeding!"
            echo $CURRENT_TIME > $WARNING_FILE
        fi
        ;;
    
    "SOLUTION_GENERATION")
        if [ -f .brainstorm/brainstorm-mode.flag ]; then
            echo "💡 BRAINSTORM MODE: Remember - no criticism! All ideas welcome!"
        fi
        SOLUTION_COUNT=$(grep -c '^##' .brainstorm/solutions.md 2>/dev/null || echo 0)
        if [ $PERCENT_COMPLETE -ge 50 ] && [ $SOLUTION_COUNT -lt 3 ]; then
            echo "💭 Only $SOLUTION_COUNT solutions so far. Keep brainstorming!"
            echo $CURRENT_TIME > $WARNING_FILE
        fi
        ;;
    
    "SOLUTION_SELECTION")
        if [ $PERCENT_COMPLETE -ge 50 ] && [ ! -f .brainstorm/solution-votes.json ]; then
            echo "🗳️  REMINDER: Start voting process for solutions!"
            echo $CURRENT_TIME > $WARNING_FILE
        fi
        ;;
    
    "PLANNING_ACTION")
        if [ $PERCENT_COMPLETE -ge 80 ] && [ ! -f .brainstorm/solution-tests-passed.flag ]; then
            echo "🧪 URGENT: Test your solution before time runs out!"
            echo $CURRENT_TIME > $WARNING_FILE
        fi
        ;;
esac

# General time warnings
if [ $REMAINING_MINUTES -le 5 ] && [ $REMAINING_MINUTES -gt 0 ]; then
    echo "⏰ URGENT: Only $REMAINING_MINUTES minutes remaining in $CURRENT_PHASE phase!"
    echo "   Consider advancing: echo 'phase-complete' > .brainstorm/phase-complete.signal"
    echo $CURRENT_TIME > $WARNING_FILE
elif [ $PERCENT_COMPLETE -ge 100 ]; then
    echo "🚨 TIME EXCEEDED for $CURRENT_PHASE! ($ELAPSED_MINUTES/$ALLOCATED_MINUTES min)"
    echo "   Advance immediately: echo 'phase-complete' > .brainstorm/phase-complete.signal"
    echo $CURRENT_TIME > $WARNING_FILE
fi

exit 0