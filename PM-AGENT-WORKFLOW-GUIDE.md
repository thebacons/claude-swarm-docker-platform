# PM Agent Workflow Integration Guide

## 🌅 Daily Workflow with PM Agent

### Morning Session Start
```bash
# 1. First, always check project status
docker exec casper-pm claude "What's our current sprint status and priorities for today?"

# 2. Review any blockers from overnight
docker exec casper-pm claude "Check for any blocked tasks that need attention"

# 3. Get specific task details
docker exec casper-pm claude "Show me the details for the highest priority task"
```

### During Development
```bash
# Update progress as you work
docker exec casper-pm claude "Update task BAC-73 to 75% complete with note: Implemented core functionality, starting tests"

# Report blockers immediately
docker exec casper-pm claude "Mark task BAC-74 as blocked - waiting for API credentials from Colin"

# Check dependencies before starting new work
docker exec casper-pm claude "What tasks depend on BAC-73 being completed?"
```

### Task Handoffs
```bash
# When developer completes work
docker exec casper-developer-1 claude "I've completed the login component"
docker exec casper-pm claude "Update BAC-75 to 'Ready for Testing' and assign to Tester"

# When tester finds issues
docker exec casper-tester claude "Found XSS vulnerability in login form"
docker exec casper-pm claude "Update BAC-75 to 'Failed Testing' with note about XSS issue"
```

### End of Session
```bash
# Wrap up current state
docker exec casper-pm claude "Create end-of-session summary with all progress made today"

# Plan for next session
docker exec casper-pm claude "What are the top 3 priorities for next session?"
```

## 📊 PM Agent Command Patterns

### Status Queries
- "What's our current project status?"
- "Show me all tasks in the current sprint"
- "Which tasks are assigned to Developer-1?"
- "What's blocking our progress?"
- "How many tasks were completed this week?"

### Task Management
- "Create a new task for implementing user authentication"
- "Update BAC-123 to 'In Progress'"
- "Add a comment to BAC-123: Started implementation"
- "Mark BAC-123 as blocked due to missing requirements"
- "Close BAC-123 as completed with all tests passing"

### Coordination
- "Assign BAC-124 to Developer-2"
- "Which agent should work on the API integration?"
- "Show me all tasks waiting for code review"
- "List tasks that need testing"

### Reporting
- "Generate a daily standup report"
- "Show sprint progress as a percentage"
- "List all completed tasks since Monday"
- "Create executive summary for Colin"

## 🔄 Integration with Existing Agents

### Policeman ↔ PM Agent
```bash
# Policeman receives high-level request
docker exec casper-policeman claude "Build a user dashboard"

# Policeman consults PM for planning
docker exec casper-pm claude "Create subtasks for building a user dashboard"

# PM creates tasks and assigns to agents
# Returns task IDs to Policeman for tracking
```

### Developer ↔ PM Agent
```bash
# Developer starts work
docker exec casper-developer-1 claude "What's my next task?"
docker exec casper-pm claude "Get next priority task for Developer-1"

# During development
docker exec casper-developer-1 claude "I need the API specs for user service"
docker exec casper-pm claude "Add comment to BAC-125: Developer-1 needs API specs"
```

### Tester ↔ PM Agent
```bash
# Tester checks for work
docker exec casper-tester claude "Any tasks ready for testing?"
docker exec casper-pm claude "List all tasks in 'Ready for Testing' status"

# After testing
docker exec casper-tester claude "All tests pass for BAC-126"
docker exec casper-pm claude "Update BAC-126 to 'Ready for UAT'"
```

## 🚨 Critical Workflows

### Enforcing Test Requirements
```bash
# Developer tries to mark task as done
Developer: "Task complete"
PM Agent: "Cannot mark complete. Missing: TUT ❌, FUT ❌, SIT ❌, RGT ❌"

# After tests are run
Tester: "All tests passing for BAC-127"
PM Agent: "Task BAC-127 ready for UAT. Creating UAT subtask for Colin."
```

### Blocker Escalation
```bash
# 30 minutes after blocker reported
PM Agent: "⚠️ ESCALATION: BAC-128 blocked for 30+ minutes"
PM Agent: "Creating high-priority issue for Colin"
PM Agent: "Suggesting alternative tasks for blocked developer"
```

## 💡 Best Practices

1. **Start Every Session with PM Status Check**
   - Prevents duplicate work
   - Ensures focus on priorities
   - Maintains context

2. **Update Progress Frequently**
   - Every 25% completion
   - When switching tasks
   - When encountering issues

3. **Use PM for All Task State Changes**
   - Creates audit trail
   - Triggers notifications
   - Updates dashboards

4. **Report Blockers Immediately**
   - Enables quick resolution
   - Allows work redistribution
   - Tracks impediments

5. **End Sessions with Summary**
   - Captures work done
   - Plans next steps
   - Maintains momentum

## 🎯 Example: Full Feature Development Flow

```bash
# 1. Colin requests new feature
Colin: "Add two-factor authentication to the app"

# 2. PM Agent creates structure
docker exec casper-pm claude "Create feature tasks for two-factor authentication"
# Creates: BAC-130 (parent), BAC-131 (API), BAC-132 (UI), BAC-133 (Tests)

# 3. Policeman coordinates
docker exec casper-policeman claude "Plan implementation for two-factor auth"
# PM Agent provides task breakdown and dependencies

# 4. Developers work
docker exec casper-developer-2 claude "Starting work on 2FA API"
docker exec casper-pm claude "Update BAC-131 to 'In Progress', assigned to Developer-2"

# 5. Progress tracking
docker exec casper-pm claude "Show progress on 2FA feature"
# Returns: API 60%, UI 30%, Tests not started

# 6. Testing phase
docker exec casper-developer-2 claude "2FA API complete"
docker exec casper-pm claude "Update BAC-131 to 'Ready for Testing'"
docker exec casper-tester claude "Starting 2FA API tests"

# 7. Completion
docker exec casper-pm claude "All 2FA subtasks complete, ready for UAT"
# Creates UAT task for Colin
```

## 🔮 Future Enhancements

1. **Automated Status Updates**
   - Git commits trigger Linear updates
   - Test results update task status
   - Build failures create blockers

2. **Predictive Planning**
   - ML-based effort estimation
   - Risk assessment
   - Optimal task ordering

3. **Dashboard Integration**
   - Real-time task visualization
   - Burndown charts
   - Agent utilization metrics

Remember: The PM Agent is your persistent memory. Use it to maintain momentum across sessions and ensure nothing falls through the cracks!