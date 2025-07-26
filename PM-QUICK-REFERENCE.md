# PM Agent Quick Reference Card

## 🚀 Session Start Commands
```bash
# ALWAYS START WITH THIS:
docker exec casper-pm claude "What's our current project status and today's priorities?"

# Check blockers:
docker exec casper-pm claude "Are there any blocked tasks?"

# Get your specific tasks:
docker exec casper-pm claude "What should [Agent Name] work on?"
```

## 📝 During Work Commands
```bash
# Update progress:
docker exec casper-pm claude "Update [TASK-ID] to 50% complete"

# Report blocker:
docker exec casper-pm claude "Mark [TASK-ID] as blocked: [reason]"

# Add note:
docker exec casper-pm claude "Add comment to [TASK-ID]: [your comment]"

# Check dependencies:
docker exec casper-pm claude "What depends on [TASK-ID]?"
```

## ✅ Task State Transitions
```bash
# Start work:
"Update [TASK-ID] to In Progress"

# Ready for review:
"Update [TASK-ID] to Ready for Testing"

# Testing failed:
"Update [TASK-ID] to Failed Testing with issue: [description]"

# All tests pass:
"Update [TASK-ID] to Ready for UAT"
```

## 🔍 Query Commands
```bash
# Sprint overview:
"Show current sprint progress"

# Agent workload:
"What tasks are assigned to each agent?"

# Testing queue:
"List all tasks ready for testing"

# Completed work:
"What was completed today?"
```

## 🚨 Important Rules
1. **NEVER** mark tasks complete without all tests (TUT, FUT, SIT, RGT)
2. **ALWAYS** update task status when switching work
3. **REPORT** blockers within 5 minutes of discovery
4. **CHECK** PM status at start of EVERY session

## 💡 Pro Tips
- Use PM Agent as your "external brain" - log everything
- Update progress every 25% to maintain accurate tracking
- Check for dependencies before starting new tasks
- End sessions with a summary for easy next-session startup

## 🎯 Container Access
```bash
# PM Agent:
docker exec casper-pm claude "[your command]"

# Direct Linear access (if needed):
docker exec casper-pm bash -c 'LINEAR_API_KEY=${LINEAR_API_KEY} /workspace/scripts/linear-wrapper.sh list-issues'
```

Remember: PM Agent = Your Persistent Memory!