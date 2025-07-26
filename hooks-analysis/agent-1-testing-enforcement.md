# Agent 1: Testing Enforcement Hooks

## Problem Analysis
I frequently claim code "works", "should work", or "is fixed" without actually running tests. This leads to broken code being committed and false confidence in implementations.

## Hook Configurations

### 1. Pre-Response Testing Enforcement
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "\\b(should work|will work|this fixes|now works|working correctly|successfully implemented|completed the implementation)\\b",
        "\\b(fixed the issue|resolved the problem|corrected the error)\\b",
        "\\b(implementation is complete|feature is ready|code is functional)\\b"
      ]
    },
    "command": "echo '⚠️ TESTING REQUIRED: Detected untested claim. Running verification...' && npm test || pytest || go test || cargo test || echo '❌ NO TESTS FOUND - Create tests before claiming success!'",
    "blocking": true,
    "severity": "critical"
  }]
}
```

### 2. Post-Edit Test Verification
```json
{
  "postToolUse": [{
    "matcher": {
      "tools": ["Edit", "MultiEdit", "Write"],
      "filePatterns": ["*.js", "*.ts", "*.py", "*.go", "*.rs"]
    },
    "command": "echo '🔍 Code changed - Running tests...' && timeout 30s npm test $(basename {CLAUDE_FILE_PATH}) 2>/dev/null || echo '⚠️ Tests incomplete/missing'",
    "severity": "warning"
  }]
}
```

### 3. Commit Message Testing Gate
```json
{
  "preToolUse": [{
    "matcher": {
      "tools": ["Bash"],
      "patterns": ["git commit.*-m.*(fix|implement|add|update|refactor)"]
    },
    "command": "if ! grep -q 'Tests: ✅' .git/COMMIT_EDITMSG 2>/dev/null; then echo '❌ BLOCKED: Add test results to commit message'; exit 1; fi",
    "blocking": true
  }]
}
```

## CASPER Team Integration
- **PM Agent Trigger**: When testing is skipped 3+ times
- **Observer Agent**: Monitors pattern of untested claims
- **Escalation**: Auto-creates Linear issue for repeated violations

## Override Mechanisms
```bash
# Emergency override (requires justification)
CLAUDE_HOOK_OVERRIDE="EMERGENCY: Production hotfix" git commit -m "..."

# Temporary disable (max 1 hour)
export CLAUDE_TESTING_HOOKS_DISABLED=3600
```

## Effectiveness Metrics
- **Untested Claim Rate**: Track % of claims without test execution
- **Test Failure Discovery**: Late-stage failures that hooks would have caught
- **Override Usage**: Monitor emergency override frequency
- **Time Impact**: Measure additional time from enforced testing

## Implementation Priority: CRITICAL
This should be the first hook implemented as it addresses the most fundamental issue.