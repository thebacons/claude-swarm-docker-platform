#!/bin/bash
# Setup script for Bacon's Constructive Brainstorming Approach

# Check if problem description provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Problem description\""
    echo "Example: $0 \"Implement autonomous AI agents for code review\""
    exit 1
fi

PROBLEM_DESC="$1"
SESSION_ID=$(date +%Y%m%d-%H%M%S)

echo "🧠 Initializing Bacon's Constructive Brainstorming Session"
echo "📋 Problem: $PROBLEM_DESC"
echo "🔖 Session ID: $SESSION_ID"
echo ""

# Create directory structure
echo "📁 Creating brainstorm directory structure..."
mkdir -p .brainstorm/{agents,archives}
mkdir -p .brainstorm-archives
mkdir -p ~/.brainstorm-learnings

# Copy scripts if they don't exist
if [ ! -f .brainstorm/check-time-allocation.sh ]; then
    echo "📄 Copying brainstorm scripts..."
    # Scripts would be copied from a template directory in production
    # For now, we'll create placeholders
    touch .brainstorm/check-time-allocation.sh
    touch .brainstorm/advance-phase.sh
    touch .brainstorm/check-phase-time.sh
    chmod +x .brainstorm/*.sh
fi

# Initialize phase tracking
echo "PROBLEM_DEFINITION" > .brainstorm/current-phase.txt
date +%s > .brainstorm/phase-start-time.txt
echo "$SESSION_ID" > .brainstorm/session-id.txt

# Create problem statement template
cat > .brainstorm/problem-statement.md << EOF
# Problem Statement
**Session ID**: $SESSION_ID  
**Date**: $(date +'%Y-%m-%d %H:%M')  
**Initial Description**: $PROBLEM_DESC

## Problem Definition

### What is the problem?
[Describe the problem in detail. What is happening? What should be happening?]

### Who is affected?
[Who experiences this problem? How does it impact them?]

### When does it occur?
[When does this problem happen? Is it constant or intermittent?]

### Where does it occur?
[In what context, system, or location does this happen?]

### Why is it important to solve?
[What are the consequences of not solving this? What value does solving it bring?]

### Success Criteria
[How will we know when the problem is solved? What metrics indicate success?]

### Constraints
[What limitations do we have? Budget, time, technology, resources?]

---
*Remember: Spend 10% of your time (about 12 minutes in a 2-hour session) clearly defining the problem before proceeding to data gathering.*
EOF

# Create template files for each phase
echo "📄 Creating phase templates..."

# Data sources template
cat > .brainstorm/data-sources.md << EOF
# Data Sources
**Phase**: Data Gathering  
**Time Allocation**: 25% (30 minutes for 2-hour session)  

## Sources
[Document all sources with citations in format: [Source: URL or Reference]]

### External Research
[Source: URL]
- Key findings...

### Internal Data
[Source: Dashboard/System name]
- Metrics...

### Expert Opinions
[Source: Person/Team name]
- Insights...

### Similar Problems/Solutions
[Source: Case study/Documentation]
- Relevant patterns...

## Key Questions Identified
[List questions that need answers - document in questions.md]
EOF

# Analysis template
cat > .brainstorm/analysis.md << EOF
# Analysis
**Phase**: Analysis  
**Time Allocation**: 25% (30 minutes for 2-hour session)  

## Key Findings

### Root Causes

### Patterns Identified

### Technical Constraints

### Available Resources

## Model/Tool Research
[Document any Ollama/HuggingFace model searches in model-search.log]

## Assumptions
[List assumptions that need validation]

## Risks
[Identify potential risks in solving this problem]
EOF

# Solutions template
cat > .brainstorm/solutions.md << EOF
# Solution Ideas
**Phase**: Solution Generation  
**Time Allocation**: 20% (24 minutes for 2-hour session)  
**Mode**: BRAINSTORMING - All ideas welcome, no criticism!

## Solution 1: [Name]
[Description - be creative!]

## Solution 2: [Name]
[Description - think outside the box!]

## Solution 3: [Name]
[Description - consider unconventional approaches!]

## Solution 4: [Name]
[Description - what would a different industry do?]

## Solution 5: [Name]
[Description - if resources were unlimited?]

[Add more solutions - aim for at least 5-10 ideas!]
EOF

# SSC template
cat > .brainstorm/ssc-collection.md << EOF
# STOP / START / CONTINUE Collection
**Session ID**: $SESSION_ID  
**Date**: $(date +'%Y-%m-%d')  

## STOP
*What should we stop doing that didn't work well?*
- 

## START  
*What should we start doing based on this session?*
- 

## CONTINUE
*What worked well that we should keep doing?*
- 

## Key Learnings
*Important insights from this session*
1. 
2. 
3. 

## Recommendations for Future Sessions
*How can we improve the brainstorming process?*
- 
EOF

# Create helper scripts
cat > .brainstorm/status.sh << 'EOF'
#!/bin/bash
# Show current brainstorming session status

echo "🧠 Bacon's Brainstorming Session Status"
echo "======================================"
echo "📍 Current Phase: $(cat .brainstorm/current-phase.txt 2>/dev/null || echo 'Not started')"
echo "⏱️  Phase Time: $(./check-time-allocation.sh 2>&1 | grep -E '(minutes|time)' | head -1)"
echo "🔖 Session ID: $(cat .brainstorm/session-id.txt 2>/dev/null)"
echo ""
echo "📊 Progress:"
for file in problem-statement.md data-sources.md analysis.md solutions.md selected-solutions.md implementation-plan.md ssc-collection.md; do
    if [ -f .brainstorm/$file ]; then
        echo "  ✅ $file"
    else
        echo "  ⬜ $file"
    fi
done
echo ""
echo "💡 Next Action:"
phase=$(cat .brainstorm/current-phase.txt 2>/dev/null)
case $phase in
    "PROBLEM_DEFINITION")
        echo "  Complete problem-statement.md, then signal: echo 'phase-complete' > .brainstorm/phase-complete.signal"
        ;;
    "DATA_GATHERING")
        echo "  Gather data with citations in data-sources.md"
        ;;
    "ANALYSIS")
        echo "  Analyze findings in analysis.md, search models, complete analysis-qa.md"
        ;;
    "SOLUTION_GENERATION")
        echo "  Brainstorm solutions in solutions.md (no criticism!)"
        ;;
    "SOLUTION_SELECTION")
        echo "  Vote on solutions, document in selected-solutions.md"
        ;;
    "PLANNING_ACTION")
        echo "  Create implementation-plan.md and test solutions"
        ;;
    "SSC_COLLECTION")
        echo "  Complete ssc-collection.md with learnings"
        ;;
    *)
        echo "  Start by editing .brainstorm/problem-statement.md"
        ;;
esac
EOF
chmod +x .brainstorm/status.sh

# Create quick advance script
cat > .brainstorm/next-phase.sh << 'EOF'
#!/bin/bash
echo 'phase-complete' > .brainstorm/phase-complete.signal
echo "✅ Signaled to advance to next phase"
EOF
chmod +x .brainstorm/next-phase.sh

# Final setup message
echo ""
echo "✅ Brainstorming session initialized!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .brainstorm/problem-statement.md to clearly define the problem"
echo "2. When complete, run: .brainstorm/next-phase.sh"
echo "3. Check status anytime: .brainstorm/status.sh"
echo ""
echo "⏱️  Time Allocation (2-hour session):"
echo "  - Problem Definition: 12 minutes (10%)"
echo "  - Data Gathering: 30 minutes (25%)"
echo "  - Analysis: 30 minutes (25%)"
echo "  - Solution Generation: 24 minutes (20%)"
echo "  - Solution Selection: 12 minutes (10%)"
echo "  - Planning & Action: 12 minutes (10%)"
echo ""
echo "💡 Tip: Set custom session time with: export BRAINSTORM_TOTAL_TIME=90  # for 90 minutes"
echo ""
echo "🚀 Let's solve: $PROBLEM_DESC"