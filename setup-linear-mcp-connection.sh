#!/bin/bash
# Setup Linear MCP remote server connection for CASPER containers

echo "🔗 Setting up Linear MCP server connections..."

# Linear MCP remote server URL
LINEAR_MCP_URL="https://linear-mcp-server.vercel.app"

# Function to add Linear MCP to a container
setup_linear_mcp() {
    local container=$1
    echo "📡 Configuring Linear MCP for $container..."
    
    # First, check if claude mcp command exists
    docker exec $container which claude >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Found Claude Code in $container"
        
        # Try to add Linear as a remote MCP server
        docker exec $container bash -c "claude mcp add linear \
            --type remote \
            --url '$LINEAR_MCP_URL' \
            --header 'Authorization: Bearer \${LINEAR_API_KEY}' \
            --description 'Linear project management' 2>&1" || true
            
        # Alternative: Try using the MCP config directly
        if [ $? -ne 0 ]; then
            echo "Direct command failed, checking MCP config..."
            docker exec $container cat /home/claude/.claude/config/mcp.json 2>/dev/null || echo "No MCP config found"
        fi
    else
        echo "⚠️ Claude not found in $container"
    fi
    echo ""
}

# Setup for each container that needs Linear access
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    setup_linear_mcp $container
done

echo "✅ Linear MCP setup attempts complete"
echo ""
echo "Testing Linear access..."

# Test Linear access
docker exec casper-policeman claude "Can you list Linear projects now? Try using any available Linear tools."