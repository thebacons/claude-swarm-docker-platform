#!/bin/bash
# Test MCP configuration in a container

echo "Testing MCP configuration in container..."

# Copy .mcp.json to PM container for testing
docker cp .mcp.json casper-project-manager:/home/claude/workspace/.mcp.json

# Test if Claude Code can see MCP servers
echo ""
echo "Testing Claude Code MCP discovery..."
docker exec casper-project-manager bash -c '
cd /home/claude/workspace
export LINEAR_API_KEY="${LINEAR_API_KEY}"
export GITHUB_PAT_KEY="${GITHUB_PAT_KEY}"

# Check if .mcp.json exists
if [ -f .mcp.json ]; then
    echo "✅ .mcp.json found in workspace"
    cat .mcp.json | jq .mcpServers | head -20
else
    echo "❌ .mcp.json not found"
fi

# Try to use Claude Code with MCP
echo ""
echo "Testing Claude Code MCP integration..."
claude --version 2>/dev/null || echo "Claude Code not installed"
'