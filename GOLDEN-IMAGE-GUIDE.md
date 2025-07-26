# CASPER Golden Image Guide

## Overview

The Golden Image contains Claude Code pre-installed with:
- ✅ Full Claude Code CLI capabilities
- ✅ MCP server support (filesystem, GitHub, Linear)
- ✅ Proven hook validation system
- ✅ Swarm orchestration capabilities
- ✅ All dependencies pre-installed

## Building the Golden Image

### Prerequisites
- Claude Code installed on your host machine
- Docker Desktop running
- API keys in `.env` file

### Build Process

1. **Run the FIXED build script:**
   ```bash
   ./build-golden-fixed.sh
   ```
   
   ⚠️ **IMPORTANT**: Use `build-golden-fixed.sh`, NOT the original script!
   - Original only copied binary → caused "module not found" errors
   - Fixed script copies entire npm module → works perfectly

2. **The script automatically:**
   - Finds Claude Code installation
   - Copies ENTIRE npm module (178MB)
   - Creates proper symlinks
   - Sets up environment

3. **Verify the build:**
   ```bash
   docker images | grep casper-golden
   # Should show: casper-golden:fixed (1.96GB)
   ```

### Alternative: Manual Installation

If the snapshot method doesn't work:

```bash
# 1. Start a container
docker run -it --name claude-setup \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ubuntu:22.04 /bin/bash

# 2. Inside container, install Claude Code manually
# (Follow your normal Claude Code installation process)

# 3. From another terminal, commit the container
docker commit claude-setup casper-golden:latest

# 4. Clean up
docker rm claude-setup
```

## Using the Golden Image

### 1. Start CASPER with Golden Image
```bash
docker-compose -f docker-compose.golden.yml up -d
```

### 2. Access the Policeman (Master Orchestrator)

⚠️ **CRITICAL**: Use correct command format to avoid setup prompts!

```bash
# ✅ CORRECT - No setup prompts
docker exec casper-policeman claude "Your request"

# ❌ WRONG - Triggers interactive setup
docker exec -it casper-policeman claude

# For interactive shell (setup required first time)
docker exec -it casper-policeman /bin/bash
# Then: claude "Your request"
```

### 3. Example Orchestration Commands

#### Simple Task
```bash
docker exec -it casper-policeman claude "Create a React dashboard component"
```

#### Complex Orchestration
```bash
docker exec -it casper-policeman claude "As the master orchestrator, coordinate the team to build a complete e-commerce platform. Use parallel execution for maximum efficiency. Ensure all code passes hook validation."
```

#### Direct Swarm Control
```bash
# Run the proven 15-agent expense tracker build
docker exec -it casper-policeman python3 /home/claude/workspace/scripts/swarm-orchestrator.py

# Performance demo
docker exec -it casper-policeman python3 /home/claude/workspace/scripts/demo-swarm.py
```

### 4. Dynamic Agent Spawning

The Policeman can spawn additional agents:

```bash
# Scale up agent-spawn service
docker-compose -f docker-compose.golden.yml scale agent-spawn=5

# The Policeman can now coordinate 5 additional agents
```

## Key Differences from Basic Setup

| Feature | Basic Setup | Golden Image |
|---------|------------|--------------|
| Claude Code | Not installed | Pre-installed |
| MCP Servers | Not available | Fully configured |
| Hooks | Config only | Active validation |
| Orchestration | Python scripts | Native Claude Code |
| Agent Intelligence | Limited | Full Claude capabilities |

## Orchestration Capabilities

With the golden image, the Policeman understands:

1. **Its Role**: Master orchestrator of the swarm
2. **Spawning**: Can create up to 15 parallel agents
3. **Optimization**: Knows to use parallel execution (3.7x faster)
4. **Validation**: All outputs pass through hook system
5. **Coordination**: Uses Redis/PostgreSQL for state

## Example Workflows

### 1. Cognitive Triangulation (5 Agents)
```bash
docker exec -it casper-policeman claude "
As Master Orchestrator, spawn 5 specialized agents for cognitive triangulation:
1. Intent Validator - Ensure code matches user requirements
2. Code Critic - Review for best practices and patterns
3. Bug Hunter - Find potential issues and edge cases
4. Performance Optimizer - Suggest efficiency improvements
5. Documentation Specialist - Ensure clear documentation

Coordinate their parallel analysis of all code produced. Each agent should critique and validate the others' work."
```

### 2. Large-Scale Refactoring
```bash
docker exec -it casper-policeman claude "
Orchestrate a complete refactoring of the codebase from JavaScript to TypeScript.
Spawn maximum agents for parallel processing.
Ensure all code passes validation before acceptance.
Track progress and report completion percentage."
```

### 3. Test-Driven Development
```bash
docker exec -it casper-policeman claude "
Implement a chat application using TDD approach:
1. Tester writes tests first
2. Developers implement to pass tests
3. Continuous validation with hooks
4. Iterate until all tests pass"
```

## Monitoring and Logs

### View Orchestration Activity
```bash
# Policeman logs
docker logs -f casper-policeman

# All agent activity
docker-compose -f docker-compose.golden.yml logs -f

# Redis communication
docker exec casper-redis redis-cli -a casper_redis_2024 MONITOR
```

### Check Agent Status
```bash
docker exec casper-policeman claude "Show me the status of all agents and current tasks"
```

## Troubleshooting

### Claude Code Not Found
If Claude Code isn't working in the container:
1. Verify it's installed on your host: `which claude`
2. Rebuild the image with manual method
3. Check the binary is executable: `docker exec casper-policeman ls -la /home/claude/.local/bin/`

### API Key Issues
```bash
# Verify API key is set
docker exec casper-policeman env | grep ANTHROPIC

# Test Claude Code
docker exec casper-policeman claude "Hello"
```

### Hook Validation Failures
```bash
# Check hook permissions
docker exec casper-policeman ls -la /home/claude/workspace/hooks/validators/

# Test hooks manually
docker exec casper-policeman bash /home/claude/workspace/hooks/validators/syntax-check.sh test.js
```

## Best Practices

1. **Always use the golden image** for production orchestration
2. **Let the Policeman decide** when to spawn agents
3. **Trust the hook validation** - it prevents errors
4. **Monitor Redis** for inter-agent communication
5. **Scale gradually** - start with few agents, increase as needed

## Next Steps

1. Build the golden image
2. Test with simple orchestration tasks
3. Graduate to complex multi-agent workflows
4. Monitor performance improvements
5. Customize for your specific needs

The golden image transforms CASPER from a container platform into a true AI orchestration system with Claude Code at its core!