# 🚀 CASPER Golden Image - Quick Access Cheat Sheet

## 🔥 Most Common Commands

### Direct Access (Copy & Paste Ready)
```bash
# Access Policeman orchestrator
docker exec -it casper-policeman /bin/bash

# Quick Claude Code test
docker exec casper-policeman claude --version

# Run swarm demo (3.4x speedup)
docker exec casper-policeman python3 /home/claude/workspace/scripts/demo-swarm.py

# Interactive Claude session
docker exec -it casper-policeman claude
```

## 🌐 Network Details

| Container | Internal IP | Hostname | Purpose |
|-----------|------------|----------|---------|
| casper-policeman | 172.29.0.4 | policeman | Master Orchestrator |
| casper-redis | 172.29.0.2 | redis | Message Broker |
| casper-postgres | 172.29.0.3 | postgres | State Storage |

## 🔑 SSH Access (After Enabling)

### Enable SSH First:
```bash
# 1. Enter container
docker exec -it casper-policeman /bin/bash

# 2. Start SSH (inside container)
sudo service ssh start

# 3. Set password
echo "claude:your_password" | sudo chpasswd
```

### Then Connect:
```bash
# From WSL/Linux
ssh claude@172.29.0.4

# From Windows (if port mapped)
# Add to docker-compose: ports: - "2222:22"
# Then: ssh claude@localhost -p 2222
```

## 📱 PuTTY Quick Setup

1. **Direct Container IP Method**:
   - Host: `172.29.0.4`
   - Port: `22`
   - Username: `claude`

2. **Port-Mapped Method** (Recommended):
   - First add to docker-compose.golden.yml:
     ```yaml
     ports:
       - "2222:22"  # Add this line
     ```
   - Host: `localhost`
   - Port: `2222`
   - Username: `claude`

## ⚡ One-Liner Tests

```bash
# Check if Claude Code works
docker exec casper-policeman claude "Say hello"

# Test Python orchestration
docker exec casper-policeman python3 -c "print('Swarm ready!')"

# Check Redis connection
docker exec casper-policeman redis-cli -h redis -a casper_redis_2024 ping

# View container status
docker ps | grep casper
```

## 🎯 Orchestration Examples

### Simple Task
```bash
docker exec -it casper-policeman claude "Create a Python hello world script"
```

### Complex Orchestration (What You're Building Towards)
```bash
docker exec -it casper-policeman claude "As master orchestrator, coordinate the team to build a complete REST API with authentication. Use parallel execution."
```

### Direct Swarm Control
```bash
# Proven to work - 15 agents building expense tracker
docker exec casper-policeman python3 /home/claude/workspace/scripts/swarm-orchestrator.py
```

## 🔧 Troubleshooting

### Container Won't Stay Running?
```bash
# Check logs
docker logs casper-developer-1

# Keep container alive (temporary fix)
docker exec -d casper-developer-1 tail -f /dev/null
```

### Can't Connect via SSH?
```bash
# Check if SSH is running
docker exec casper-policeman service ssh status

# Install SSH if missing (shouldn't be needed)
docker exec casper-policeman sudo apt-get update && sudo apt-get install -y openssh-server
```

### Need to Copy Files?
```bash
# Copy to container
docker cp myfile.txt casper-policeman:/home/claude/workspace/

# Copy from container
docker cp casper-policeman:/home/claude/workspace/results.txt ./
```

## 💡 Pro Tip

Create these aliases in your `.bashrc` or `.zshrc`:
```bash
alias casper-police='docker exec -it casper-policeman'
alias casper-claude='docker exec -it casper-policeman claude'
alias casper-swarm='docker exec casper-policeman python3 /home/claude/workspace/scripts/demo-swarm.py'
```

Then just type:
- `casper-police bash` - Enter policeman container
- `casper-claude "Your request"` - Run Claude Code
- `casper-swarm` - Run swarm demo

Remember: The golden image has everything pre-installed - Claude Code, Python, Node.js, and all orchestration scripts!