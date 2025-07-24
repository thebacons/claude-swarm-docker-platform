# Enhanced Docker Container Setup

## Overview

This enhanced Docker setup provides a production-ready multi-agent orchestration platform with:
- Pre-configured Claude Code environment
- Multiple specialized agents (Policeman, Developers, Tester)
- Hook validation system
- Inter-agent communication via Redis
- State persistence with PostgreSQL
- Health monitoring and auto-recovery

## Key Features

### 1. Enhanced Dockerfile
- **Base**: Ubuntu 22.04 LTS with Python 3.11
- **Claude Code**: Pre-installation support with version management
- **Anthropic SDK**: Python SDK as fallback
- **Hook System**: Integrated validation hooks
- **Health Checks**: Built-in monitoring

### 2. Multi-Agent Architecture
```
┌─────────────────┐
│   Policeman     │ ← Central orchestrator
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ↓         ↓          ↓          ↓
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Dev-1  │ │  Dev-2  │ │ Tester  │ │  More.. │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### 3. Services
- **Policeman**: Central orchestration agent
- **Developer Agents**: Specialized for frontend/backend
- **Tester Agent**: Automated testing
- **Redis**: Inter-agent message bus
- **PostgreSQL**: State persistence and audit logs
- **Dashboard**: Web UI (placeholder for now)

## Quick Start

### 1. Prerequisites
```bash
# Ensure Docker and Docker Compose are installed
docker --version
docker-compose --version
```

### 2. Build and Start
```bash
# Use the enhanced build script
./build-enhanced.sh
```

This will:
- Check for .env file (create template if missing)
- Build the enhanced Docker image
- Start all services
- Run health checks
- Display access information

### 3. Access Containers
```bash
# Enter Policeman container
docker exec -it claude-policeman /bin/bash

# Inside container, check setup
check-version
health-check
claude-test
```

## Configuration

### Environment Variables (.env)
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional
LINEAR_API_KEY=lin_api_...
GITHUB_PAT_KEY=github_pat_...
AUTO_UPDATE_CLAUDE=false
```

### Volume Mounts
- `./projects`: Shared workspace for all agents
- `./hooks`: Validation hooks (read-only)
- `./logs/<agent>`: Individual agent logs
- `./.env`: Environment configuration

### Network
- Internal network: `claude-net` (172.28.0.0/16)
- Exposed ports:
  - 3000: Dashboard UI
  - 5432: PostgreSQL
  - 6379: Redis
  - 8080: Policeman API

## Hook System Integration

The containers automatically configure Claude Code hooks:
1. Syntax validation for all JavaScript files
2. React pattern checking for JSX files
3. Auto-fixing for common issues

Test the hooks:
```bash
# Run the hook test script
./test-container-hooks.sh
```

## Database Schema

PostgreSQL includes tables for:
- Sessions management
- Agent registry
- Task tracking
- Audit logging
- Checkpoints
- Hook violations
- Performance metrics

Access database:
```bash
docker exec -it claude-postgres psql -U claude -d claude_orchestration
\dt  # List tables
```

## Agent Communication

Agents communicate via Redis pub/sub:
```bash
# Monitor messages
docker exec -it claude-redis redis-cli
MONITOR
```

## Monitoring

### Health Checks
Each container has built-in health monitoring:
```bash
# Check all services
docker-compose -f docker-compose.enhanced.yml ps

# View logs
docker-compose -f docker-compose.enhanced.yml logs -f
```

### Individual Agent Health
```bash
docker exec claude-policeman /workspace/scripts/health-check.sh
docker exec claude-developer-1 /workspace/scripts/health-check.sh
```

## Development Workflow

1. **Policeman receives task** (from Linear or manual)
2. **Spawns appropriate agents** based on task requirements
3. **Agents work in parallel** with hook validation
4. **Results aggregated** by Policeman
5. **Audit trail recorded** in PostgreSQL

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.enhanced.yml logs <service-name>

# Rebuild from scratch
docker-compose -f docker-compose.enhanced.yml down -v
docker-compose -f docker-compose.enhanced.yml build --no-cache
```

### API Key Issues
```bash
# Verify inside container
docker exec -it claude-policeman /bin/bash
echo $ANTHROPIC_API_KEY
claude-test
```

### Hook Validation Fails
```bash
# Check hook permissions
docker exec claude-policeman ls -la /workspace/hooks/validators/

# Test manually
docker exec claude-policeman bash /workspace/hooks/validators/syntax-check.sh /path/to/file.js
```

## Next Steps

1. **Test the setup**: Run `./build-enhanced.sh`
2. **Verify hooks**: Run `./test-container-hooks.sh`
3. **Start development**: Begin with simple task orchestration
4. **Monitor performance**: Check logs and metrics
5. **Iterate**: Adjust configuration based on results

## Files Created

- `Dockerfile.enhanced`: Production-ready Dockerfile
- `docker-compose.enhanced.yml`: Multi-agent orchestration
- `scripts/init-db.sql`: Database schema
- `build-enhanced.sh`: Build and start script
- `test-container-hooks.sh`: Hook validation test

All enhancements maintain compatibility with the existing hook system while adding production-ready features for 24/7 autonomous operation.