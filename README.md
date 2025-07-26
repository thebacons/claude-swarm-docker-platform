# CASPER - Claude Agent Swarm Platform for Enhanced Robotics

A production-ready multi-agent AI orchestration platform with Claude Code v1.0.30 pre-installed in Docker containers. Successfully deployed January 25, 2025.

## 🚀 Overview

CASPER creates a team of AI agents with full Claude Code capabilities:
- **👮 Policeman**: Master orchestrator on port 2222 (easy to remember!)
- **💻 Developer-1**: Frontend specialist on port 2223
- **💻 Developer-2**: Backend specialist on port 2224
- **🧪 Tester**: QA engineer on port 2225
- **📊 Supporting Services**: Redis (messaging), PostgreSQL (state)

### ✅ Latest Status (January 25, 2025)
- Golden image `casper-golden:fixed` built with full Claude Code
- All containers running and accessible via SSH
- Parallel execution verified (2.9x performance improvement)
- Authentication issues resolved

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: claude-net                │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐  ┌──────────────┐ │
│  │  POLICEMAN   │────►│ DEVELOPER-1  │  │ DEVELOPER-2  │ │
│  │ (Orchestrator)     │ (Code Agent) │  │ (Code Agent) │ │
│  └──────┬───────┘     └──────┬───────┘  └──────┬───────┘ │
│         │                     │                  │         │
│         ▼                     ▼                  ▼         │
│  ┌──────────────┐     ┌──────────────┐  ┌──────────────┐ │
│  │    REDIS     │◄────┤    TESTER    │  │  POSTGRESQL  │ │
│  │ (Message Bus)│     │  (QA Agent)  │  │   (State)    │ │
│  └──────────────┘     └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

Each agent runs in a completely isolated Ubuntu 22.04 container with its own:
- File system and process space
- Python 3.11 and Node.js 20 environment
- Anthropic SDK integration
- Resource limits (CPU/Memory)

## ✅ Key Achievements

- **Multi-Container Orchestration**: 7 containers working in harmony
- **Hook Validation System**: Prevents code errors through validation
- **SSH Access**: Connect to any container via PuTTY or SSH
- **Complete Isolation**: Each agent has its own Ubuntu environment
- **Inter-Agent Communication**: Redis pub/sub + PostgreSQL state

## 📁 Project Structure

```
claude-swarm-docker-spawn/
├── Dockerfile.enhanced         # Main agent container (Ubuntu 22.04)
├── Dockerfile.ssh-simple      # SSH-enabled container for PuTTY access
├── docker-compose.enhanced.yml # Multi-agent orchestration setup
├── hooks/                     # Validation system
│   ├── validators/           # Syntax and pattern checkers
│   ├── fixers/              # Auto-fix scripts
│   └── testers/             # Test runners
├── projects/                 # Shared workspace for all agents
├── scripts/                  # Container management scripts
│   ├── startup.sh           # Container initialization
│   ├── health-check.sh      # Health monitoring
│   └── check-claude-version.sh # Version verification
├── configs/                  # Configuration files
└── logs/                     # Agent activity logs
```

## 🚦 Quick Start

### Prerequisites
- Docker Desktop (with WSL2 integration enabled)
- Windows 10/11 with WSL2
- At least 8GB RAM available
- Claude Code installed on host machine
- Anthropic API key OR Claude subscription

### Setup

1. Clone the repository:
```bash
git clone https://github.com/${GITHUB_USERNAME}/claude-swarm-docker-platform.git
cd claude-swarm-docker-platform
```

2. Create `.env` file with your credentials:
```bash
ANTHROPIC_API_KEY=sk-ant-api...
GITHUB_USERNAME=yourusername
GITHUB_PAT_KEY=github_pat_...
LINEAR_API_KEY=lin_api_...
```

3. Build the golden image:
```bash
# Use the FIXED script (important!)
./build-golden-fixed.sh
```

4. Start all containers:
```bash
docker-compose -f docker-compose.golden.yml up -d
```

5. Copy Claude authentication (one-time setup):
```bash
# Copy your Claude subscription to containers
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    docker cp ~/.claude/.credentials.json $container:/home/claude/.claude/.credentials.json
    docker exec $container chown claude:claude /home/claude/.claude/.credentials.json
done
```

## 🎯 Critical Usage Information

### ⚠️ IMPORTANT: How to Run Claude Without Setup Prompts

```bash
# ✅ CORRECT - No interactive prompts
docker exec casper-policeman claude "Your request"

# ❌ WRONG - Triggers theme/auth setup
docker exec -it casper-policeman claude "Your request"
```

The `-it` flag creates an interactive terminal that triggers Claude's first-run setup. Always omit it for automated usage.

### 🧠 How Claude Code Knows Its Role (CLAUDE.md)

Each container can have a `CLAUDE.md` file that Claude Code reads **for every command** to understand its role:

```bash
# Create role-specific CLAUDE.md in each container
docker exec casper-policeman bash -c 'cat > /home/claude/workspace/CLAUDE.md << EOF
# You are the Policeman Orchestrator
You are the master orchestrator who coordinates other agents...
EOF'
```

**Key Understanding**: Each container is like a separate computer with its own filesystem. When you run `docker exec casper-policeman`, you're executing commands inside THAT specific container only.

### 📚 Configuration Files Claude Code Reads

| File | Location in Container | When Read | Purpose |
|------|----------------------|-----------|---------|
| `CLAUDE.md` | `/home/claude/workspace/CLAUDE.md` | Every command | Project context & role |
| `mcp.json` | `/home/claude/.claude/config/mcp.json` | Startup | MCP server connections |
| `hooks.json` | `/home/claude/.config/claude-code/hooks.json` | Startup | Hook configurations |
| `.credentials.json` | `/home/claude/.claude/.credentials.json` | Startup | Authentication |
| `settings.json` | `/home/claude/.config/claude-code/settings.json` | Startup | General settings |

**Important**: Since CLAUDE.md is read for every command, you can update it anytime and the next command will see the new context - no restart needed!

### Verify all containers are running:
```bash
docker ps
# Should show: claude-policeman, claude-developer-1, claude-developer-2, 
#              claude-tester, claude-redis, claude-postgres, claude-dashboard
```

## 🤖 Using CASPER - The AI Orchestrator

### Quick Start with CASPER
```bash
# Start the interactive orchestrator
./start-casper.sh

# Or directly access the CLI
docker exec -it claude-policeman python3 /workspace/scripts/casper-cli.py
```

### What is CASPER?
CASPER (Claude Agent Swarm Platform for Enhanced Robotics) is the AI orchestration layer that makes the Policeman container intelligent. It:
- 🧠 Understands complex development requests
- 📋 Breaks down tasks into subtasks
- 🎯 Assigns work to appropriate agents
- ⚡ Manages parallel execution for speed
- ✅ Coordinates results and quality checks

### Example Interactions
```
👮 CASPER> Create a React dashboard with user authentication

[CASPER will decompose this into subtasks, assign to agents, and coordinate the development]

👮 CASPER> Refactor these 50 JavaScript files to TypeScript using maximum parallelization

[CASPER will spawn multiple agent instances for parallel processing]
```

## 📡 Accessing the Containers

### Method 1: Docker Exec (Recommended)
```bash
# Access any container directly
docker exec -it claude-policeman /bin/bash
docker exec -it claude-developer-1 /bin/bash
docker exec -it claude-developer-2 /bin/bash
docker exec -it claude-tester /bin/bash
```

### Method 2: SSH Access (PuTTY Compatible)
```bash
# Start SSH container
./start-ssh-container.bat  # Windows
./start-ssh-container.sh   # Linux/WSL

# Connect via PuTTY
Host: localhost
Port: 2222
Username: developer
Password: claude

# Or via command line
ssh developer@localhost -p 2222
```

### Method 3: Quick Connect Menu
```bash
# Windows interactive menu
connect-container.bat

# Select which container to access from the menu
```

## 🏗️ Architecture Details

### Container Specifications

| Container | Base OS | Role | Resources | Exposed Ports |
|-----------|---------|------|-----------|---------------|
| Policeman | Ubuntu 22.04 | Orchestrator | 2 CPU, 2GB RAM | 8080 |
| Developer-1 | Ubuntu 22.04 | Code Agent | 2 CPU, 2GB RAM | - |
| Developer-2 | Ubuntu 22.04 | Code Agent | 2 CPU, 2GB RAM | - |
| Tester | Ubuntu 22.04 | QA Agent | 1 CPU, 1GB RAM | - |
| Redis | Alpine | Message Bus | 0.5 CPU, 512MB | 6379 |
| PostgreSQL | Alpine | Database | 1 CPU, 1GB RAM | 5432 |
| Dashboard | Alpine | Web UI | 0.5 CPU, 256MB | 3000 |

### The Policeman: Main Orchestrator
The Policeman container is the brain of the operation:
- **Receives** all tasks from users
- **Distributes** work to developer agents
- **Monitors** progress via Redis pub/sub
- **Validates** results through hooks
- **Aggregates** outputs from all agents

### Communication Flow
```
User → Policeman → Redis → Developer Agents
                     ↓
                  PostgreSQL ← Tester Agent
```

## 🪝 Hook System

The hook validation system prevents common errors:
- **Syntax Validation**: Catches JavaScript/TypeScript errors
- **React Pattern Check**: Ensures proper module usage
- **Auto-Fix**: Automatically corrects common issues
- **Pre-commit Guards**: Prevents bad code from being committed

## 🛠️ Configuration

### Environment Variables (.env)
```bash
ANTHROPIC_API_KEY=sk-ant-...        # Required
LINEAR_API_KEY=lin_api_...          # Optional
GITHUB_PAT_KEY=ghp_...              # Required for git push (see .env for actual token)
AUTO_UPDATE_CLAUDE=false            # Auto-update when available
POSTGRES_PASSWORD=secure_password    # Database password
```

### 🔐 CRITICAL: GitHub Authentication
See [GITHUB-AUTHENTICATION-GUIDE.md](GITHUB-AUTHENTICATION-GUIDE.md) for the correct method to push to GitHub. Only ONE specific PAT works - do not use others!

### Volume Mounts
- `./projects:/workspace/projects` - Shared project files
- `./hooks:/workspace/hooks:ro` - Validation hooks (read-only)
- `./logs:/workspace/logs` - Agent activity logs

## 📊 Usage Examples

### Testing the Orchestration
```bash
# Access the Policeman
docker exec -it claude-policeman /bin/bash

# Run health check
/workspace/scripts/health-check.sh

# Test hook system
/workspace/test-container-hooks.sh
```

### Monitoring Agent Communication
```bash
# Watch Redis messages
docker exec -it claude-redis redis-cli MONITOR

# View task history
docker exec -it claude-postgres psql -U claude -d claude_orchestration \
  -c "SELECT * FROM tasks ORDER BY created_at DESC LIMIT 10;"
```

### Scaling the Platform
```bash
# Add more developer agents
docker-compose -f docker-compose.enhanced.yml up -d --scale developer=5

# Check resource usage
docker stats
```

## 🔧 Troubleshooting

### Container Issues
```bash
# View logs
docker logs claude-policeman

# Restart a container
docker restart claude-developer-1

# Check API key
docker exec claude-policeman env | grep ANTHROPIC
```

### SSH Connection Problems
```bash
# Ensure SSH container is running
docker ps | grep claude-ssh

# Rebuild SSH container
docker build -f Dockerfile.ssh-simple -t claude-ssh-simple .
docker run -d --name claude-ssh -p 2222:22 claude-ssh-simple
```

## 📚 Documentation

- [System Architecture](SYSTEM-ARCHITECTURE.md)
- [Orchestration Hierarchy](ORCHESTRATION-HIERARCHY.md)
- [Container Access Guide](CONTAINER-ACCESS-GUIDE.md)
- [Implementation Guide](IMPLEMENTATION.md)
- [Docker WSL Setup](DOCKER-WSL-SETUP.md)
- [**GitHub Authentication Guide**](GITHUB-AUTHENTICATION-GUIDE.md) ⚠️ **CRITICAL - Read This!**
- [**Container Security Guide**](CONTAINER-SECURITY-GUIDE.md) 🔒 **Secret Management**

## 🎯 Roadmap

### Phase 1: Current Implementation ✅
- Multi-agent Docker platform
- Basic orchestration with Policeman
- Redis/PostgreSQL integration
- SSH access for debugging

### Phase 2: Claude Integration (Next)
- Integrate Claude Code CLI when available
- Implement actual AI task distribution
- Add Linear project management

### Phase 3: Advanced Features
- Web dashboard for real-time monitoring
- Agent visualization and metrics
- Auto-scaling based on workload
- Performance optimization

### Phase 4: Production Ready
- Kubernetes deployment
- High availability setup
- Security hardening
- Enterprise features

## 🤝 Contributing

This is a private repository. For access or questions, contact the repository owner.

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

Built with Claude Code and validated through extensive UAT testing.