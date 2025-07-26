# Agent 6: Parallel Agent Reminder Hooks

## Problem Analysis
I often tackle complex multi-faceted problems sequentially when parallel agents would be more effective. Keywords like "analyze", "design", "implement multiple", "compare options" indicate tasks suitable for parallel processing.

## Hook Configurations

### 1. Complex Task Detection
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "analyze.*and.*and",
        "compare.*options",
        "evaluate.*different",
        "implement.*multiple",
        "design.*comprehensive",
        "create.*several",
        "develop.*various",
        "investigate.*aspects"
      ]
    },
    "command": "echo '🤖 COMPLEX TASK DETECTED!' && echo 'Consider using parallel agents for:' && echo '{CLAUDE_MATCHED_TEXT}' | tr ',' '\\n' | sed 's/and/\\n- /g' && echo '\\nSuggested agents: 3-5 parallel analyzers'",
    "severity": "warning"
  }]
}
```

### 2. Task Complexity Calculator
```json
{
  "taskComplexity": [{
    "calculate": {
      "factors": {
        "subtasks": "count of 'and|plus|also|additionally'",
        "domains": "count of different file types referenced",
        "uncertainty": "count of 'might|maybe|possibly|could'",
        "research": "count of 'analyze|investigate|explore|compare'"
      },
      "threshold": 5,
      "action": "if [ $COMPLEXITY_SCORE -gt 5 ]; then echo '📊 Complexity Score: '$COMPLEXITY_SCORE' - Use parallel agents!'; fi"
    }
  }]
}
```

### 3. Sequential Work Detection
```json
{
  "postResponse": [{
    "matcher": {
      "patterns": [
        "first.*then.*finally",
        "step 1.*step 2.*step 3",
        "begin with.*followed by.*end with"
      ]
    },
    "command": "echo '📋 Sequential thinking detected! Consider parallel approach:' && echo 'Agent 1: Handle step 1' && echo 'Agent 2: Handle step 2' && echo 'Agent 3: Handle step 3' && echo 'Coordinate results after'",
    "severity": "info"
  }]
}
```

### 4. Analysis Parallelization Prompt
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "deep.?think.*about",
        "comprehensive.*analysis",
        "thorough.*investigation",
        "detailed.*review"
      ]
    },
    "command": "echo '🧠 DEEP ANALYSIS NEEDED!' && cat << 'EOF'\\nParallel Agent Template:\\n\\nAgent 1 - Technical Analysis: Focus on implementation details\\nAgent 2 - Risk Analysis: Identify potential issues\\nAgent 3 - Performance Analysis: Consider scalability\\nAgent 4 - Security Analysis: Review vulnerabilities\\nAgent 5 - Integration Analysis: Check dependencies\\nEOF",
    "blocking": false,
    "severity": "info"
  }]
}
```

### 5. Multi-File Operation Detector
```json
{
  "preToolUse": [{
    "matcher": {
      "tools": ["Grep", "Edit", "MultiEdit"],
      "multiple": true,
      "count": ">3"
    },
    "command": "echo '📁 Multiple file operations detected!' && echo 'Consider parallel agents:' && echo '- Agent per file for faster processing' && echo '- Agent per file type for specialized handling' && echo 'Files to process:' && echo '{CLAUDE_FILE_LIST}'",
    "severity": "warning"
  }]
}
```

## CASPER Team Integration
- **Task Decomposer Agent**: Breaks complex tasks into parallel subtasks
- **Agent Coordinator**: Manages parallel agent assignments
- **Result Aggregator**: Combines outputs from parallel agents

## Override Mechanisms
```bash
# Acknowledge sequential is better
CLAUDE_SEQUENTIAL_REASON="Dependencies require ordered execution"

# Force sequential for debugging
export CLAUDE_FORCE_SEQUENTIAL=true
```

## Effectiveness Metrics
- **Parallel Utilization Rate**: % of complex tasks using parallel agents
- **Time Savings**: Completion time parallel vs sequential
- **Quality Improvement**: Error rate with parallel analysis
- **Missed Opportunities**: Complex tasks done sequentially

## Parallel Agent Templates
```json
{
  "templates": {
    "code_review": {
      "agents": 5,
      "distribution": [
        "Security vulnerabilities",
        "Performance issues",
        "Code style and standards",
        "Test coverage",
        "Documentation completeness"
      ]
    },
    "feature_implementation": {
      "agents": 4,
      "distribution": [
        "Backend implementation",
        "Frontend implementation",
        "Testing suite",
        "Documentation"
      ]
    },
    "bug_investigation": {
      "agents": 6,
      "distribution": [
        "Reproduce issue",
        "Check recent changes",
        "Analyze logs",
        "Review related code",
        "Check similar issues",
        "Test fixes"
      ]
    }
  }
}
```

## Auto-Parallelization Suggestions
```json
{
  "autoSuggest": {
    "triggers": {
      "fileCount": ">5 files",
      "taskWords": ">50 words",
      "complexity": ">7 score",
      "timeEstimate": ">30 minutes"
    },
    "template": "This task has {trigger}. Recommend {agent_count} parallel agents:\\n{distribution}"
  }
}
```

## Implementation Priority: MEDIUM
While not critical for correctness, parallel agents significantly improve efficiency and thoroughness.