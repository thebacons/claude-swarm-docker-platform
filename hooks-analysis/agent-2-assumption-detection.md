# Agent 2: Assumption Detection Hooks

## Problem Analysis
I frequently make assumptions using words like "probably", "likely", "should be", "appears to" without verifying facts. This leads to incorrect implementations based on guesses rather than verified information.

## Hook Configurations

### 1. Assumption Language Detection
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "\\b(probably|likely|should be|appears to|seems like|I think|I believe|I assume)\\b",
        "\\b(might be|could be|possibly|presumably|apparently|supposedly)\\b",
        "\\b(my understanding is|if I recall|from what I remember)\\b"
      ]
    },
    "command": "echo '🤔 ASSUMPTION DETECTED! Verify with: 1) Read actual file 2) Test behavior 3) Check documentation' && echo 'Assumptions found:' && grep -E '(probably|likely|should be)' $CLAUDE_LAST_RESPONSE",
    "severity": "warning"
  }]
}
```

### 2. File Existence Verification
```json
{
  "preToolUse": [{
    "matcher": {
      "tools": ["Edit", "Read"],
      "patterns": ["(?!.*(first|before|need to).*read).*"]
    },
    "command": "if [[ ! -f '{CLAUDE_FILE_PATH}' ]]; then echo '❌ BLOCKED: File does not exist. Use Read/LS to verify first.'; exit 1; fi",
    "blocking": true
  }]
}
```

### 3. API/Function Assumption Checker
```json
{
  "postResponse": [{
    "matcher": {
      "patterns": [
        "\\b(\\w+)\\.(\\w+)\\([^)]*\\)",
        "import .* from ['\"]([^'\"]+)['\"]",
        "require\\(['\"]([^'\"]+)['\"]\\)"
      ]
    },
    "command": "echo '🔍 Checking referenced functions/modules...' && node -e 'console.log(\"Verify these exist:\", process.argv.slice(1))' $CLAUDE_MATCHED_PATTERNS",
    "severity": "info"
  }]
}
```

### 4. Configuration Assumption Guard
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "default (is|value|setting|configuration)",
        "usually set to",
        "typically configured as",
        "standard practice is"
      ]
    },
    "command": "echo '⚠️ CONFIG ASSUMPTION: Verify actual values in:' && find . -name '*.config.*' -o -name '*.env*' -o -name 'settings.*' | head -5",
    "severity": "warning"
  }]
}
```

## CASPER Team Integration
- **Fact Checker Agent**: Auto-triggered on 5+ assumptions per response
- **Documentation Agent**: Fetches actual docs when assumptions detected
- **Code Reader Agent**: Automatically reads referenced files to verify

## Override Mechanisms
```bash
# Acknowledge assumption (must document source)
CLAUDE_ASSUMPTION_SOURCE="React docs v18.2" npm run dev

# Skip verification for known patterns
export CLAUDE_SKIP_ASSUMPTION_CHECK="test-*.js"
```

## Effectiveness Metrics
- **Assumption Density**: Assumptions per 1000 tokens
- **Verification Rate**: % of assumptions actually verified
- **False Assumption Impact**: Bugs traced to unverified assumptions
- **Time to Verify**: Average time spent on verification

## Integration with Testing Hooks
```json
{
  "assumptionTestGeneration": {
    "trigger": "assumption_detected",
    "action": "generate_verification_test",
    "template": "test('verify {assumption}', () => { /* TODO: Implement */ })"
  }
}
```

## Implementation Priority: HIGH
Assumptions are the root cause of many downstream issues and should be caught early.