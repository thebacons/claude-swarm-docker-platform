# MCP Container Configuration Issue Summary

## Root Cause Identified

Claude Code in containers **does not persist MCP configuration** between commands. This is why:

1. `claude mcp add` says "Added to local config" ✅
2. `claude mcp list` immediately after shows "No MCP servers" ❌
3. Each `claude` invocation starts fresh without MCP

## Why This Happens

1. **My Claude Code**: Runs as persistent service, maintains config
2. **Container Claude Code**: Each command is a new process, no persistence
3. **Config location**: Unknown where container Claude Code stores config
4. **`.mcp.json`**: Not automatically loaded by container Claude Code

## Current Workarounds That Don't Work

1. ❌ Using `--mcp-config .mcp.json` - Partially loads but can't use tools
2. ❌ Adding servers with `claude mcp add` - Doesn't persist
3. ❌ Old config in `.config/claude-code/` - Not used properly

## Why Bash Wrappers Were Created

This explains why the original container design used bash wrappers:
- Claude Code MCP doesn't work reliably in containers
- Direct API calls via curl are more predictable
- No persistence issues with bash scripts

## Options Moving Forward

### Option 1: Fix MCP in Containers (Complex)
- Find where Claude Code stores persistent config
- Ensure config survives between invocations
- May require Claude Code architecture changes

### Option 2: Keep Bash Wrappers (Current)
- Works reliably
- Direct API access
- No MCP complexity

### Option 3: Central MCP Gateway
- Run MCP servers outside containers
- Containers connect to central gateway
- More complex architecture

## Recommendation

**Keep the current bash wrapper approach** until Claude Code MCP support improves for containerized environments. The PM container can't use MCP tools because Claude Code in containers fundamentally doesn't support persistent MCP configuration.