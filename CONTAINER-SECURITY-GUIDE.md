# Container Security Guide - Handling Secrets

## Overview
This guide explains how secrets (API keys, tokens) are securely handled in the Claude Swarm Docker Platform.

## Secret Management Strategy

### 1. Environment File (.env)
All secrets are stored in a single `.env` file that is:
- ✅ **Never committed to git** (listed in .gitignore)
- ✅ **Mounted read-only** to containers
- ✅ **Located outside container filesystem**

### 2. Environment Variable Injection
Docker Compose injects secrets as environment variables:
```yaml
environment:
  - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}  # From .env
  - GITHUB_PAT_KEY=${GITHUB_PAT_KEY}        # From .env
  - LINEAR_API_KEY=${LINEAR_API_KEY:-}      # Optional with default
```

### 3. Container Access to Secrets

#### Option 1: Environment Variables (Current Implementation)
```bash
# Inside container, secrets are available as env vars
echo $GITHUB_PAT_KEY
echo $ANTHROPIC_API_KEY
```

**Pros:**
- Simple to use
- Works with all tools
- Standard Docker practice

**Cons:**
- Visible in `docker inspect`
- Shown in process listings

#### Option 2: Mounted .env File (Also Implemented)
```yaml
volumes:
  - ./.env:/workspace/.env:ro  # Read-only mount
```

Containers can source the file:
```bash
source /workspace/.env
```

**Pros:**
- Not visible in `docker inspect`
- Can be updated without rebuild

**Cons:**
- Requires explicit sourcing
- File permissions matter

## Security Best Practices

### 1. Never Log Secrets
```bash
# ❌ BAD - Don't do this
echo "GitHub PAT: $GITHUB_PAT_KEY"

# ✅ GOOD - Log only status
echo "GitHub PAT: ${GITHUB_PAT_KEY:+[SET]}"
```

### 2. Use Read-Only Mounts
```yaml
volumes:
  - ./.env:/workspace/.env:ro  # Note the :ro (read-only)
```

### 3. Limit Secret Scope
Only pass secrets to containers that need them:
- Policeman: Needs all secrets (orchestrator)
- Developers: Need GitHub + Anthropic
- Tester: Needs Anthropic only (consider removing GitHub)

### 4. Rotate Secrets Regularly
When rotating secrets:
1. Update `.env` file
2. Restart containers: `docker-compose restart`
3. No rebuild needed!

## Checking Secret Exposure

### 1. Check Environment Variables
```bash
# See what's exposed in container
docker exec claude-policeman env | grep -E "(KEY|TOKEN|PASSWORD)"

# Check specific container
docker exec claude-developer-1 printenv | grep GITHUB
```

### 2. Verify .gitignore
```bash
# Ensure .env is ignored
grep "^\.env$" .gitignore

# Check no secrets in git
git ls-files | xargs grep -l "sk-ant-\|github_pat_"
```

### 3. Docker Inspect Security
```bash
# This WILL show env vars (security consideration)
docker inspect claude-policeman | grep -A5 "Env"

# Alternative: Use secrets feature (future enhancement)
```

## Future Improvements

### 1. Docker Secrets (Swarm Mode)
```yaml
secrets:
  github_pat:
    external: true
    
services:
  policeman:
    secrets:
      - github_pat
```

### 2. HashiCorp Vault Integration
- Dynamic secret rotation
- Audit logging
- Fine-grained access control

### 3. Runtime Secret Injection
```bash
# Using a secrets manager
export GITHUB_PAT_KEY=$(vault kv get -field=pat secret/github)
```

## Container Startup Security

The startup script (`/workspace/scripts/startup.sh`) should:
1. Check for required secrets
2. Validate secret format
3. Configure tools with secrets
4. Clear sensitive vars after use

Example:
```bash
# Validate secrets exist
if [ -z "$GITHUB_PAT_KEY" ]; then
    echo "ERROR: GITHUB_PAT_KEY not set"
    exit 1
fi

# Configure git with PAT
git config --global credential.helper store
echo "https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com" > ~/.git-credentials

# Clear the variable
unset GITHUB_PAT_KEY
```

## Monitoring & Auditing

### 1. Log Secret Usage (Not Values)
```bash
echo "$(date) - GitHub API called by ${AGENT_NAME}" >> /workspace/logs/api-usage.log
```

### 2. Check for Accidental Exposure
```bash
# Periodic scan of logs
grep -r "github_pat_\|sk-ant-" /workspace/logs/ && echo "WARNING: Possible secret exposure!"
```

### 3. Container Security Scan
```bash
# Use Docker's built-in scanning
docker scan claude-policeman
```

## Quick Security Checklist

Before deploying:
- [ ] All secrets in `.env` file
- [ ] `.env` is in `.gitignore`
- [ ] No secrets in Dockerfiles
- [ ] No secrets in docker-compose.yml (use variables)
- [ ] Containers mount .env as read-only
- [ ] Startup scripts validate secrets exist
- [ ] Logging doesn't expose secret values
- [ ] Regular secret rotation planned

## Emergency Response

If a secret is exposed:
1. **Rotate immediately** in the provider's dashboard
2. **Update .env** with new secret
3. **Restart containers**: `docker-compose restart`
4. **Check git history**: `git log -p | grep -E "pat_|sk-ant"`
5. **Force push if needed**: Remove from history

Remember: Security is not just about storing secrets safely, but also about using them carefully!