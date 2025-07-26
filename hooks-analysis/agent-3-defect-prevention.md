# Agent 3: Defect Prevention Hooks

## Problem Analysis
I deleted important hook configurations without checking their purpose, leading to system degradation. I often modify code without understanding its dependencies or impact.

## Hook Configurations

### 1. Deletion Impact Analysis
```json
{
  "preToolUse": [{
    "matcher": {
      "tools": ["Edit", "MultiEdit"],
      "patterns": ["old_string.*\\n.*\\n.*\\n.*new_string.*\"\""
    },
    "command": "echo '⚠️ DELETION DETECTED! Analyzing impact...' && echo 'Code being removed:' && echo '{CLAUDE_OLD_STRING}' | head -20 && read -p 'Document purpose of deleted code: ' purpose && echo \"$purpose\" > .deletion-log",
    "blocking": true,
    "severity": "critical"
  }]
}
```

### 2. Hook Modification Guardian
```json
{
  "preToolUse": [{
    "matcher": {
      "tools": ["Edit", "Write"],
      "filePatterns": ["**/hooks*.json", "**/*hook*.config.*", ".claude/hooks.json"]
    },
    "command": "echo '🛡️ HOOK MODIFICATION DETECTED!' && echo 'Current hooks:' && jq '.preToolUse[]?.description // .postToolUse[]?.description' {CLAUDE_FILE_PATH} 2>/dev/null && read -p 'Explain why each hook should be modified: ' reason && echo \"$reason\" >> .hook-change-log",
    "blocking": true
  }]
}
```

### 3. Dependency Check Before Changes
```json
{
  "preToolUse": [{
    "matcher": {
      "tools": ["Edit", "MultiEdit"],
      "filePatterns": ["*.js", "*.ts", "*.py"]
    },
    "command": "echo '🔍 Checking dependencies...' && grep -r \"$(basename {CLAUDE_FILE_PATH} | cut -d. -f1)\" --include='*.{js,ts,py}' . | grep -E '(import|require|from)' | head -10",
    "severity": "info"
  }]
}
```

### 4. Test Coverage Before Deletion
```json
{
  "preToolUse": [{
    "matcher": {
      "tools": ["Edit"],
      "patterns": ["old_string.*function|old_string.*class|old_string.*def"]
    },
    "command": "echo '🧪 Checking test coverage for code being modified...' && funcname=$(echo '{CLAUDE_OLD_STRING}' | grep -oE '(function|class|def) \\w+' | awk '{print $2}') && grep -r \"$funcname\" --include='*test*' . || echo '⚠️ No tests found for this code!'",
    "severity": "warning"
  }]
}
```

### 5. Configuration Change Impact
```json
{
  "postToolUse": [{
    "matcher": {
      "tools": ["Edit", "Write"],
      "filePatterns": ["*.config.*", "*.env*", "*settings*", "package.json"]
    },
    "command": "echo '⚙️ Configuration changed! Running impact analysis...' && npm run build --dry-run 2>/dev/null || echo 'Build check not available' && echo 'Services that may be affected:' && ps aux | grep -E 'node|python|docker' | grep -v grep",
    "severity": "warning"
  }]
}
```

## CASPER Team Integration
- **Code Historian Agent**: Retrieves history of deleted code
- **Impact Analyst Agent**: Traces all usages of modified functions
- **Regression Guard Agent**: Runs targeted regression tests

## Override Mechanisms
```bash
# Documented deletion (requires ticket number)
CLAUDE_DELETION_TICKET="BAC-123" git commit -m "Remove deprecated code"

# Emergency removal (time-limited)
CLAUDE_EMERGENCY_DELETE=$(date -u +%s) npm run cleanup
```

## Effectiveness Metrics
- **Unintended Deletion Rate**: Track accidental removals
- **Impact Documentation**: % of changes with documented impact
- **Regression Introduction**: Bugs traced to undocumented changes
- **Dependency Break Rate**: Failed builds from missed dependencies

## Integration with Git Hooks
```bash
#!/bin/bash
# pre-commit hook integration
if git diff --cached --name-only | grep -E '(hook|config)'; then
  echo "Configuration files modified. Running full test suite..."
  npm test || exit 1
fi
```

## Implementation Priority: CRITICAL
This prevents the exact scenario where I deleted working hooks without understanding their purpose.