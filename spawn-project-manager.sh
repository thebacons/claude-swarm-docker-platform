#!/bin/bash
# Spawn a temporary project management agent container with Linear access

echo "🚀 Spawning Project Management Agent..."

# Check if project-manager container already exists
if docker ps -a | grep -q "casper-project-manager"; then
    echo "⚠️  Removing existing project-manager container..."
    docker stop casper-project-manager 2>/dev/null
    docker rm casper-project-manager 2>/dev/null
fi

# Create the container from golden image
echo "📦 Creating project-manager container from golden image..."
docker run -d \
    --name casper-project-manager \
    --network claude-swarm-docker-spawn_casper-net \
    --env-file .env \
    -e CONTAINER_ROLE="project-manager" \
    -v $(pwd)/projects:/workspace/projects \
    -v $(pwd)/scripts:/workspace/scripts:ro \
    -v $(pwd)/logs:/workspace/logs \
    casper-golden:fixed

# Wait for container to start
echo "⏳ Waiting for container to initialize..."
sleep 5

# Create CLAUDE.md for project manager role
echo "📝 Creating Project Manager role definition..."
docker exec casper-project-manager bash -c 'cat > /home/claude/workspace/CLAUDE.md << EOF
# You are the Project Manager Agent

You are a specialized project management agent in the CASPER system with these responsibilities:

## Your Role
- Track and manage all tasks in Linear
- Create and update issues based on team progress
- Generate project status reports
- Coordinate work between other agents
- Monitor blockers and dependencies

## Your Capabilities
- Access to Linear API via /home/claude/workspace/scripts/linear-wrapper.sh
- Can create, update, and query Linear issues
- Can analyze project progress and generate reports
- Can identify bottlenecks and suggest optimizations

## Available Linear Commands
- list-projects: View all projects
- list-issues: View current issues
- list-teams: View all teams
- create-issue <title>: Create new issues

## Communication
- Work closely with Policeman to understand task distribution
- Monitor Developer and Tester progress
- Report status updates back to orchestrator
EOF'

# Copy Linear wrapper script
echo "📋 Ensuring Linear wrapper is available..."
docker exec casper-project-manager bash -c 'chmod +x /workspace/scripts/linear-wrapper.sh'

# Test Linear connectivity
echo "🔗 Testing Linear connectivity..."
docker exec casper-project-manager bash -c '
export LINEAR_API_KEY="lin_api_KNDFQSJgSqm4GQ1YZqJuutXqvQkz1W4JyGj1nGly"
echo "Testing Linear API connection..."
/workspace/scripts/linear-wrapper.sh list-projects | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if \"data\" in data and \"projects\" in data[\"data\"]:
        projects = data[\"data\"][\"projects\"][\"nodes\"]
        print(f\"✅ Successfully connected! Found {len(projects)} projects\")
        for p in projects[:3]:
            print(f\"  - {p[\"name\"]}\")
    else:
        print(\"❌ Connection failed: Invalid response\")
except Exception as e:
    print(f\"❌ Error: {e}\")
"'

echo -e "\n✨ Project Manager Agent Ready!"
echo "================================"
echo "Container: casper-project-manager"
echo "Network: claude-net"
echo "Linear Access: ✅ Configured"
echo ""
echo "To interact with the agent:"
echo "docker exec casper-project-manager claude \"List all active Linear issues and summarize project status\""
echo ""
echo "To access the container:"
echo "docker exec -it casper-project-manager /bin/bash"