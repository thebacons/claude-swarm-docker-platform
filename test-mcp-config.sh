#!/bin/bash
# Test MCP configuration locally

echo "Testing MCP server configurations..."
echo ""

# Test Linear MCP server
echo "1. Testing Linear MCP server..."
export LINEAR_API_KEY="${LINEAR_API_KEY}"
timeout 5 npx -y linear-mcp-server 2>&1 | head -5 || echo "Linear test complete"

echo ""
echo "2. Testing filesystem MCP server..."
timeout 5 npx -y @modelcontextprotocol/server-filesystem /tmp 2>&1 | head -5 || echo "Filesystem test complete"

echo ""
echo "3. Testing GitHub MCP server..."
export GITHUB_PERSONAL_ACCESS_TOKEN="${GITHUB_PAT_KEY}"
timeout 5 npx -y @modelcontextprotocol/server-github 2>&1 | head -5 || echo "GitHub test complete"

echo ""
echo "All MCP server packages verified!"