#!/bin/bash
# Test the Project Manager agent's capabilities

echo "🧪 Testing Project Manager Agent Capabilities"
echo "==========================================="

# Test 1: Basic Linear connectivity
echo -e "\n📋 Test 1: Direct Linear API access..."
docker exec casper-project-manager bash -c '
export LINEAR_API_KEY="${LINEAR_API_KEY}"
/workspace/scripts/linear-wrapper.sh list-projects | python3 -m json.tool | head -20
'

# Test 2: Claude understanding its role
echo -e "\n🤖 Test 2: Agent role understanding..."
docker exec casper-project-manager claude "Who are you and what is your role?"

# Test 3: Complex project management task
echo -e "\n📊 Test 3: Project management capability..."
docker exec casper-project-manager bash -c '
export LINEAR_API_KEY="${LINEAR_API_KEY}"
claude "I need you to:
1. List all Linear projects using /workspace/scripts/linear-wrapper.sh list-projects
2. Find the Docker Swarm related project
3. Create a brief status summary

The LINEAR_API_KEY environment variable is already set for you."
'

echo -e "\n✅ Testing Complete!"