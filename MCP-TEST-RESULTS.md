# MCP Configuration Test Results

## Test Summary
Testing MCP configuration in containers before rebuilding golden image.

## Key Findings

### 1. MCP Configuration File Locations
- **Old location**: `/home/claude/.config/claude-code/mcp-servers.json` (used by container)
- **New location**: `/home/claude/workspace/.mcp.json` (project-level config)
- **Issue**: Container Claude Code uses old location by default

### 2. Package Names Verified
- ✅ `linear-mcp-server` - Correct package for Linear
- ✅ `@modelcontextprotocol/server-filesystem` - Filesystem access
- ✅ `@modelcontextprotocol/server-github` - GitHub operations
- ✅ `@modelcontextprotocol/server-ollama` - Ollama LLM access

### 3. Claude Code MCP Loading Behavior
- My Claude Code: Automatically loads `.mcp.json` from current directory
- Container Claude Code: Does NOT auto-load `.mcp.json`
- Manual loading: `claude --mcp-config .mcp.json` partially works
- BUT: Still asks for permissions, not fully integrated

### 4. Current Container State
- Claude Code v1.0.30 installed ✅
- Can run with `--mcp-config` flag ✅
- Lists MCP tools when asked ✅
- Cannot actually USE MCP tools ❌
- Falls back to bash wrappers ❌

## Root Cause Analysis
1. Container Claude Code installation may be missing MCP integration
2. Permission system not properly configured for containerized Claude Code
3. Old config file takes precedence over new `.mcp.json`

## Next Steps
1. Research Claude Code container-specific MCP configuration
2. Check if special flags or environment variables needed
3. Consider if MCP servers need to be pre-installed (not just npx)
4. Test with a fresh container to isolate configuration issues