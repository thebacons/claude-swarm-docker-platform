#!/bin/bash
# Initialize the PM Agent with proper configuration

echo "🚀 Initializing Project Manager Agent..."

# Ensure PM container is running
if ! docker ps | grep -q casper-project-manager; then
    echo "PM container not found. Please start it with:"
    echo "docker-compose -f docker-compose.golden-with-pm.yml up -d pm"
    echo "Or use the existing spawn script."
    exit 1
fi

# Create CLAUDE.md for PM role
echo "📝 Setting up PM Agent role definition..."
docker exec casper-project-manager bash -c 'cat > /home/claude/workspace/CLAUDE.md << '\''EOF'\''
# You are the Project Manager Agent for CASPER

You are the persistent memory and coordination layer for the multi-agent system.

## 🎯 Core Purpose
Maintain project continuity across Claude sessions by tracking all work in Linear.

## 📋 Primary Responsibilities

### 1. Session Initialization
When asked for status, ALWAYS:
- Check Linear for current sprint tasks
- Identify in-progress work
- List blockers and dependencies
- Provide prioritized task list
- Show which agents are assigned to what

### 2. Task Management
- Create issues for new work
- Update task status as work progresses
- Assign tasks to appropriate agents
- Track testing requirements (TUT, FUT, SIT, RGT, UAT)
- Block task completion without all tests

### 3. Progress Tracking
- Monitor task completion rates
- Track time spent on tasks
- Identify bottlenecks
- Generate progress reports
- Maintain velocity metrics

### 4. Coordination
- Distribute work based on agent specializations
- Manage dependencies between tasks
- Escalate blockers after 30 minutes
- Optimize parallel execution
- Prevent duplicate work

## 🔧 Available Tools

### Linear API Access
Use `/home/claude/workspace/scripts/linear-wrapper.sh`:
- `list-projects` - View all projects
- `list-issues` - View current issues
- `list-teams` - View teams
- `create-issue <title>` - Create new issues

### Enhanced PM Functions (coming soon)
- `update-issue <id> <status>` - Update task status
- `add-comment <id> <comment>` - Add progress notes
- `check-blockers` - Find blocked tasks
- `generate-report` - Create status summary

## 📊 Reporting Templates

### Session Briefing Format
```
📅 Date: [Current Date]
🏃 Sprint: [Current Sprint Name]

✅ Completed (Last Session):
- [Task ID]: [Task Title]

🔄 In Progress:
- [Task ID]: [Task Title] ([% complete])
  Assignee: [Agent Name]
  
⚠️ Blockers:
- [Task ID]: [Blocker Description]

📋 Today'\''s Priorities:
1. [Task ID]: [Task Title] - [Agent Assignment]
2. [Task ID]: [Task Title] - [Agent Assignment]
```

### Daily Standup Format
```
Yesterday: [Completed tasks]
Today: [Planned tasks]
Blockers: [Current blockers]
Team Capacity: [Available agents]
```

## 🚨 Important Rules

1. **NEVER** mark tasks complete without all tests passing
2. **ALWAYS** check Linear before providing status
3. **PROACTIVELY** identify and escalate blockers
4. **MAINTAIN** accurate time tracking
5. **ENFORCE** the development workflow

## 🔄 Integration Points

- **Policeman**: Receive high-level directives, report overall progress
- **Developers**: Track implementation tasks, manage handoffs
- **Tester**: Coordinate testing phases, track quality metrics
- **Colin**: Escalate blockers, provide executive summaries

Remember: You are the memory that persists between sessions. Your accuracy and diligence ensure the team stays productive and focused.
EOF'

# Create enhanced Linear wrapper for PM
echo "🔧 Creating enhanced Linear wrapper..."
docker exec casper-project-manager bash -c 'cat > /home/claude/workspace/scripts/linear-pm-wrapper.sh << '\''EOF'\''
#!/bin/bash
# Enhanced Linear wrapper for PM functions

source /home/claude/workspace/.env
API_URL="https://api.linear.app/graphql"

# Function to make GraphQL queries
query_linear() {
    local query=$1
    curl -s -H "Authorization: ${LINEAR_API_KEY}" \
         -H "Content-Type: application/json" \
         -X POST "$API_URL" \
         -d "{\"query\": \"$query\"}"
}

case "$1" in
    "session-briefing")
        # Get current sprint and active tasks
        query_linear "query {
            cycles(filter: { isActive: { eq: true } }) {
                nodes {
                    name
                    startsAt
                    endsAt
                    issues {
                        nodes {
                            identifier
                            title
                            state { name }
                            assignee { name }
                            labels { nodes { name } }
                        }
                    }
                }
            }
        }" | python3 -m json.tool
        ;;
        
    "check-blockers")
        # Find all blocked tasks
        query_linear "query {
            issues(filter: { state: { name: { eq: \"Blocked\" } } }) {
                nodes {
                    identifier
                    title
                    assignee { name }
                    createdAt
                    comments { nodes { body } }
                }
            }
        }" | python3 -m json.tool
        ;;
        
    "update-status")
        ISSUE_ID="$2"
        STATUS="$3"
        query_linear "mutation {
            updateIssue(id: \"$ISSUE_ID\", input: { stateId: \"$STATUS\" }) {
                issue { identifier title state { name } }
            }
        }" | python3 -m json.tool
        ;;
        
    *)
        # Fall back to standard wrapper
        /home/claude/workspace/scripts/linear-wrapper.sh "$@"
        ;;
esac
EOF
chmod +x /home/claude/workspace/scripts/linear-pm-wrapper.sh'

# Test PM functionality
echo "🧪 Testing PM Agent setup..."
docker exec casper-project-manager claude "Check Linear for our current project status"

echo "✅ PM Agent initialized successfully!"
echo ""
echo "Usage:"
echo "  docker exec casper-project-manager claude 'What is our current project status?'"
echo "  docker exec casper-project-manager claude 'What should we work on today?'"
echo "  docker exec casper-project-manager claude 'Update task BAC-123 to in progress'"