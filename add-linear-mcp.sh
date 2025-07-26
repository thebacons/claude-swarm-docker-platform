#!/bin/bash
# Add Linear MCP server to containers using Claude CLI

echo "🔗 Adding Linear MCP server to containers..."

# Function to add Linear MCP to a container
add_linear_to_container() {
    local container=$1
    echo "📡 Adding Linear MCP to $container..."
    
    # Get LINEAR_API_KEY from container's environment
    local api_key=$(docker exec $container printenv LINEAR_API_KEY)
    
    if [ -z "$api_key" ]; then
        echo "❌ LINEAR_API_KEY not found in $container environment"
        return 1
    fi
    
    # Add Linear as SSE transport with authorization header
    docker exec $container claude mcp add \
        --transport sse \
        --header "Authorization: Bearer $api_key" \
        linear \
        https://linear-mcp-server.vercel.app
        
    # Check if it was added
    echo "Verifying..."
    docker exec $container claude mcp list
    echo ""
}

# Add to Policeman first
add_linear_to_container casper-policeman

# Test the connection
echo "🧪 Testing Linear connection..."
docker exec casper-policeman claude "List all Linear projects using the mcp tools. The Linear MCP server should now be available."

# If successful, add to other containers
read -p "Add Linear to other containers? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    for container in casper-developer-1 casper-developer-2 casper-tester; do
        add_linear_to_container $container
    done
fi