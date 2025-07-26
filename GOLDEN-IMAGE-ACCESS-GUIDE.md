# How to Access CASPER Golden Image Containers

## 🚀 Quick Access Methods

### 1. Direct Docker Access (From Your Windows/WSL Terminal)

#### Interactive Shell Access
```bash
# Access the Policeman (Master Orchestrator)
docker exec -it casper-policeman /bin/bash

# Access Developer Agent 1
docker exec -it casper-developer-1 /bin/bash

# Access Developer Agent 2
docker exec -it casper-developer-2 /bin/bash

# Access Tester Agent
docker exec -it casper-tester /bin/bash
```

#### Direct Claude Code Commands
```bash
# Run Claude Code directly
docker exec -it casper-policeman claude "Your request here"

# Run without interactive terminal
docker exec casper-policeman claude --version

# Execute Python scripts
docker exec casper-policeman python3 /home/claude/workspace/scripts/demo-swarm.py
```

### 2. SSH Access Setup

The golden image includes SSH capability, but it needs to be enabled:

#### Enable SSH in Container
```bash
# 1. First, access the container
docker exec -it casper-policeman /bin/bash

# 2. Inside container, start SSH service
sudo service ssh start

# 3. Set a password for the claude user (optional)
passwd claude
# Enter your desired password

# 4. Or use SSH keys (recommended)
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Add your public key to ~/.ssh/authorized_keys
```

#### Configure SSH Port Mapping
Add SSH port mapping to docker-compose.golden.yml:
```yaml
  policeman:
    image: casper-golden:fixed
    ports:
      - "8080:8080"
      - "8081:8081"
      - "2222:22"  # SSH port mapping
```

Then restart the container:
```bash
docker-compose -f docker-compose.golden.yml restart policeman
```

### 3. PuTTY SSH Access (From Windows)

#### Setup Steps:
1. **Get Container IP** (if not using port mapping):
   ```bash
   docker inspect casper-policeman | grep IPAddress
   # Usually something like 172.29.0.2
   ```

2. **PuTTY Configuration**:
   - Host Name: `localhost` (if port mapped) or container IP
   - Port: `2222` (if mapped) or `22` (if direct IP)
   - Connection type: SSH
   - Save session as: "CASPER-Policeman"

3. **First Connection**:
   - Accept the host key
   - Login as: `claude`
   - Password: (what you set above)

### 4. VS Code Remote Access

#### Using Remote-Containers Extension:
1. Install "Remote - Containers" extension in VS Code
2. Open Command Palette (Ctrl+Shift+P)
3. Run: "Remote-Containers: Attach to Running Container"
4. Select: `casper-policeman`
5. VS Code opens with full access to container

#### Using Remote-SSH Extension:
1. Install "Remote - SSH" extension
2. Configure SSH as above
3. Connect to `claude@localhost:2222`

### 5. Web-Based Terminal (Optional Setup)

#### Add Web Terminal Service:
```yaml
# Add to docker-compose.golden.yml
  web-terminal:
    image: wettyoss/wetty
    container_name: casper-terminal
    ports:
      - "3001:3000"
    environment:
      - SSHHOST=policeman
      - SSHPORT=22
      - SSHUSER=claude
    networks:
      - casper-net
    depends_on:
      - policeman
```

Access via browser: `http://localhost:3001`

## 🔐 Security Considerations

### For Development:
- Direct docker exec is fastest and most convenient
- No additional security setup needed
- Full access to all container capabilities

### For Production:
- Use SSH with key-based authentication
- Disable password authentication
- Use firewall rules to restrict access
- Consider VPN for remote access

## 📋 Common Tasks After Access

### Check Claude Code Status
```bash
# Version
claude --version

# Test functionality
claude "Hello, what can you help with?"

# Check environment
env | grep -E 'ANTHROPIC|AGENT|CLAUDE'
```

### Monitor Agent Activity
```bash
# View logs
tail -f /home/claude/workspace/logs/*

# Check running processes
ps aux | grep claude

# Monitor system resources
htop
```

### Test Orchestration
```bash
# Python orchestration
python3 /home/claude/workspace/scripts/demo-swarm.py

# Check Redis connectivity
redis-cli -h redis -a casper_redis_2024 ping

# Test inter-agent communication
python3 -c "import redis; r=redis.Redis(host='redis', password='casper_redis_2024'); print(r.ping())"
```

## 🎯 Quick Command Reference

### From Outside Container (Docker Host):
```bash
# Quick Claude Code test
docker exec casper-policeman claude --version

# Interactive Claude session
docker exec -it casper-policeman claude

# Run orchestration demo
docker exec casper-policeman python3 /home/claude/workspace/scripts/demo-swarm.py

# Get container IP
docker inspect casper-policeman --format='{{.NetworkSettings.Networks.claude-swarm-docker-spawn_casper-net.IPAddress}}'

# View real-time logs
docker logs -f casper-policeman

# Copy files to/from container
docker cp myfile.txt casper-policeman:/home/claude/workspace/
docker cp casper-policeman:/home/claude/workspace/output.txt ./
```

### From Inside Container:
```bash
# Switch to workspace
cd ~/workspace

# Run Claude Code
claude "Build me a REST API"

# Check other agents
ping developer-1
ping developer-2
ping tester

# Test Redis connection
redis-cli -h redis -a casper_redis_2024

# Run swarm orchestration
python3 scripts/swarm-orchestrator.py
```

## 🚁 Advanced Access Patterns

### 1. Multiplexed Terminal (tmux)
```bash
# Inside container
tmux new -s orchestration

# Split panes for monitoring
# Ctrl+B, % (vertical split)
# Ctrl+B, " (horizontal split)
```

### 2. Agent-to-Agent SSH
```bash
# From policeman to developer-1
ssh claude@developer-1

# Requires SSH service running on target
```

### 3. Shared Screen Sessions
```bash
# Start a shared session
screen -S collab

# Others can attach
screen -x collab
```

## 💡 Pro Tips

1. **Persistent Sessions**: Use `tmux` or `screen` to keep sessions alive
2. **Aliases**: Add to `~/.bashrc`:
   ```bash
   alias co='claude'
   alias swarm='python3 ~/workspace/scripts/demo-swarm.py'
   ```
3. **Auto-start SSH**: Add to startup.sh if you always need SSH
4. **Port Forwarding**: Use SSH tunnels for secure access to internal services

The golden image containers are designed for both convenient development access and secure production deployment!