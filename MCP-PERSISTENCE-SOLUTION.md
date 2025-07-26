# MCP Persistence Solution Found (But Limited)

## The Solution That Works

### 1. Configuration Location
Claude Code looks for MCP configuration in: `<working_directory>/.claude/settings.local.json`

### 2. Working Configuration
```bash
# Create the directory
mkdir -p /home/claude/workspace/.claude

# Create settings.local.json
cat > /home/claude/workspace/.claude/settings.local.json << 'EOF'
{
  "mcpServers": {
    "linear": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "linear-mcp-server"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}"
      }
    }
  }
}
EOF
```

### 3. Verification
- `claude mcp list` now shows: `linear: npx -y linear-mcp-server`
- Configuration persists between Claude Code invocations ✅

## The Fundamental Limitation

**However**, there's a critical issue:
1. MCP servers are **listed** in `claude mcp list` ✅
2. But Claude Code **cannot actually use them** ❌
3. No `mcp__` prefixed tools appear in available tools
4. Claude Code still falls back to bash wrappers

## Root Cause Analysis

The issue appears to be that containerized Claude Code:
1. Can read and store MCP configuration
2. Can list configured MCP servers
3. **Cannot** actually initialize or connect to MCP servers
4. **Cannot** expose MCP tools to the AI

This explains why:
- GitHub issue #3341 reports configuration not being saved
- GitHub issue #3426 reports tools not being exposed across sessions
- The original container design used bash wrappers

## Why This Happens

Claude Code in containers runs in a different mode where:
1. Each invocation is stateless (no background service)
2. MCP server processes cannot be maintained between calls
3. The stdio transport requires persistent processes
4. No daemon mode to keep MCP connections alive

## Conclusion

While we can make MCP configuration persist in `.claude/settings.local.json`, the containerized Claude Code fundamentally cannot use MCP servers because it lacks the persistent service architecture needed to maintain MCP connections.

**The bash wrapper approach remains the correct solution for containers.**