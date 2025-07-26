# Golden Image MCP Configuration Fix

## Problem Identified
1. Current golden image has Claude Code installed ✅
2. `.mcp.json` is created in the workspace ✅
3. But Claude Code doesn't automatically load MCP servers ❌
4. Containers still use bash wrappers instead of native MCP ❌

## Root Cause
- Claude Code needs to be initialized with MCP configuration
- The `.mcp.json` file must be in the working directory when Claude Code starts
- Environment variables must be properly exported before MCP server initialization

## Solution for Golden Image

### 1. Update Dockerfile.golden to:
- Place `.mcp.json` in workspace root
- Ensure environment variables are exported in startup script
- Initialize Claude Code with proper working directory

### 2. Test Process:
```bash
# 1. Test MCP packages exist
./test-mcp-config.sh

# 2. Build new golden image
docker build -t casper-golden:mcp-v2 -f Dockerfile.golden .

# 3. Test in new container
docker run -it --rm \
  -e LINEAR_API_KEY="$LINEAR_API_KEY" \
  -e GITHUB_PAT_KEY="$GITHUB_PAT_KEY" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  casper-golden:mcp-v2 \
  bash -c "cd /home/claude/workspace && claude 'list available MCP tools'"
```

### 3. Expected Result:
Claude Code should list MCP tools from:
- linear (Linear API access)
- filesystem (File operations)
- github (GitHub operations)
- ollama (LLM operations)

## Next Steps
1. Fix golden image configuration
2. Test MCP functionality
3. Rebuild all agent containers
4. Verify PM Agent can read BAC-154 using native MCP