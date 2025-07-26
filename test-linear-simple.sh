#!/bin/bash
# Simple Linear connectivity test for all containers

echo "🔗 Testing Linear API Access in All Containers"
echo "=============================================="

# Test each container
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    echo -e "\n📦 Testing $container..."
    
    # Export API key and test Linear connection
    docker exec $container bash -c '
    export LINEAR_API_KEY="${LINEAR_API_KEY}"
    
    # Test listing projects
    echo "→ Listing projects..."
    result=$(/home/claude/workspace/scripts/linear-wrapper.sh list-projects 2>&1)
    
    if echo "$result" | grep -q "\"projects\""; then
        echo "✅ Successfully connected to Linear API"
        project_count=$(echo "$result" | grep -o "\"name\"" | wc -l)
        echo "   Found $project_count projects"
    else
        echo "❌ Failed to connect to Linear API"
        echo "   Error: $result"
    fi
    '
done

echo -e "\n✨ Summary"
echo "=========="
echo "All containers have the Linear wrapper script installed at:"
echo "/home/claude/workspace/scripts/linear-wrapper.sh"
echo ""
echo "Available commands:"
echo "- list-projects: List all Linear projects"
echo "- list-issues: List recent issues"
echo "- list-teams: List all teams"
echo "- create-issue <title>: Create a new issue"
echo ""
echo "The wrapper provides a practical solution for Linear access"
echo "when native MCP integration isn't available."