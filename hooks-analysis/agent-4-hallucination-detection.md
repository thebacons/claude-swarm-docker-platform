# Agent 4: Hallucination Detection Hooks

## Problem Analysis
I sometimes reference non-existent functions, tools, or capabilities (like assuming MCP tools exist when they don't). This leads to failed implementations and wasted time.

## Hook Configurations

### 1. Tool Existence Verification
```json
{
  "preToolUse": [{
    "matcher": {
      "tools": ["*"],
      "patterns": ["mcp__|read_files|create_files|list_files"]
    },
    "command": "echo '🔍 Verifying tool exists...' && claude --list-tools 2>/dev/null | grep -i '{CLAUDE_TOOL_NAME}' || echo '⚠️ WARNING: Tool {CLAUDE_TOOL_NAME} not found in available tools!'",
    "severity": "warning"
  }]
}
```

### 2. Function Reference Validation
```json
{
  "postResponse": [{
    "matcher": {
      "patterns": [
        "\\b(\\w+)\\.(\\w+)\\s*\\(",
        "\\bawait\\s+(\\w+)\\s*\\(",
        "\\b(\\w+)\\s*\\([^)]*\\)(?![;,])"
      ]
    },
    "command": "echo '🤖 Checking function references...' && for func in $CLAUDE_MATCHED_PATTERNS; do grep -r \"function $func\\|def $func\\|const $func\" . --include='*.{js,ts,py}' > /dev/null || echo \"⚠️ Function '$func' not found in codebase\"; done",
    "severity": "warning"
  }]
}
```

### 3. Import/Module Hallucination Check
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "import .* from ['\"]([^'\"]+)['\"]",
        "require\\(['\"]([^'\"]+)['\"]\\)",
        "from ([\\w\\.]+) import"
      ]
    },
    "command": "echo '📦 Verifying imports...' && node -e \"try{require('$1')}catch(e){console.error('Module not found:','$1')}\" 2>&1 | grep -v 'Cannot find module' || true",
    "severity": "info"
  }]
}
```

### 4. API Endpoint Reality Check
```json
{
  "postResponse": [{
    "matcher": {
      "patterns": [
        "/api/[\\w/-]+",
        "GET|POST|PUT|DELETE.*https?://",
        "fetch\\(['\"][^'\"]+['\"]"
      ]
    },
    "command": "echo '🌐 API endpoints referenced - verify these exist:' && echo '{CLAUDE_MATCHED_PATTERNS}' | grep -oE '(/api/[\\w/-]+|https?://[^\\s]+)' | sort | uniq",
    "severity": "info"
  }]
}
```

### 5. Capability Claim Verification
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "I can (\\w+)",
        "I'll (\\w+)",
        "I have access to",
        "I'm able to",
        "tool.* allows me to"
      ]
    },
    "command": "echo '🎯 Capability claimed - verifying...' && case '$1' in *file*) ls > /dev/null && echo '✅ File access verified';; *git*) git --version > /dev/null && echo '✅ Git access verified';; *) echo '❓ Verify capability: $1';; esac",
    "severity": "info"
  }]
}
```

## CASPER Team Integration
- **Reality Checker Agent**: Cross-references all tool/function claims
- **Documentation Verifier**: Checks official docs for claimed features
- **API Tester**: Actually calls referenced endpoints to verify

## Override Mechanisms
```bash
# Acknowledge experimental feature
CLAUDE_EXPERIMENTAL_FEATURE="new-mcp-tool" npm run dev

# Skip validation for mocked functions
export CLAUDE_SKIP_VALIDATION="__mocks__/**"
```

## Effectiveness Metrics
- **Hallucination Rate**: False references per session
- **Time Wasted**: Minutes spent on non-existent features
- **Early Detection**: % caught before implementation
- **False Positive Rate**: Valid references flagged incorrectly

## Advanced Validation Patterns
```json
{
  "contextualValidation": {
    "mcpTools": {
      "validate": "claude --list-tools | jq -r '.[].name'",
      "cache": 300
    },
    "npmPackages": {
      "validate": "npm ls --json | jq -r '.dependencies | keys[]'",
      "cache": 600
    },
    "pythonModules": {
      "validate": "pip list --format=json | jq -r '.[].name'",
      "cache": 600
    }
  }
}
```

## Integration with IDE
```json
{
  "ideIntegration": {
    "vscode": {
      "command": "code --list-extensions",
      "validateClaims": ["extension", "command", "snippet"]
    }
  }
}
```

## Implementation Priority: HIGH
Hallucinations waste significant time and lead to failed implementations that could be caught early.