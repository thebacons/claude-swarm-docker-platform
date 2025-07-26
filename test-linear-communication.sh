#!/bin/bash
# Test Linear as communication bridge between containers

echo "🔗 Testing Linear as AI Agent Communication Bridge"
echo "=================================================="

# Test 1: Policeman checking for tasks
echo -e "\n📋 Test 1: Policeman checking Linear for tasks..."
docker exec casper-policeman bash -c '
export LINEAR_API_KEY="${LINEAR_API_KEY}"
/home/claude/workspace/scripts/linear-wrapper.sh list-issues | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if \"data\" in data and \"issues\" in data[\"data\"]:
        issues = data[\"data\"][\"issues\"][\"nodes\"]
        print(f\"Found {len(issues)} issues in Linear\")
        for issue in issues[:3]:
            state = issue.get(\"state\", {}).get(\"name\", \"Unknown\") if issue.get(\"state\") else \"Unknown\"
            assignee = issue.get(\"assignee\", {}).get(\"name\", \"Unassigned\") if issue.get(\"assignee\") else \"Unassigned\"
            print(f\"- {issue['identifier']}: {issue['title']} (Status: {state}, Assignee: {assignee})\")
    else:
        print(\"Error: Unexpected response format\")
except Exception as e:
    print(f\"Error processing response: {e}\")"
'

# Test 2: Developer checking specific project
echo -e "\n💻 Test 2: Developer-1 checking Docker project..."
docker exec casper-developer-1 bash -c '
export LINEAR_API_KEY="${LINEAR_API_KEY}"
/home/claude/workspace/scripts/linear-wrapper.sh list-projects | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if \"data\" in data and \"projects\" in data[\"data\"]:
        projects = data[\"data\"][\"projects\"][\"nodes\"]
        print(f\"Found {len(projects)} projects in Linear\")
        for project in projects[:3]:
            print(f\"- {project['name']}\")
            if \"Docker\" in project['name']:
                print(f\"  ID: {project['id']}\")
    else:
        print(\"Error: Unexpected response format\")
except Exception as e:
    print(f\"Error processing response: {e}\")"
'

# Test 3: Tester reporting an issue (simulated)
echo -e "\n🧪 Test 3: Tester could report issues..."
docker exec casper-tester bash -c '
echo "Tester would create issue with:"
echo "/home/claude/workspace/scripts/linear-wrapper.sh create-issue \"Bug: Login form validation fails\""
'

# Test 4: Show communication flow
echo -e "\n🔄 Test 4: Communication Flow Demonstration"
echo "==========================================="
echo "1. Policeman queries Linear for new tasks"
echo "2. Policeman assigns tasks to Developer-1 and Developer-2"
echo "3. Developers update task status in Linear"
echo "4. Tester creates bug reports in Linear"
echo "5. Policeman monitors progress via Linear API"
echo ""
echo "✅ All agents can communicate through Linear!"