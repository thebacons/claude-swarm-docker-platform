# Agent 7: PostConversation Testing Hooks

## Problem Analysis
I often end conversations with untested claims about functionality. A final sweep before conversation ends could catch these claims and force verification.

## Hook Configurations

### 1. Final Response Claim Scanner
```json
{
  "postConversation": [{
    "matcher": {
      "patterns": [
        "✅.*implemented",
        "✅.*working",
        "✅.*fixed",
        "now you can",
        "this will",
        "successfully",
        "completed",
        "ready to use"
      ]
    },
    "command": "echo '🏁 END OF CONVERSATION TESTING' && echo 'Claims made:' && grep -E '✅|successfully|working' $CLAUDE_FINAL_RESPONSE | nl && echo '\\nRunning final verification...' && npm test 2>/dev/null || python -m pytest 2>/dev/null || echo '⚠️ NO TESTS RUN - Manual verification required!'",
    "blocking": true,
    "severity": "critical"
  }]
}
```

### 2. Untested Feature Detector
```json
{
  "postConversation": [{
    "matcher": {
      "features": ["new", "added", "created", "implemented"],
      "withoutTests": ["test", "verify", "check", "confirm"]
    },
    "command": "echo '🚨 UNTESTED FEATURES DETECTED!' && echo 'Features claimed without testing:' && comm -23 <(grep -oE '(implemented|added|created) \\w+' $CLAUDE_FINAL_RESPONSE | sort) <(grep -oE '(tested|verified) \\w+' $CLAUDE_FINAL_RESPONSE | sort) && exit 1",
    "blocking": true
  }]
}
```

### 3. Code Example Validator
```json
{
  "postConversation": [{
    "matcher": {
      "codeBlocks": true,
      "languages": ["js", "python", "bash", "typescript"]
    },
    "command": "echo '📝 Validating code examples...' && for block in $CLAUDE_CODE_BLOCKS; do echo 'Testing code block:' && echo \"$block\" > .test-snippet && node .test-snippet 2>&1 | head -5 || python .test-snippet 2>&1 | head -5; done",
    "severity": "warning"
  }]
}
```

### 4. Promise Fulfillment Checker
```json
{
  "postConversation": [{
    "matcher": {
      "promises": ["I'll", "I will", "Let me", "I'll create", "I'll implement"]
    },
    "command": "echo '🤝 Checking promises made...' && promises=$(grep -oE \"I'll [^.]+\" $CLAUDE_CONVERSATION_LOG) && for promise in $promises; do echo \"Promise: $promise\" && echo -n \"Fulfilled? \" && grep -q \"${promise#I'll }\" $CLAUDE_FINAL_RESPONSE && echo '✅' || echo '❌'; done",
    "severity": "warning"
  }]
}
```

### 5. Success Criteria Validation
```json
{
  "postConversation": [{
    "criteria": {
      "extract": "from user's initial request",
      "match": "against final response"
    },
    "command": "echo '🎯 Validating success criteria...' && echo 'User requested:' && head -50 $CLAUDE_CONVERSATION_LOG | grep -E '(need|want|should|must)' | head -5 && echo '\\nDelivered:' && tail -100 $CLAUDE_FINAL_RESPONSE | grep -E '(done|completed|implemented)' | head -5",
    "severity": "info"
  }]
}
```

## CASPER Team Integration
- **QA Agent**: Performs final quality check
- **Test Runner Agent**: Executes comprehensive test suite
- **Documentation Validator**: Ensures claims match documentation

## Override Mechanisms
```bash
# Skip for information-only responses
CLAUDE_RESPONSE_TYPE="information_only"

# Acknowledge external testing
CLAUDE_EXTERNAL_TESTS="User will test manually as requested"
```

## Effectiveness Metrics
- **Untested Claim Rate**: % of sessions ending with untested claims
- **Catch Rate**: Issues found by postConversation hooks
- **False Positive Rate**: Valid implementations flagged incorrectly
- **Session Quality Score**: Based on verified vs unverified claims

## Comprehensive Final Checklist
```json
{
  "finalChecklist": {
    "required": [
      {
        "name": "No untested claims",
        "check": "grep -c 'works\\|fixed\\|ready' without corresponding test"
      },
      {
        "name": "All code examples valid", 
        "check": "Syntax check all code blocks"
      },
      {
        "name": "Dependencies documented",
        "check": "If new packages/imports, are they listed?"
      },
      {
        "name": "Error handling present",
        "check": "For new features, error cases addressed?"
      },
      {
        "name": "User requirements met",
        "check": "Initial request vs final delivery"
      }
    ],
    "report": "Generate session quality report"
  }
}
```

## Test Evidence Collection
```json
{
  "evidenceCollection": {
    "automatic": [
      "Screenshot test results",
      "Capture test output",
      "Log test commands run",
      "Record success/failure"
    ],
    "format": {
      "location": ".claude-session-evidence/",
      "naming": "session-{timestamp}-{status}.log"
    }
  }
}
```

## Integration with CI/CD
```bash
#!/bin/bash
# Post-conversation CI trigger
if [ -f ".claude-changes" ]; then
  echo "Claude made changes, running CI pipeline..."
  git add .
  git commit -m "Claude session: $(date)"
  npm run ci:test
fi
```

## Implementation Priority: CRITICAL
This is the last line of defense against untested code and should be implemented immediately.