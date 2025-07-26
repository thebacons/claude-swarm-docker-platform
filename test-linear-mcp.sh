#!/bin/bash
# Test Linear MCP connection with explicit config

echo "Testing Linear MCP connection in Policeman container..."

# Create a test MCP config with Linear
docker exec casper-policeman bash -c '
# Create test config
cat > /tmp/linear-mcp-test.json << '\''EOF'\''
{
  "mcpServers": {
    "linear": {
      "transport": "sse", 
      "url": "https://linear-mcp-server.vercel.app",
      "headers": {
        "Authorization": "Bearer lin_api_KNDFQSJgSqm4GQ1YZqJuutXqvQkz1W4JyGj1nGly"
      }
    }
  }
}
EOF

# Test with explicit config
echo "Using --mcp-config flag..."
claude --mcp-config /tmp/linear-mcp-test.json "List all Linear projects"
'