# Claude Swarm Docker Platform

A multi-agent AI orchestration platform that runs multiple Claude-powered agents in isolated Docker containers, working together to accomplish complex software development tasks.

## 🚀 Overview

This platform creates a team of AI agents, each running in its own Ubuntu container:
- **👮 Policeman**: The orchestrator that manages and coordinates all other agents
- **💻 Developer-1 & 2**: Code-writing agents that work in parallel
- **🧪 Tester**: Quality assurance agent that validates code
- **📊 Supporting Services**: Redis (messaging), PostgreSQL (state), Dashboard (monitoring)

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
- Docker Desktop 4.42.2+ (with WSL2 integration enabled)
- Windows 10/11 with WSL2
- At least 8GB RAM available
- Anthropic API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/thebacons/claude-swarm-docker-platform.git
cd claude-swarm-docker-platform
```

2. Create `.env` file:
```bash
# Copy template
cp .env.example .env

# Edit and add your API key
# ANTHROPIC_API_KEY=sk-ant-api...
```

3. Build and start the platform:
```bash
# Using Docker Compose
docker-compose -f docker-compose.enhanced.yml up -d

# Or use the Windows batch script
build-enhanced.bat

# Or use the Linux/WSL script
./build-enhanced.sh
```

4. Verify all containers are running:
```bash
docker ps
# Should show: claude-policeman, claude-developer-1, claude-developer-2, 
#              claude-tester, claude-redis, claude-postgres, claude-dashboard
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
GITHUB_PAT_KEY=ghp_...              # Optional
AUTO_UPDATE_CLAUDE=false            # Auto-update when available
POSTGRES_PASSWORD=secure_password    # Database password
```

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