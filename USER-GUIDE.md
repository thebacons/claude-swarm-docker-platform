# CASPER User Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Understanding CASPER](#understanding-casper)
3. [Basic Usage](#basic-usage)
4. [Advanced Features](#advanced-features)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [FAQ](#faq)

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- WSL2 enabled (for Windows users)
- Anthropic API key or Claude subscription
- 8GB+ RAM available
- Basic command line knowledge

### 5-Minute Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd claude-swarm-docker-spawn
```

2. **Configure API keys**
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

3. **Build and start CASPER**
```bash
./build-golden-fixed.sh
docker-compose -f docker-compose.golden.yml up -d
```

4. **Copy Claude authentication** (if using Claude subscription)
```bash
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    docker cp ~/.claude/.credentials.json $container:/home/claude/.claude/.credentials.json
    docker exec $container chown claude:claude /home/claude/.claude/.credentials.json
done
```

5. **Test the system**
```bash
./run-swarm.sh
# Select option 1 to test basic functionality
```

## Understanding CASPER

### What is CASPER?
CASPER (Claude Agent Swarm Platform for Enhanced Robotics) is a system that coordinates multiple AI agents to work together on software development tasks. Think of it as having a team of specialized AI developers working in parallel.

### Key Components

#### The Policeman (Orchestrator)
- **Role**: Team leader who receives tasks and distributes work
- **Port**: 8080 (web interface)
- **Container**: `casper-policeman`

#### Developer Agents
- **Developer-1**: Frontend specialist
- **Developer-2**: Backend specialist  
- **Role**: Write code based on assignments
- **Containers**: `casper-developer-1`, `casper-developer-2`

#### Tester Agent
- **Role**: Quality assurance and testing
- **Container**: `casper-tester`

#### Supporting Services
- **Redis**: Message passing between agents
- **PostgreSQL**: Task tracking and state management
- **Dashboard**: Web UI for monitoring (port 3000)

### How It Works

1. You give a task to the Policeman
2. Policeman breaks it down into subtasks
3. Subtasks are assigned to appropriate agents
4. Agents work in parallel
5. Results are validated and combined
6. Final output is delivered to you

## Basic Usage

### Method 1: Interactive Menu (Recommended)

```bash
./run-swarm.sh
```

This presents a menu:
```
=== CASPER Swarm Orchestrator ===

1. Run Interactive Orchestrator
2. Run Performance Demo
3. Build Expense Tracker (15 agents)
4. Custom Task
5. Exit

Select option:
```

### Method 2: Direct Commands

#### Simple Task
```bash
docker exec casper-policeman claude "Create a React login component"
```

#### Complex Task with Orchestration
```bash
docker exec -it casper-policeman python3 /workspace/scripts/swarm-orchestrator.py
```

### Method 3: Using Individual Agents

#### Access specific agent
```bash
docker exec -it casper-developer-1 /bin/bash
# Now you're inside the developer-1 container
```

#### Run agent-specific task
```bash
docker exec casper-developer-1 claude "Write a Python function to sort a list"
```

## Advanced Features

### 1. Parallel Execution

CASPER can run multiple agents simultaneously for faster results:

```python
# In swarm-orchestrator.py
tasks = {
    'developer-1': 'Create the UI components',
    'developer-2': 'Build the API endpoints',
    'tester': 'Write unit tests'
}
results = swarm.parallel_task(tasks)
```

### 2. Wave-Based Execution

Execute tasks in organized waves:

```yaml
# swarm-config.yaml
waves:
  - name: "Core Development"
    agents: ["developer-1", "developer-2", "developer-3"]
    tasks: ["database schema", "API structure", "frontend scaffold"]
    
  - name: "Implementation"
    agents: ["developer-1", "developer-2", "developer-3", "developer-4", "developer-5"]
    tasks: ["user auth", "data models", "UI components", "API endpoints", "middleware"]
```

### 3. Custom Agent Configuration

Create specialized agents by editing `swarm-config.yaml`:

```yaml
instances:
  ai-architect:
    description: "System architecture specialist"
    model: "claude-3-5-sonnet-20241022"
    tools: ["Read", "Write", "Edit"]
    directory: "./projects/architecture"
    
  security-expert:
    description: "Security and authentication expert"
    model: "claude-3-5-sonnet-20241022"
    tools: ["Read", "Write", "SecurityScan"]
```

### 4. Hook Validation System

Automatic code validation prevents errors:

```bash
# View hook configuration
cat /workspace/hooks/validators/syntax-check.sh

# Test hooks manually
docker exec casper-policeman /workspace/test-container-hooks.sh
```

### 5. Monitoring and Logs

#### Real-time monitoring
```bash
# Watch all container logs
docker-compose -f docker-compose.golden.yml logs -f

# Monitor specific agent
docker logs -f casper-developer-1

# Watch Redis messages
docker exec -it casper-redis redis-cli MONITOR
```

#### Check task status
```bash
# Query PostgreSQL for task history
docker exec -it casper-postgres psql -U claude -d claude_orchestration -c "SELECT * FROM tasks ORDER BY created_at DESC LIMIT 10;"
```

## Common Tasks

### 1. Building a Web Application

```bash
./run-swarm.sh
# Select option 3 for expense tracker demo
# Or use custom task:

docker exec -it casper-policeman python3 -c "
from swarm_orchestrator import SwarmOrchestrator
swarm = SwarmOrchestrator('/workspace/swarm-config.yaml')

task = '''Create a complete todo application with:
- React frontend with Material-UI
- Node.js Express backend
- PostgreSQL database
- User authentication
- RESTful API'''

result = swarm.delegate_task(task)
print(result)
"
```

### 2. Refactoring Code

```bash
# Place files to refactor in projects directory
cp -r /path/to/your/code ./projects/

# Run refactoring task
docker exec casper-policeman claude "Refactor all JavaScript files in /workspace/projects to use modern ES6+ syntax and add proper error handling"
```

### 3. Creating Documentation

```bash
docker exec casper-policeman claude "Generate comprehensive documentation for the codebase in /workspace/projects including API docs, setup guide, and architecture overview"
```

### 4. Running Tests

```bash
docker exec casper-tester claude "Create and run comprehensive test suite for the application in /workspace/projects"
```

### 5. Code Review

```bash
docker exec casper-policeman claude "Review the code in /workspace/projects for security vulnerabilities, performance issues, and best practices"
```

## Troubleshooting

### Container Issues

#### Container won't start
```bash
# Check logs
docker logs casper-policeman

# Verify .env file
cat .env | grep ANTHROPIC_API_KEY

# Rebuild containers
docker-compose -f docker-compose.golden.yml down
docker-compose -f docker-compose.golden.yml build --no-cache
docker-compose -f docker-compose.golden.yml up -d
```

#### SSH Connection Issues
```bash
# Start SSH container
./start-ssh-container.sh

# Test connection
ssh developer@localhost -p 2222
# Password: claude
```

### Performance Issues

#### Slow execution
```bash
# Check resource usage
docker stats

# Increase resource limits in docker-compose.yml
services:
  developer-1:
    deploy:
      resources:
        limits:
          cpus: '4'    # Increase from 2
          memory: 4G   # Increase from 2G
```

#### API rate limits
```bash
# Check for rate limit errors
docker logs casper-policeman | grep -i "rate"

# Add delays between requests in swarm-config.yaml
execution:
  delay_between_tasks: 2  # seconds
```

### Common Errors

| Error | Solution |
|-------|----------|
| "ANTHROPIC_API_KEY not found" | Check .env file and restart containers |
| "Container casper-policeman not found" | Run `docker-compose up -d` |
| "Permission denied" | Run with `sudo` or fix Docker permissions |
| "Port already in use" | Change port in docker-compose.yml |
| "Out of memory" | Increase Docker Desktop memory allocation |

## Best Practices

### 1. Task Design
- Break large tasks into smaller, specific subtasks
- Provide clear requirements and expected outputs
- Include examples when possible

### 2. Resource Management
- Monitor resource usage with `docker stats`
- Stop unused containers to free resources
- Use wave execution for large projects

### 3. Code Organization
```
projects/
├── project-1/
│   ├── frontend/
│   ├── backend/
│   └── tests/
└── project-2/
    ├── src/
    └── docs/
```

### 4. Security
- Never commit .env files
- Rotate API keys regularly
- Use read-only mounts for sensitive directories
- Run containers as non-root user (default)

### 5. Debugging
```bash
# Enter container for debugging
docker exec -it casper-policeman /bin/bash

# Check agent status
cd /workspace
python3 -c "
from swarm_orchestrator import SwarmOrchestrator
swarm = SwarmOrchestrator('swarm-config.yaml')
print(swarm.agents.keys())
"
```

## FAQ

### Q: How many agents can run simultaneously?
A: Tested with up to 15 agents. Theoretical limit depends on your system resources.

### Q: Can I use different AI models?
A: Yes, edit `swarm-config.yaml` to specify different Claude models per agent.

### Q: How do I add more developer agents?
A: Scale using Docker Compose:
```bash
docker-compose -f docker-compose.golden.yml up -d --scale developer=5
```

### Q: Can agents communicate with each other?
A: Yes, through Redis pub/sub. Agents can share context and results.

### Q: How do I persist data between sessions?
A: Data in `./projects` is persisted. PostgreSQL stores all task history.

### Q: Can I use this in production?
A: Yes, but implement proper security, monitoring, and backup strategies.

### Q: How do I update CASPER?
A: 
```bash
git pull origin main
docker-compose -f docker-compose.golden.yml build --no-cache
docker-compose -f docker-compose.golden.yml up -d
```

### Q: Can I customize agent behaviors?
A: Yes, by:
1. Editing CLAUDE.md in each container
2. Modifying swarm-config.yaml
3. Creating custom Python scripts

### Q: What happens if an agent fails?
A: The orchestrator detects failures and can retry or reassign tasks.

### Q: How do I monitor costs?
A: Check API usage in your Anthropic dashboard. Each agent uses separate API calls.

## Getting Help

1. **Check logs**: `docker logs casper-policeman`
2. **Read documentation**: See other .md files in the repository
3. **Test components**: Use test scripts in the repository
4. **Debugging**: SSH into containers for direct access

## Next Steps

1. Try the performance demo to see parallel execution
2. Build a sample application using multiple agents
3. Customize agents for your specific needs
4. Integrate with your development workflow

Remember: CASPER is designed to augment your development process, not replace human oversight. Always review generated code and test thoroughly before production use.