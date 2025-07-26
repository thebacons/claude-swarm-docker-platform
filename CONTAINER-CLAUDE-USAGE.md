# Using Claude Code Across Containers - Simple Guide

## 🎯 The Scenario
You're logged into the Policeman container and want to run Claude Code on other containers.

## 🚀 Method 1: Docker Exec (From Policeman)

First, SSH into Policeman:
```bash
ssh claude@localhost -p 2222
```

Then, you need Docker client installed in Policeman:
```bash
# One-time setup in Policeman
sudo apt-get update && sudo apt-get install -y docker.io
sudo usermod -aG docker claude
# Log out and back in for group change to take effect
```

Now you can control other containers:
```bash
# From inside Policeman container
docker exec casper-developer-1 claude "Create a login form"
docker exec casper-developer-2 claude "Create user API"
docker exec casper-tester claude "Write login tests"
```

## 🔐 Method 2: SSH (Container to Container)

From inside Policeman, SSH to other containers:

```bash
# From Policeman to Developer-1
ssh claude@developer-1
# Password: claude
# Now you're in Developer-1
claude "Create a React component"
exit

# Or run directly without entering the container
sshpass -p claude ssh claude@developer-1 'bash -lc "claude \"Create a navbar\""'
```

## 📜 Method 3: Orchestration Script

From your host machine (not inside container):
```bash
# This script runs Claude across multiple containers
./orchestrate-claude.sh

# Choose option 1 for parallel execution
# Choose option 2 for sequential execution
```

## 🐍 Method 4: Python Orchestration (Already Working!)

The proven method that works today:
```bash
# SSH into Policeman
ssh claude@localhost -p 2222

# Run the demo
python3 /home/claude/workspace/scripts/demo-swarm.py
```

## 💡 Key Points

1. **Container Names**: Inside the Docker network, use hostnames:
   - `developer-1` (not casper-developer-1)
   - `developer-2`
   - `tester`
   - `policeman`

2. **Ports**: 
   - External (from host): 2222, 2223, 2224, 2225
   - Internal (container-to-container): 22

3. **Environment**: Claude needs API key, which is already set in containers

## 🎮 Quick Examples

### Example 1: Policeman Orchestrating Development
```bash
# SSH into Policeman
ssh claude@localhost -p 2222

# Install sshpass if not already done
sudo apt-get install -y sshpass

# Send tasks to all developers
sshpass -p claude ssh claude@developer-1 'bash -lc "claude \"Build header component\""' &
sshpass -p claude ssh claude@developer-2 'bash -lc "claude \"Create user model\""' &
wait
```

### Example 2: Simple Task Distribution
```bash
# From your host machine, distribute tasks
docker exec casper-policeman claude "Plan the architecture"
docker exec casper-developer-1 claude "Implement the frontend"
docker exec casper-developer-2 claude "Build the backend"
docker exec casper-tester claude "Create test suite"
```

## 🔮 Current vs Future

**Current Reality**: You need to manually coordinate between containers using SSH or docker exec.

**Future Vision**: Claude in Policeman would understand it's the orchestrator and automatically distribute tasks.

**Working Today**: Python scripts demonstrate the orchestration with proven 3.7x speedup.

## 🎯 Simplest Approach

If you just want to run Claude in different containers from your host:

```bash
# Terminal 1
docker exec -it casper-developer-1 claude

# Terminal 2 
docker exec -it casper-developer-2 claude

# Terminal 3
docker exec -it casper-tester claude

# They all run in parallel, you can type in each
```

This gives you multiple Claude instances running simultaneously!