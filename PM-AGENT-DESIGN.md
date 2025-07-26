# Linear PM Agent Design Document

## 🎯 Core Purpose
The PM Agent serves as the **persistent project memory** and **execution coordinator** for the CASPER multi-agent system, ensuring continuous progress toward project goals regardless of session boundaries.

## 🧠 Key Responsibilities

### 1. Session Initialization
When any Claude session starts:
```
PM Agent → "Good morning! Here's what we were working on:"
- Active sprint: Sprint 3 (ends Friday)
- In progress: BAC-73 (Autonomous Agent Implementation) - 60% complete
- Blockers: Waiting for UAT on BAC-72
- Today's priorities: [Ordered list from Linear]
```

### 2. Daily Planning
Every morning (or session start):
- Query Linear for sprint tasks
- Identify dependencies and blockers
- Create daily execution plan
- Assign specific tasks to agents
- Set completion targets

### 3. Progress Tracking
Throughout the day:
- Monitor task status changes
- Track time spent on tasks
- Update Linear with progress
- Identify when agents are stuck
- Escalate blockers to Colin

### 4. Quality Enforcement
Before any task can be marked complete:
- Verify TUT completed ✓
- Verify FUT completed ✓
- Verify SIT completed ✓
- Verify RGT completed ✓
- Create UAT task for Colin
- Block completion until all tests pass

### 5. Reporting
Automated reports:
- **Hourly**: Quick progress update to Policeman
- **Daily**: Standup summary for Colin
- **Weekly**: Sprint retrospective data
- **On-demand**: Current status for any task

## 🔧 Technical Implementation

### Linear API Integration
```python
class LinearPMAgent:
    def __init__(self):
        self.linear = LinearAPI()
        self.current_sprint = None
        self.active_tasks = {}
        self.blocked_tasks = {}
    
    def start_session(self):
        """Called when any Claude session begins"""
        self.current_sprint = self.linear.get_current_sprint()
        self.active_tasks = self.linear.get_in_progress_tasks()
        self.blocked_tasks = self.linear.get_blocked_tasks()
        return self.generate_session_briefing()
    
    def assign_daily_work(self):
        """Create optimal work distribution"""
        available_tasks = self.linear.get_ready_tasks()
        agent_capacity = self.check_agent_availability()
        return self.optimize_assignments(available_tasks, agent_capacity)
```

### Communication Patterns
```
User Request → PM Agent → Linear Query → Task Breakdown
                  ↓
            Policeman ← Work Assignment
                  ↓
         Developer Agents ← Specific Tasks
                  ↓
            PM Agent ← Progress Updates → Linear
```

## 📋 PM Agent Workflows

### Workflow 1: New Feature Request
1. User: "Add dark mode to the dashboard"
2. PM Agent:
   - Creates parent issue in Linear
   - Breaks down into sub-tasks
   - Estimates effort based on historical data
   - Assigns to current or next sprint
   - Creates implementation plan

### Workflow 2: Daily Standup
```
PM Agent (automatic at session start):
"📊 Daily Standup for [Date]

Yesterday:
- ✅ Completed: BAC-71 (SSH container access)
- 🔄 In Progress: BAC-73 (60% - Autonomous agents)
- ❌ Blocked: BAC-74 (Waiting for API key)

Today's Focus:
1. Complete BAC-73 implementation
2. Start BAC-75 testing phase
3. Review PR for BAC-71

Team Capacity:
- Developer-1: Available (0 tasks)
- Developer-2: Busy (2 tasks)
- Tester: Available (1 task)
```

### Workflow 3: Blocker Resolution
```
Developer-1: "Stuck on OAuth implementation"
PM Agent:
1. Updates Linear issue with blocker
2. Checks if other agents have solved similar issues
3. Suggests relevant documentation/PRs
4. If still blocked after 30min, escalates to Colin
5. Reassigns task if critical path affected
```

## 🎨 Integration with Existing System

### Docker Compose Addition
```yaml
casper-pm:
  image: casper-golden:fixed
  container_name: casper-pm
  environment:
    - CONTAINER_ROLE=project-manager
  volumes:
    - ./linear-cache:/workspace/linear-cache
  command: tail -f /dev/null
```

### CLAUDE.md for PM Agent
```markdown
# You are the Project Manager Agent

You are the persistent memory and coordinator for the CASPER system.

## Primary Directive
Ensure continuous progress toward project goals by maintaining context across sessions and coordinating agent activities through Linear.

## Key Behaviors
1. ALWAYS start by checking Linear for current state
2. NEVER allow tasks to be marked complete without all tests passing
3. PROACTIVELY identify and escalate blockers
4. MAINTAIN accurate time tracking for better estimates
5. ENFORCE the defined development workflow

## Available Tools
- /workspace/scripts/linear-wrapper.sh (enhanced with PM functions)
- Direct SQL access to PostgreSQL for metrics
- Redis pub/sub for real-time agent coordination
```

## 📈 Success Metrics

### Efficiency Metrics
- Time to task completion (target: 20% reduction)
- Blocker resolution time (target: <2 hours)
- Test coverage compliance (target: 100%)
- Sprint completion rate (target: 90%+)

### Quality Metrics
- Tasks completed without test failures: 95%+
- Rework rate: <10%
- Documentation completeness: 100%
- Code review turnaround: <4 hours

### Coordination Metrics
- Agent idle time: <20%
- Parallel task conflicts: <5%
- Handoff success rate: 98%+
- Context preservation: 100%

## 🚀 Implementation Phases

### Phase 1: Basic PM Functions (Day 1-2)
- [ ] Deploy PM container
- [ ] Implement session briefing
- [ ] Create daily planning workflow
- [ ] Basic Linear integration

### Phase 2: Advanced Coordination (Day 3-4)
- [ ] Dependency tracking
- [ ] Blocker detection and escalation
- [ ] Multi-agent task optimization
- [ ] Progress visualization

### Phase 3: Intelligence Layer (Day 5+)
- [ ] Historical data analysis
- [ ] Effort estimation ML model
- [ ] Predictive blocker detection
- [ ] Automated sprint planning

## 💡 Future Enhancements

1. **AI-Powered Insights**
   - Pattern recognition in blockers
   - Automatic similar issue detection
   - Performance anomaly alerts

2. **Predictive Planning**
   - ML-based effort estimation
   - Risk assessment for tasks
   - Optimal sprint composition

3. **Advanced Reporting**
   - Real-time dashboard integration
   - Stakeholder-specific views
   - Automated weekly summaries

## 🎯 Why This Matters

The PM Agent transforms CASPER from a reactive system to a **proactive, self-managing development team** that:
- Never loses context between sessions
- Maintains consistent velocity
- Catches issues before they become blockers
- Provides complete audit trail
- Enables true 24/7 autonomous development

With the PM Agent, you could literally say "Continue working on the autonomous agent implementation" and the system would know exactly where it left off, what's next, and how to proceed efficiently.