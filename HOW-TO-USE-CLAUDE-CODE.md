# How to Use Claude Code in CASPER Containers

## 🚀 Quick Start

Once you SSH into any container, Claude Code is already installed and ready. You have several options:

### 1. Direct Command (One-Shot)
```bash
# Give Claude a task directly
claude "Create a Python hello world script"

# Claude will complete the task and exit
```

### 2. Interactive Mode (Conversational)
```bash
# Start an interactive session
claude

# You'll see a prompt where you can have a conversation
# Type your requests and Claude will respond
# Type 'exit' or Ctrl+D to leave
```

### 3. With Context File
```bash
# Provide initial context from a file
claude --context myproject.md "Implement the features described"
```

### 4. Multi-line Input
```bash
# For complex requests
claude "$(cat << 'EOF'
I need you to:
1. Create a REST API with Flask
2. Add user authentication
3. Include tests
EOF
)"
```

## 📝 Common Usage Patterns

### As Policeman (Orchestrator) - Port 2222
```bash
# SSH in
ssh claude@localhost -p 2222

# Option 1: Use Claude Code for orchestration
claude "As the master orchestrator, coordinate the team to build a chat application"

# Option 2: Use Python scripts directly
python3 /home/claude/workspace/scripts/demo-swarm.py
python3 /home/claude/workspace/scripts/swarm-orchestrator.py

# Option 3: Interactive orchestration
claude
> I need to coordinate multiple agents to build an e-commerce platform
> Spawn 3 developers for frontend, backend, and API
> ... continue conversation ...
```

### As Developer (Specialist) - Ports 2223/2224
```bash
# SSH in
ssh claude@localhost -p 2223

# Direct coding task
claude "Implement a React component for user login"

# Interactive development
claude
> Create a dashboard component
> Add charts using Chart.js
> Include responsive design
```

### As Tester - Port 2225
```bash
# SSH in
ssh claude@localhost -p 2225

# Testing tasks
claude "Write unit tests for the authentication module"

# Test review
claude "Review this code for potential bugs" < mycode.js
```

## 🎯 Important Notes

1. **No Need to "Start" Claude Code**
   - It's a CLI tool, not a service
   - Just type `claude` when you need it

2. **Environment Already Set**
   - API keys are loaded from .env
   - No additional configuration needed

3. **Working Directory**
   - You start in `/home/claude`
   - Shared workspace at `/home/claude/workspace`
   - Projects at `/home/claude/workspace/projects`

4. **Available Commands**
   ```bash
   claude --help          # See all options
   claude --version       # Check version (1.0.30)
   claude list            # List recent conversations
   ```

## 💡 Pro Tips

### 1. Pipe Input/Output
```bash
# Pipe code for review
cat myfile.py | claude "Review this Python code"

# Save Claude's output
claude "Create a README for my project" > README.md
```

### 2. Use Shell Aliases
```bash
# Add to ~/.bashrc
alias chat='claude'
alias code='claude "Write code for:"'
alias review='claude "Review this code:"'
```

### 3. Combine with Other Tools
```bash
# Let Claude analyze git changes
git diff | claude "Explain these changes"

# Have Claude write commit messages
git diff --staged | claude "Write a commit message for these changes"
```

## 🔧 Current Limitation

**Note**: Claude Code currently responds with its default prompt, not understanding its orchestrator role. This is why we also have Python scripts for proven orchestration:

```bash
# Proven to work - demonstrates 3.7x speedup
python3 /home/claude/workspace/scripts/demo-swarm.py

# Full orchestration capabilities
python3 /home/claude/workspace/scripts/swarm-orchestrator.py
```

## 📚 Examples by Role

### Policeman Examples
```bash
# Check agent status (currently mock)
claude "Show me the status of all agents"

# Plan a project
claude "Create a development plan for a social media app"
```

### Developer Examples
```bash
# Frontend (port 2223)
claude "Create a React hook for form validation"

# Backend (port 2224)
claude "Design a REST API for user management"
```

### Tester Examples
```bash
# Create test suite
claude "Write comprehensive tests for a shopping cart module"

# Security review
claude "Check this code for security vulnerabilities" < app.js
```

## 🎮 Quick Start Commands

```bash
# After SSH login, try these:
claude --version                     # Verify it's working
claude "Hello"                       # Quick test
claude                              # Start interactive mode
cd /home/claude/workspace/projects  # Go to shared projects
python3 ../scripts/demo-swarm.py    # See swarm orchestration
```

Remember: Claude Code is a command-line tool - you run it when needed, not as a persistent service!