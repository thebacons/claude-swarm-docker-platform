# Claude Code in Docker - Complete Lessons Learned

## 🎯 Executive Summary

Successfully deployed CASPER (Claude Agent Swarm Platform for Enhanced Robotics) with Claude Code v1.0.30 in Docker containers. This document captures all critical lessons for future deployments.

## 🔑 Key Discoveries

### 1. Interactive Mode Behavior
```bash
# ❌ WRONG - Triggers setup prompts
docker exec -it casper-policeman claude "Your request"

# ✅ CORRECT - Bypasses setup prompts
docker exec casper-policeman claude "Your request"
```

**Why this matters:**
- `-it` allocates a pseudo-TTY triggering Claude's interactive setup
- Without `-it`, Claude uses existing configuration
- SSH always provides TTY, so first-run setup is unavoidable

### 2. Authentication Requirements

**Problem:** Golden image had Claude Code but no authentication
**Root Cause:** `.credentials.json` excluded for security during build

**Solutions:**
1. **Post-build copy** (Most Secure):
   ```bash
   docker cp ~/.claude/.credentials.json container:/home/claude/.claude/.credentials.json
   ```

2. **API Key Method** (Most Flexible):
   - Select option 2 during setup
   - Uses ANTHROPIC_API_KEY from environment

3. **Bake into image** (Least Secure):
   - Don't exclude credentials during build
   - Only for private, trusted environments

### 3. First-Run Setup Flow

When Claude detects interactive terminal:
1. Theme selection (1-6 options)
2. Authentication method (Subscription vs API key)
3. OAuth flow (if subscription selected)

**OAuth Issues in Containers:**
- Port 54545 conflicts
- Can't open browser
- Solution: Use API key method instead

### 4. Golden Image Build Process

**What worked:**
```bash
# build-golden-fixed.sh
# Copy ENTIRE npm module, not just binary
cp -r /usr/lib/node_modules/@anthropic-ai/claude-code/* into-image/
```

**Critical files:**
- Claude binary: `/home/claude/.local/bin/claude`
- NPM module: `/home/claude/.local/lib/node_modules/@anthropic-ai/claude-code/`
- Credentials: `/home/claude/.claude/.credentials.json`
- Config: `/home/claude/.config/claude-code/`

## 📋 Deployment Checklist

### Building Golden Image
- [ ] Install Node.js 20+ and npm
- [ ] Copy full Claude Code npm module (not just binary)
- [ ] Set NODE_PATH environment variable
- [ ] Create proper symlinks
- [ ] Install Python + orchestration scripts
- [ ] Configure startup script

### Post-Deployment Setup
- [ ] Copy credentials to containers OR
- [ ] Configure API key authentication
- [ ] Test with `docker exec` (no -it)
- [ ] Complete first-run setup if using SSH
- [ ] Verify inter-container networking

### Container Configuration
- [ ] Unique SSH ports (2222-2225)
- [ ] Environment variables (API keys)
- [ ] Volume mounts for shared workspace
- [ ] Health checks configured
- [ ] Restart policies set

## 🚀 Working Commands Reference

### Container Management
```bash
# Start all containers
docker-compose -f docker-compose.golden.yml up -d

# Check status
docker ps | grep casper

# View logs
docker logs casper-policeman
```

### Claude Code Usage
```bash
# Direct execution (no prompts)
docker exec casper-policeman claude "Your request"

# Copy credentials to fix auth
docker cp ~/.claude/.credentials.json casper-policeman:/home/claude/.claude/.credentials.json

# Interactive shell (will need setup)
docker exec -it casper-policeman /bin/bash
```

### SSH Access
```bash
# Policeman (Master Orchestrator)
ssh claude@localhost -p 2222

# Developers
ssh claude@localhost -p 2223  # Frontend
ssh claude@localhost -p 2224  # Backend

# Password: claude
```

## 🛠️ Troubleshooting Guide

### "OAuth port already in use"
- **Cause**: Interactive mode trying to start OAuth server
- **Fix**: Use docker exec without -it OR select API key method

### "Module not found" errors
- **Cause**: Only Claude binary copied, not full npm module
- **Fix**: Use build-golden-fixed.sh that copies entire module

### Setup prompts keep appearing
- **Cause**: No saved preferences in container
- **Fix**: Complete setup once OR copy config files

### Can't find Claude after SSH
- **Cause**: PATH not set in non-login shell
- **Fix**: Use full path `/home/claude/.local/bin/claude`

## 💡 Best Practices

1. **Development**: Use `docker exec` without -it for automation
2. **Debugging**: Use SSH for interactive debugging (complete setup once)
3. **Production**: Bake credentials OR use API key method
4. **Orchestration**: Use Python scripts for proven multi-agent coordination
5. **Monitoring**: Check logs regularly, containers restart on failure

## 📊 Performance Metrics

- **Golden Image Size**: 1.96GB (includes full Claude Code)
- **Container Start Time**: ~5 seconds
- **Claude Response Time**: <1 second when auth configured
- **Parallel Execution**: 2.9x speedup demonstrated
- **Memory per Container**: 2-4GB allocated

## 🔐 Security Considerations

1. **Credentials**: Never commit `.credentials.json` to git
2. **API Keys**: Store in `.env` file, not in image
3. **SSH**: Consider key-based auth for production
4. **Network**: Containers isolated on custom bridge network
5. **Volumes**: Read-only mounts where possible

## 🎯 Future Improvements

1. **Pre-configure Claude**: Automate first-run setup in Dockerfile
2. **Central Auth**: Share credentials via volume mount
3. **Health Monitoring**: Add Claude-specific health checks
4. **Auto-scaling**: Dynamic container spawning based on load
5. **Web UI**: Direct Claude Code access via browser

## 📚 Required Reading

- `build-golden-fixed.sh` - The working build script
- `docker-compose.golden.yml` - Container orchestration
- `CRITICAL-CONTEXT-CONTINUATION.md` - Session recovery guide
- `fix-claude-auth.sh` - Authentication troubleshooting

## ✅ Success Criteria

You know deployment is successful when:
1. All containers show "healthy" status
2. `docker exec casper-policeman claude --version` returns 1.0.30
3. No setup prompts with docker exec (no -it)
4. Inter-container ping tests pass
5. Python orchestration demos work

Remember: The key insight is that Claude Code behaves differently in interactive vs non-interactive modes. Plan your usage accordingly!