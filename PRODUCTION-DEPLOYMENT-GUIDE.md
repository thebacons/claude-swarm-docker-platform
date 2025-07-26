# CASPER Production Deployment Guide

## 🚀 Complete Deployment Instructions

This guide contains everything needed to deploy CASPER with Claude Code v1.0.30 in production.

## Prerequisites

- Docker Desktop with WSL2 integration
- Claude Code installed on host machine
- API keys for:
  - Anthropic (ANTHROPIC_API_KEY)
  - GitHub (GITHUB_PAT_KEY)
  - Linear (LINEAR_API_KEY) - optional

## Step 1: Environment Setup

Create `.env` file with your credentials:
```bash
ANTHROPIC_API_KEY=sk-ant-api...
GITHUB_USERNAME=yourusername
GITHUB_PAT_KEY=github_pat_...
LINEAR_API_KEY=lin_api_...
POSTGRES_PASSWORD=secure_password_here
```

## Step 2: Build the Golden Image

```bash
# CRITICAL: Use the FIXED script, not the original!
./build-golden-fixed.sh
```

This creates `casper-golden:fixed` (1.96GB) with:
- Full Claude Code npm module (178MB)
- Node.js 20 + npm
- Python 3.11 + all dependencies
- Hook validation system
- Swarm orchestration scripts

## Step 3: Deploy All Containers

```bash
# Start all services
docker-compose -f docker-compose.golden.yml up -d

# Verify all running
docker ps | grep casper
```

Expected containers:
- casper-policeman (port 2222)
- casper-developer-1 (port 2223)
- casper-developer-2 (port 2224)
- casper-tester (port 2225)
- casper-redis
- casper-postgres
- casper-dashboard

## Step 4: Configure Authentication

### Option A: Copy Existing Credentials (Recommended)
```bash
# One-time setup after deployment
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    docker cp ~/.claude/.credentials.json $container:/home/claude/.claude/.credentials.json
    docker exec $container chown claude:claude /home/claude/.claude/.credentials.json
done
```

### Option B: Use API Key Authentication
If you don't have subscription credentials:
1. SSH into container: `ssh claude@localhost -p 2222`
2. Run `claude` and select option 2 (API key)
3. It will use ANTHROPIC_API_KEY from environment

## Step 5: Verify Deployment

```bash
# Test Claude Code (WITHOUT -it flag!)
docker exec casper-policeman claude --version
# Expected: 1.0.30 (Claude Code)

# Test orchestration capability
docker exec casper-policeman claude "Who are you and what is your role?"

# Test Python swarm
docker exec casper-policeman python3 /home/claude/workspace/scripts/demo-swarm.py
# Expected: Shows parallel execution performance
```

## 🚨 Critical Usage Rules

### The Golden Rule: No Interactive Flag
```bash
# ✅ CORRECT - For automation
docker exec casper-policeman claude "Your request"

# ❌ WRONG - Triggers setup prompts
docker exec -it casper-policeman claude "Your request"
```

### When to Use Interactive Mode
Only use `-it` flag when:
- Initial setup is needed
- Debugging issues interactively
- Running bash shell for exploration

## Production Operations

### Health Monitoring
```bash
# Check container health
docker ps | grep casper

# View logs
docker logs -f casper-policeman

# Check Claude functionality
docker exec casper-policeman claude --version
```

### Scaling Agents
```bash
# Scale developer agents
docker-compose -f docker-compose.golden.yml scale developer=5

# Monitor resource usage
docker stats
```

### Inter-Agent Communication
```bash
# Monitor Redis messages
docker exec casper-redis redis-cli -a casper_redis_2024 MONITOR

# Check PostgreSQL state
docker exec casper-postgres psql -U claude -d claude_orchestration \
  -c "SELECT * FROM tasks ORDER BY created_at DESC LIMIT 10;"
```

## Troubleshooting

### Issue: OAuth Port Conflict
**Symptom**: "Port 54545 is already in use"
**Solution**: Use `docker exec` without `-it` OR use API key method

### Issue: Module Not Found
**Symptom**: "Cannot find module './yoga.wasm'"
**Solution**: Rebuild with `build-golden-fixed.sh` (not the original script)

### Issue: Authentication Failed
**Symptom**: Claude asks for subscription
**Solution**: Copy credentials using Step 4 instructions

### Issue: Container Won't Start
```bash
# Check logs
docker logs casper-policeman

# Verify image exists
docker images | grep casper-golden

# Rebuild if needed
./build-golden-fixed.sh
```

## Security Considerations

1. **Never commit** `.credentials.json` or `.env` files
2. **Use secrets management** for production API keys
3. **Restrict SSH access** - consider key-based auth only
4. **Network isolation** - containers on private bridge network
5. **Volume permissions** - hooks mounted read-only

## Performance Tuning

### Resource Allocation
Edit `docker-compose.golden.yml` to adjust:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
    reservations:
      cpus: '1'
      memory: 2G
```

### Parallel Execution
The system supports up to 15 parallel agents:
```bash
# Test maximum parallelization
docker exec casper-policeman python3 \
  /home/claude/workspace/scripts/swarm-orchestrator.py \
  --agents 15 --parallel
```

## Backup and Recovery

### Backup State
```bash
# Backup PostgreSQL
docker exec casper-postgres pg_dump -U claude claude_orchestration > backup.sql

# Backup project files
tar -czf projects-backup.tar.gz ./projects/
```

### Restore from Backup
```bash
# Stop containers
docker-compose -f docker-compose.golden.yml down

# Restore data
docker-compose -f docker-compose.golden.yml up -d
docker exec -i casper-postgres psql -U claude claude_orchestration < backup.sql
```

## Monitoring Dashboard

Access the web dashboard at http://localhost:3000 to monitor:
- Agent status
- Task queue
- Performance metrics
- Error logs

## Production Checklist

- [ ] Environment variables configured
- [ ] Golden image built with fixed script
- [ ] All containers running
- [ ] Authentication configured
- [ ] Claude Code verified working
- [ ] Swarm orchestration tested
- [ ] Monitoring dashboard accessible
- [ ] Backup strategy implemented
- [ ] Security hardening applied
- [ ] Documentation distributed to team

## Support

For issues, check:
1. This guide's troubleshooting section
2. `CLAUDE-CODE-DOCKER-LESSONS-LEARNED.md`
3. Container logs: `docker logs casper-policeman`
4. GitHub issues (when available)

Remember: The key to success is using `docker exec` without `-it` for all automated operations!