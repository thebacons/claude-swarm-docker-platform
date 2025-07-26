# Parallel Execution Monitoring Hooks Design

## 🎯 Problem Statement
When Claude Code uses the Task tool for parallel execution, all subagent work happens invisibly in the background. The user only sees the final results, missing:
- What each agent is doing
- Progress indicators
- Errors as they happen
- Decision-making process

## 🔧 Proposed Solution: Multi-Terminal Monitoring

### Option 1: Terminal Multiplexer Approach (tmux)
```bash
#!/bin/bash
# hook-parallel-monitor.sh

# When Task tool is invoked, spawn tmux session
tmux new-session -d -s claude-parallel

# Create panes for each subagent
tmux split-window -h
tmux split-window -v
tmux select-pane -t 0
tmux split-window -v

# Attach monitoring to each pane
tmux send-keys -t 0 'tail -f /workspace/logs/agent-1.log' C-m
tmux send-keys -t 1 'tail -f /workspace/logs/agent-2.log' C-m
tmux send-keys -t 2 'tail -f /workspace/logs/agent-3.log' C-m
tmux send-keys -t 3 'tail -f /workspace/logs/agent-4.log' C-m

# Open in new terminal window
gnome-terminal -- tmux attach -t claude-parallel
```

### Option 2: Windows Terminal Tabs (Windows)
```powershell
# For Windows Terminal
wt new-tab --title "Agent 1" cmd /k "docker exec -it casper-observer tail -f /logs/agent-1.log" `; new-tab --title "Agent 2" cmd /k "docker exec -it casper-observer tail -f /logs/agent-2.log"
```

### Option 3: Web-Based Dashboard
```javascript
// Real-time monitoring dashboard
const MonitoringDashboard = {
  agents: [],
  
  startMonitoring(taskCount) {
    // Open dashboard in browser
    window.open('http://localhost:3100/parallel-monitor', '_blank');
    
    // Create WebSocket connections for each agent
    for (let i = 0; i < taskCount; i++) {
      this.agents[i] = new WebSocket(`ws://localhost:3100/agent/${i}`);
      this.agents[i].onmessage = (event) => {
        this.updateAgentDisplay(i, event.data);
      };
    }
  }
};
```

## 📊 Hook Integration Points

### 1. Pre-Task Hook
```json
{
  "preToolUse": [{
    "matcher": {"tools": ["Task"]},
    "command": "bash /workspace/hooks/start-parallel-monitor.sh ${CLAUDE_TASK_COUNT}"
  }]
}
```

### 2. During-Task Hook
```json
{
  "duringExecution": [{
    "matcher": {"tools": ["Task"]},
    "stream": true,
    "command": "tee /workspace/logs/parallel-execution.log | bash /workspace/hooks/stream-to-terminals.sh"
  }]
}
```

### 3. Post-Task Hook
```json
{
  "postToolUse": [{
    "matcher": {"tools": ["Task"]},
    "command": "bash /workspace/hooks/aggregate-results.sh"
  }]
}
```

## 🖥️ Implementation Strategy

### Phase 1: Basic Logging (Immediate)
1. Modify Task tool invocations to include logging
2. Write subagent activities to separate log files
3. Use `tail -f` in multiple terminals

### Phase 2: Smart Terminal Management
1. Detect number of parallel tasks
2. Auto-spawn appropriate number of terminals
3. Color-code output by agent
4. Add progress indicators

### Phase 3: Interactive Dashboard
1. Web-based real-time monitor
2. Pause/resume individual agents
3. Drill down into specific operations
4. Export execution traces

## 🎬 Example Usage

When you see me starting parallel tasks, you would:

```bash
# 1. I announce parallel execution
"Starting 3 parallel tasks..."

# 2. Hook automatically opens 3 terminals
Terminal 1: "Agent 1: Analyzing project structure..."
Terminal 2: "Agent 2: Checking Linear tasks..."
Terminal 3: "Agent 3: Reading documentation..."

# 3. Real-time updates in each terminal
Terminal 1: "Agent 1: Found 45 files to analyze"
Terminal 2: "Agent 2: Retrieved 12 active tasks"
Terminal 3: "Agent 3: Processing 8 documents"

# 4. Completion status
Terminal 1: "Agent 1: ✅ Complete - 45 files analyzed"
Terminal 2: "Agent 2: ✅ Complete - 12 tasks retrieved"
Terminal 3: "Agent 3: ✅ Complete - 8 documents processed"
```

## 🔍 Quality Assurance Benefits

1. **Visibility**: See exactly what each agent is doing
2. **Debugging**: Catch errors as they happen
3. **Performance**: Monitor which agents are slow
4. **Validation**: Ensure agents are doing what you expect
5. **Learning**: Understand the parallel execution patterns

## 🚀 Quick Implementation

For immediate visibility, add this to your `.bashrc`:

```bash
# Function to monitor Claude parallel execution
claude-monitor() {
    # Start 4 terminal windows with log tails
    for i in {1..4}; do
        gnome-terminal --title="Claude Agent $i" -- bash -c "tail -f ~/claude-logs/agent-$i.log; exec bash"
    done
}
```

Then when I use parallel execution, you can run `claude-monitor` to see all agents in action.