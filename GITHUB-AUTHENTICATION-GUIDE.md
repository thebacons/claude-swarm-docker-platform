# GitHub Authentication Guide - CRITICAL FOR CLAUDE CODE & AGENTS

## ⚠️ CRITICAL: Correct Authentication Method

This guide documents the **ONLY WORKING METHOD** for GitHub authentication that works for both Claude Code and the Docker agents.

## Working GitHub PAT

### The Correct PAT Token
The working GitHub PAT is securely stored in the `.env` file.

### PAT Location
- **Primary location**: `/mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/.env`
- **Backup location**: `/mnt/c/Users/colin/Documents-local/91_Claude-Code/.env`
- **Variable name**: `GITHUB_PAT_KEY`

## How to Push to GitHub

### Method 1: Export and Use Variable (Recommended)
```bash
# 1. Export the PAT from .env
source .env  # This loads GITHUB_PAT_KEY from the .env file

# 2. Push using the variables
git push https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/REPO_NAME.git BRANCH_NAME
```

### Method 2: Direct PAT in Command
```bash
# First get the PAT from .env
GITHUB_PAT_KEY=$(grep GITHUB_PAT_KEY .env | cut -d'=' -f2)

# Then use it
git push https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/REPO_NAME.git BRANCH_NAME
```

## Example: Pushing This Project
```bash
# Export PAT from .env
source .env

# Push to feature branch
git push https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/claude-swarm-docker-platform.git feature/bac-151-docker-container-base

# Push to main
git push https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/claude-swarm-docker-platform.git main
```

## Setting Up Agents with GitHub Access

### 1. In docker-compose.enhanced.yml
```yaml
services:
  policeman:
    environment:
      - GITHUB_PAT_KEY=${GITHUB_PAT_KEY}
      - GITHUB_USERNAME=${GITHUB_USERNAME}
```

### 2. In Agent Container Scripts
```bash
# Agent startup script should export GitHub credentials
export GITHUB_PAT_KEY="${GITHUB_PAT_KEY}"
export GITHUB_USERNAME="${GITHUB_USERNAME}"

# Configure git globally
git config --global user.name "Claude Agent"
git config --global user.email "claude-agent@${GITHUB_USERNAME}.info"

# Function for easy pushing
git_push() {
    local branch="${1:-$(git branch --show-current)}"
    local repo="${2:-$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')}"
    
    git push https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/${repo}.git ${branch}
}
```

### 3. Testing GitHub Access in Container
```bash
# Test from inside container
docker exec -it claude-policeman /bin/bash

# Inside container:
echo $GITHUB_PAT_KEY  # Should show the token
echo $GITHUB_USERNAME  # Should show the username
git clone https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/claude-swarm-docker-platform.git test-clone
cd test-clone
git status
```

## Common Issues and Solutions

### Issue 1: Authentication Failed
```
remote: Invalid username or password.
fatal: Authentication failed
```
**Solution**: You're using the wrong PAT. Use ONLY the PAT shown above.

### Issue 2: 403 Forbidden
```
remote: Write access to repository not granted.
fatal: unable to access '...': The requested URL returned error: 403
```
**Solution**: The PAT doesn't have correct permissions or you're using wrong PAT.

### Issue 3: PAT Not Found in Container
```bash
# Make sure GITHUB_PAT_KEY is in your .env file:
grep GITHUB_PAT_KEY .env

# Rebuild containers:
docker-compose -f docker-compose.enhanced.yml up -d --build
```

## Security Notes

1. **Never commit the PAT to git** - Always use .env files
2. **Add .env to .gitignore** - Prevent accidental commits
3. **Use read-only tokens when possible** - For cloning only
4. **Rotate tokens regularly** - But update all references

## Quick Reference Card

```bash
# GitHub Username
Stored in .env file as GITHUB_USERNAME

# Working PAT Location
Stored in .env file as GITHUB_PAT_KEY

# PAT Location
/mnt/c/Users/colin/Documents-local/91_Claude-Code/.env

# Push Command Template
git push https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/REPO.git BRANCH
```

## Why This Matters

- **Claude Code** needs this to push code changes
- **Docker Agents** need this for autonomous git operations
- **Continuous Integration** requires consistent authentication
- **Session Recovery** depends on correct git access

## DO NOT USE These PATs (They Don't Work)

- ❌ `github_pat_11ASSSCKI0945e5mUhfzts_...` (incorrect)
- ❌ `CLAUDE_CODE_PAT_KEY` from .env (doesn't have permissions)
- ❌ Any other PAT found in various .env files

## ONLY USE This PAT

✅ The PAT stored in your `.env` file as `GITHUB_PAT_KEY`

---

**Remember**: This authentication method is CRITICAL for the entire orchestration platform to function correctly!