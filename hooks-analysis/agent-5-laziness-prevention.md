# Agent 5: Laziness Prevention Hooks

## Problem Analysis
I sometimes give up too quickly, claiming "fundamental limitations" or "not possible" without trying multiple approaches. The MCP server issue is a prime example where I claimed it couldn't work when it actually could.

## Hook Configurations

### 1. Premature Surrender Detection
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "fundamental limitation",
        "not possible",
        "cannot be done",
        "no way to",
        "impossible to",
        "doesn't support",
        "not supported",
        "unfortunately.*cannot"
      ]
    },
    "command": "echo '🛑 GIVING UP DETECTED! Try these approaches:' && echo '1. Check documentation again' && echo '2. Try a different method' && echo '3. Look for workarounds' && echo '4. Test assumptions' && echo 'Attempts made so far:' && grep -c 'tried\\|attempted\\|tested' $CLAUDE_CONVERSATION_LOG || echo '0'",
    "blocking": true,
    "severity": "critical"
  }]
}
```

### 2. Solution Attempt Counter
```json
{
  "conversationTracking": [{
    "matcher": {
      "patterns": ["error.*try", "failed.*attempt", "didn't work"]
    },
    "command": "echo $(($(cat .attempt-counter 2>/dev/null || echo 0) + 1)) > .attempt-counter && attempts=$(cat .attempt-counter) && if [ $attempts -lt 3 ]; then echo '⚠️ Only '$attempts' attempts made. Try at least 3 different approaches!'; exit 1; fi",
    "severity": "warning"
  }]
}
```

### 3. Alternative Approach Enforcer
```json
{
  "postToolUse": [{
    "matcher": {
      "tools": ["*"],
      "errorPatterns": ["error", "failed", "exception", "not found"]
    },
    "command": "echo '❌ Error detected! Suggesting alternatives:' && echo '- Different file path?' && echo '- Different tool?' && echo '- Different approach?' && echo 'Alternative approaches to try:' > .alternatives.md && echo '1. ' >> .alternatives.md",
    "severity": "info"
  }]
}
```

### 4. Documentation Re-check Trigger
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "doesn't seem to",
        "appears not to",
        "looks like.*not",
        "probably doesn't"
      ]
    },
    "command": "echo '📚 Assumption detected! Re-checking documentation...' && find . -name 'README*' -o -name 'DOCS*' -o -name '*.md' | grep -E '(api|guide|reference)' | head -5 | xargs grep -l \"${CLAUDE_CURRENT_TOPIC}\" 2>/dev/null || echo 'Search docs manually'",
    "severity": "warning"
  }]
}
```

### 5. Effort Measurement
```json
{
  "effortTracking": {
    "minimumBeforeGivingUp": {
      "commands": 5,
      "timeMinutes": 10,
      "differentApproaches": 3
    },
    "track": ["Read operations", "Search attempts", "Test executions", "Documentation checks"],
    "enforce": "echo '📊 Effort summary:' && echo 'Commands run: '$CLAUDE_COMMAND_COUNT && echo 'Time spent: '$CLAUDE_TIME_MINUTES'm' && echo 'Approaches tried: '$CLAUDE_APPROACH_COUNT"
  }
}
```

## CASPER Team Integration
- **Persistence Coach Agent**: Suggests new approaches when stuck
- **Solution Explorer Agent**: Finds similar problems and solutions
- **Devil's Advocate Agent**: Challenges "impossible" claims

## Override Mechanisms
```bash
# Document genuine limitation (requires evidence)
CLAUDE_LIMITATION_EVIDENCE="GitHub issue #1234 confirms not supported" 

# Acknowledge after exhaustive attempts
CLAUDE_ATTEMPTS_MADE="5 different approaches over 30 minutes"
```

## Effectiveness Metrics
- **Premature Surrender Rate**: % of problems abandoned < 3 attempts
- **Success After Persistence**: Problems solved on attempts 4+
- **Time to Solution**: Average time before finding working approach
- **False Limitation Claims**: "Impossible" claims later proven wrong

## Persistence Strategies Database
```json
{
  "strategies": {
    "file_not_found": [
      "Check different directories",
      "Use find command",
      "Verify permissions",
      "Check symlinks"
    ],
    "api_error": [
      "Check authentication",
      "Verify endpoint URL", 
      "Test with curl",
      "Check rate limits"
    ],
    "tool_not_working": [
      "Verify tool installation",
      "Check tool documentation",
      "Try alternative tool",
      "Build custom solution"
    ]
  }
}
```

## Motivational Intervention
```json
{
  "motivationalMessages": {
    "attempt_1": "🔍 First attempt didn't work? That's normal! Try a different angle.",
    "attempt_2": "💪 Good persistence! What assumptions can we challenge?",
    "attempt_3": "🎯 Third time's often the charm! Have we checked the docs thoroughly?",
    "attempt_4": "🚀 Great determination! Let's try a completely different approach.",
    "attempt_5": "🏆 Your persistence is admirable! Consider asking for help or parallel agents."
  }
}
```

## Implementation Priority: HIGH
This directly addresses the pattern of giving up too quickly and missing valid solutions.