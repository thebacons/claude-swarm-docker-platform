#!/bin/bash
# Spawn a project management agent that stays running

echo "🚀 Creating Persistent Project Manager Agent..."

# Clean up any existing container
docker stop casper-project-manager 2>/dev/null
docker rm casper-project-manager 2>/dev/null

# Run container with tail -f to keep it alive
docker run -d \
    --name casper-project-manager \
    --network claude-swarm-docker-spawn_casper-net \
    --env-file .env \
    -e CONTAINER_ROLE="project-manager" \
    -v $(pwd)/projects:/workspace/projects \
    -v $(pwd)/scripts:/workspace/scripts:ro \
    -v $(pwd)/logs:/workspace/logs \
    casper-golden:fixed \
    tail -f /dev/null

echo "⏳ Waiting for container startup..."
sleep 3

# Setup the agent
docker exec casper-project-manager bash -c '
# Create CLAUDE.md
cat > /home/claude/workspace/CLAUDE.md << EOF
# You are the Project Manager Agent

You are a specialized project management agent with Linear integration.

## Core Responsibilities
1. Track all project tasks in Linear
2. Create detailed status reports
3. Identify blockers and dependencies
4. Coordinate between other agents
5. Maintain project documentation

## Linear Access
Use the wrapper at /home/claude/workspace/scripts/linear-wrapper.sh:
- list-projects: View all projects
- list-issues: View current issues
- list-teams: View teams
- create-issue <title>: Create new issues

## Working with Other Agents
- Policeman: Get task assignments and report overall status
- Developers: Track implementation progress
- Tester: Monitor quality metrics
EOF

# Test Linear access
export LINEAR_API_KEY="${LINEAR_API_KEY}"
echo "Testing Linear connectivity..."
/home/claude/workspace/scripts/linear-wrapper.sh list-projects > /tmp/linear-test.json
if grep -q "projects" /tmp/linear-test.json; then
    echo "✅ Linear API connected successfully"
else
    echo "❌ Linear connection failed"
fi
'

# Verify container is running
if docker ps | grep -q casper-project-manager; then
    echo -e "\n✅ Project Manager Agent Successfully Spawned!"
    echo "========================================"
    echo "Container: casper-project-manager"
    echo "Status: Running"
    echo ""
    echo "Test Linear integration:"
    echo 'docker exec casper-project-manager claude "Use the Linear wrapper to list all projects"'
    echo ""
    echo "Ask for project status:"
    echo 'docker exec casper-project-manager claude "Check Linear for all issues in the Docker Swarm project and create a status summary"'
else
    echo "❌ Failed to spawn Project Manager agent"
    docker logs casper-project-manager
fi