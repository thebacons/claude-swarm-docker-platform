#!/bin/bash
# Advances to the next phase in Bacon's Constructive Brainstorming Approach

PHASE_FILE=".brainstorm/current-phase.txt"
START_TIME_FILE=".brainstorm/phase-start-time.txt"
PHASE_HISTORY_FILE=".brainstorm/phase-history.log"

# Define phase order
declare -a PHASES=(
    "PROBLEM_DEFINITION"
    "DATA_GATHERING"
    "ANALYSIS"
    "SOLUTION_GENERATION"
    "SOLUTION_SELECTION"
    "PLANNING_ACTION"
    "SSC_COLLECTION"
)

# Get current phase
CURRENT_PHASE=$(cat $PHASE_FILE 2>/dev/null || echo "PROBLEM_DEFINITION")
CURRENT_TIME=$(date +%s)
PHASE_START=$(cat $START_TIME_FILE 2>/dev/null || echo $CURRENT_TIME)
DURATION=$((CURRENT_TIME - PHASE_START))

# Log phase completion
echo "$(date +'%Y-%m-%d %H:%M:%S') | Completed: $CURRENT_PHASE | Duration: ${DURATION}s" >> $PHASE_HISTORY_FILE

# Find next phase
NEXT_PHASE=""
FOUND=0
for i in "${!PHASES[@]}"; do
    if [[ "${PHASES[$i]}" == "$CURRENT_PHASE" ]]; then
        NEXT_INDEX=$((i + 1))
        if [ $NEXT_INDEX -lt ${#PHASES[@]} ]; then
            NEXT_PHASE="${PHASES[$NEXT_INDEX]}"
        else
            NEXT_PHASE="COMPLETE"
        fi
        FOUND=1
        break
    fi
done

if [ $FOUND -eq 0 ]; then
    echo "❌ ERROR: Unknown phase: $CURRENT_PHASE"
    exit 1
fi

# Phase-specific validations and setup
case $CURRENT_PHASE in
    "PROBLEM_DEFINITION")
        if [ ! -f .brainstorm/problem-statement.md ]; then
            echo "❌ Cannot advance: problem-statement.md not found"
            exit 1
        fi
        echo "✅ Problem defined. Moving to Data Gathering phase."
        echo "📚 Remember: Allocate 25% of time to gather comprehensive data!"
        ;;
    
    "DATA_GATHERING")
        SOURCE_COUNT=$(grep -c '\[Source:' .brainstorm/data-sources.md 2>/dev/null || echo 0)
        if [ $SOURCE_COUNT -lt 3 ]; then
            echo "❌ Cannot advance: Need at least 3 cited sources (found: $SOURCE_COUNT)"
            exit 1
        fi
        echo "✅ Data gathered. Moving to Analysis phase."
        echo "🔍 Time to analyze deeply. Consider searching Ollama/HuggingFace for models!"
        ;;
    
    "ANALYSIS")
        if [ ! -f .brainstorm/analysis-qa.md ]; then
            echo "❌ Cannot advance: analysis-qa.md not found"
            exit 1
        fi
        echo "✅ Analysis complete. Moving to Solution Generation phase."
        echo "💡 Brainstorm freely! High temperature mode - no evaluation yet!"
        # Set high temperature flag
        echo "HIGH_TEMP" > .brainstorm/brainstorm-mode.flag
        ;;
    
    "SOLUTION_GENERATION")
        SOLUTION_COUNT=$(grep -c '^##' .brainstorm/solutions.md 2>/dev/null || echo 0)
        if [ $SOLUTION_COUNT -lt 5 ]; then
            echo "❌ Cannot advance: Need at least 5 solutions (found: $SOLUTION_COUNT)"
            exit 1
        fi
        rm -f .brainstorm/brainstorm-mode.flag
        echo "✅ Solutions generated. Moving to Solution Selection phase."
        echo "🗳️  Time to evaluate and vote on solutions!"
        ;;
    
    "SOLUTION_SELECTION")
        if [ ! -f .brainstorm/selected-solutions.md ]; then
            echo "❌ Cannot advance: selected-solutions.md not found (top 3 solutions)"
            exit 1
        fi
        echo "✅ Solutions selected. Moving to Planning & Action phase."
        echo "📋 Create detailed implementation plan and test it!"
        ;;
    
    "PLANNING_ACTION")
        if [ ! -f .brainstorm/solution-tests-passed.flag ]; then
            echo "⚠️  WARNING: Solutions not tested. Testing is required!"
        fi
        echo "✅ Planning complete. Moving to SSC Collection phase."
        echo "📝 Time to capture learnings: STOP/START/CONTINUE"
        ;;
    
    "SSC_COLLECTION")
        if [ ! -f .brainstorm/ssc-collection.md ]; then
            echo "❌ Cannot complete: ssc-collection.md not found"
            exit 1
        fi
        echo "🎉 Brainstorming session complete!"
        echo "📊 Session summary saved to .brainstorm/session-summary.md"
        # Generate session summary
        bash .brainstorm/generate-summary.sh
        ;;
esac

# Update phase and reset timer
if [[ $NEXT_PHASE != "COMPLETE" ]]; then
    echo $NEXT_PHASE > $PHASE_FILE
    date +%s > $START_TIME_FILE
    echo "➡️  Advanced to phase: $NEXT_PHASE"
else
    echo "COMPLETE" > $PHASE_FILE
    echo "✅ All phases complete! Great brainstorming session!"
fi

# Clean up signal file
rm -f .brainstorm/phase-complete.signal

exit 0