# Docker File Sharing: The Complete Guide

## Table of Contents
1. [Introduction: The Container Island Analogy](#introduction)
2. [The Three Methods of File Sharing](#three-methods)
3. [Method 1: Volume Mounts (Live Sync)](#volume-mounts)
4. [Method 2: Docker Copy (One-Time Transfer)](#docker-copy)
5. [Method 3: Bind Mounts vs Named Volumes](#bind-mounts-vs-named-volumes)
6. [How Claude Swarm Uses File Sharing](#claude-swarm-implementation)
7. [Real-World Examples and Demonstrations](#real-world-examples)
8. [Common Pitfalls and Solutions](#common-pitfalls)
9. [Performance Considerations](#performance-considerations)
10. [Security Implications](#security-implications)
11. [Advanced Patterns](#advanced-patterns)

---

## Introduction: The Container Island Analogy {#introduction}

Imagine Docker containers as **isolated islands** in an ocean. Each island (container) has its own:
- File system
- Processes
- Network
- Resources

By default, these islands are completely isolated - files on one island can't be accessed from another island or from the mainland (your host computer). This isolation is a key security feature of Docker.

However, we often need to share files between the mainland and our islands. Docker provides several "bridges" to make this possible.

```
     Your Computer (Mainland)
    ┌────────────────────────┐
    │  📁 Your Files         │
    │  📁 Your Projects      │
    │  📁 Your Code          │
    └───────────┬────────────┘
                │
        🌉 Docker Bridges
                │
    ┌───────────┴────────────┐
    │   Docker Container      │
    │   (Isolated Island)     │
    │   📁 Container Files    │
    └────────────────────────┘
```

---

## The Three Methods of File Sharing {#three-methods}

### Quick Comparison Table

| Method | Type | Speed | Use Case | Persistence |
|--------|------|-------|----------|-------------|
| Volume Mount | Live Sync | Instant | Development | Bidirectional |
| Docker Copy | One-Time | Manual | Deployment | Until Overwritten |
| Dockerfile COPY | Build-Time | At Build | Static Files | Baked into Image |

### Visual Overview

```
1. VOLUME MOUNT (Live Bridge)
   Host ←═══════════════════→ Container
        Real-time sync

2. DOCKER COPY (Ferry Service)
   Host ──────[copy]──────→ Container
        One-way transfer

3. DOCKERFILE COPY (Built-in)
   Image ──[baked in]────→ Container
        Included at build
```

---

## Method 1: Volume Mounts (Live Sync) {#volume-mounts}

Volume mounts create a **live, bidirectional connection** between host and container directories.

### How It Works

```yaml
# In docker-compose.yml
services:
  myapp:
    volumes:
      - ./host-folder:/container-folder
      #  ↑ Host path    ↑ Container path
```

### Detailed Example

```yaml
services:
  claude-swarm:
    volumes:
      # Project files - full read/write access
      - ./projects:/workspace/projects
      
      # Config files - full access
      - ./configs:/workspace/configs
      
      # Logs - container writes, host reads
      - ./logs:/workspace/logs
      
      # Read-only mount (security)
      - ~/.ssh:/home/developer/.ssh:ro
      #                               ↑ Read-Only flag
```

### What Happens Behind the Scenes

1. **Mount Process**:
   ```
   Docker Daemon receives mount instruction
           ↓
   Creates filesystem bridge
           ↓
   Maps inode references
           ↓
   Establishes file watchers
           ↓
   Synchronizes permissions
   ```

2. **File Operations**:
   ```
   When you save a file in VS Code (host):
   - File system event triggered
   - Docker daemon notified
   - File instantly visible in container
   - No copying involved (same inode)
   ```

### Advantages
- ✅ Instant synchronization
- ✅ No duplication of data
- ✅ Bidirectional updates
- ✅ Perfect for development
- ✅ IDE integration works seamlessly

### Disadvantages
- ❌ Can be slower on Windows/Mac (virtualization layer)
- ❌ Permission issues possible
- ❌ Container depends on host file system
- ❌ Not portable (paths are host-specific)

### Real-World Volume Mount Example

```bash
# Create a file on host
echo "Hello from host" > ./projects/test.txt

# Inside container - file appears instantly
docker exec claude-swarm cat /workspace/projects/test.txt
# Output: Hello from host

# Edit in container
docker exec claude-swarm bash -c 'echo "Added in container" >> /workspace/projects/test.txt'

# Check on host - changes appear instantly
cat ./projects/test.txt
# Output: 
# Hello from host
# Added in container
```

---

## Method 2: Docker Copy (One-Time Transfer) {#docker-copy}

Docker copy is like a **courier service** - it delivers files from one place to another, but doesn't maintain a connection.

### Syntax

```bash
# Copy TO container
docker cp source-file container-name:/destination/path

# Copy FROM container
docker cp container-name:/source/path destination-file

# Copy entire directory
docker cp -r source-dir container-name:/destination/
```

### Detailed Examples

```bash
# 1. Copy a single file to container
docker cp myapp.py claude-swarm:/workspace/
# Creates: /workspace/myapp.py in container

# 2. Copy with different name
docker cp myapp.py claude-swarm:/workspace/application.py

# 3. Copy directory recursively
docker cp ./my-project claude-swarm:/workspace/projects/

# 4. Copy from container to host
docker cp claude-swarm:/workspace/results.json ./local-results.json

# 5. Copy with wildcards (using intermediate step)
docker exec claude-swarm tar -cf /tmp/logs.tar /workspace/logs/*.log
docker cp claude-swarm:/tmp/logs.tar ./logs-backup.tar
```

### When to Use Docker Copy

1. **One-time configuration files**:
   ```bash
   docker cp production.env myapp:/app/.env
   ```

2. **Extracting generated files**:
   ```bash
   docker cp myapp:/app/build/output.zip ./
   ```

3. **Debugging - grabbing logs**:
   ```bash
   docker cp myapp:/var/log/app.log ./debug-logs/
   ```

4. **Injecting scripts temporarily**:
   ```bash
   docker cp fix-script.sh myapp:/tmp/
   docker exec myapp /tmp/fix-script.sh
   ```

### Advantages
- ✅ Simple and straightforward
- ✅ Works with stopped containers
- ✅ No performance overhead
- ✅ Good for production deployments

### Disadvantages
- ❌ Manual process
- ❌ No automatic updates
- ❌ Can lead to version mismatches
- ❌ Easy to forget to update

---

## Method 3: Bind Mounts vs Named Volumes {#bind-mounts-vs-named-volumes}

### Bind Mounts (What We Use)

```yaml
volumes:
  - ./my-code:/app/code  # Bind mount - specific host directory
```

**Characteristics**:
- Direct mapping to host filesystem
- You control the exact location
- Portable across developer machines
- Can mount any host directory

### Named Volumes (Docker Managed)

```yaml
volumes:
  - mydata:/app/data  # Named volume - Docker manages location

# Define at bottom of docker-compose.yml
volumes:
  mydata:  # Docker decides where to store this
```

**Characteristics**:
- Docker manages the storage location
- Better performance on Windows/Mac
- Survives container removal
- Can be shared between containers

### Comparison in Practice

```yaml
services:
  app:
    volumes:
      # Bind mount - for code (you edit this)
      - ./src:/app/src
      
      # Named volume - for data (app generates this)
      - postgres-data:/var/lib/postgresql/data
      
      # Anonymous volume - for temp files
      - /app/tmp

volumes:
  postgres-data:  # Persists database between container restarts
```

---

## How Claude Swarm Uses File Sharing {#claude-swarm-implementation}

Our Claude Swarm implementation uses a sophisticated combination of all methods:

### 1. The docker-compose.yml Configuration

```yaml
services:
  claude-swarm:
    volumes:
      # Project files - main work directory
      - ./projects:/workspace/projects
      
      # Configuration templates
      - ./configs:/workspace/configs
      
      # Logs for debugging
      - ./logs:/workspace/logs
      
      # Session data
      - ./sessions:/workspace/sessions
      
      # Development tools (isolated)
      - node_modules:/workspace/node_modules
      - gems:/home/developer/.gem
      
      # Claude configuration
      - claude_config:/home/developer/.claude
      
      # Git configuration (read-only for security)
      - ~/.gitconfig:/home/developer/.gitconfig:ro
      - ~/.ssh:/home/developer/.ssh:ro

volumes:
  # Named volumes for better performance
  node_modules:   # npm packages
  gems:          # Ruby gems
  claude_config: # Claude settings
```

### 2. File Flow in Claude Swarm

```
┌─────────────────────────────────────────────┐
│              HOST SYSTEM                    │
│                                             │
│  claude-swarm-docker/                       │
│    ├── projects/          ←═══════════╗    │
│    │   └── todo-app/                  ║    │
│    ├── configs/           ←═══════╗   ║    │
│    │   └── *.yml                  ║   ║    │
│    ├── create-real-app.py ──┐     ║   ║    │
│    └── demo-swarm.py     ──┐│     ║   ║    │
└─────────────────────────────┼┼─────║───║────┘
                              ││     ║   ║
                     docker cp││     ║   ║ volumes
                              ↓↓     ║   ║
┌─────────────────────────────────────║───║────┐
│          CONTAINER (/workspace)     ║   ║    │
│                                     ↓   ↓    │
│  ├── create-real-app.py                      │
│  ├── demo-swarm.py                           │
│  ├── projects/  ═══════════════════════╝    │
│  │   └── todo-app/  (created by agents)      │
│  ├── configs/ ═══════════════════╝           │
│  └── sessions/                               │
└──────────────────────────────────────────────┘
```

### 3. Practical Workflow

1. **You write code** in VS Code on Windows
2. **File saves** trigger filesystem events
3. **Docker daemon** syncs via volume mount
4. **Container sees** changes instantly
5. **Agent creates files** in container
6. **Files appear** on your host
7. **You can edit** in your favorite editor

---

## Real-World Examples and Demonstrations {#real-world-examples}

### Example 1: Development Workflow

```bash
# 1. Create a new feature file on host
echo "export function newFeature() { return 'Hello'; }" > ./projects/feature.js

# 2. Inside container - run tests immediately
docker exec claude-swarm bash -c "cd /workspace/projects && node -e \"console.log(require('./feature.js').newFeature())\""
# Output: Hello

# 3. Agent modifies the file
docker exec claude-swarm bash -c "echo 'export function autoGenerated() { return \"AI was here\"; }' >> /workspace/projects/feature.js"

# 4. Open in VS Code on host - see both functions!
code ./projects/feature.js
```

### Example 2: Debugging Production Issues

```bash
# Production container having issues
# 1. Copy configuration to analyze
docker cp prod-app:/app/config/current.json ./debug/

# 2. Copy logs
docker cp prod-app:/var/log/app/ ./debug/logs/

# 3. Analyze locally, create fix
echo "fixed config" > ./debug/fixed.json

# 4. Copy fix back
docker cp ./debug/fixed.json prod-app:/app/config/current.json

# 5. Restart application
docker exec prod-app supervisorctl restart app
```

### Example 3: Building Assets

```bash
# Development with live reload
docker run -it --rm \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/dist:/app/dist \
  -p 3000:3000 \
  node:18 \
  bash -c "cd /app && npm run dev"

# Any changes to ./src are instantly reflected
# Built files appear in ./dist immediately
```

---

## Common Pitfalls and Solutions {#common-pitfalls}

### 1. Permission Issues

**Problem**: Files created in container owned by root
```bash
# In container as root
touch /workspace/projects/root-file.txt

# On host - can't edit!
ls -la ./projects/root-file.txt
# -rw-r--r-- 1 root root 0 Jan 23 10:00 root-file.txt
```

**Solution**: Use correct user
```yaml
# In Dockerfile
USER developer

# Or in docker-compose.yml
user: "1000:1000"  # Match your host user ID
```

### 2. Line Ending Issues (Windows)

**Problem**: Windows CRLF vs Linux LF
```bash
# Script fails in container
./script.sh
# : bad interpreter: /bin/bash^M: no such file
```

**Solution**: Configure Git
```bash
# Globally
git config --global core.autocrlf input

# Or per-repository
echo "* text=auto eol=lf" > .gitattributes
```

### 3. Performance Issues on Mac/Windows

**Problem**: Slow file operations
```bash
# Massive node_modules causing slowness
npm install  # Takes forever
```

**Solution**: Use named volumes for dependencies
```yaml
volumes:
  # Source code - needs editing
  - ./src:/app/src
  
  # Dependencies - better as named volume
  - node_modules:/app/node_modules
  
volumes:
  node_modules:
```

### 4. File Not Updating

**Problem**: Changed file but container doesn't see it
```bash
# Edit file on host
echo "updated" > ./projects/file.txt

# In container - still shows old content
cat /workspace/projects/file.txt  # Shows old content
```

**Solution**: Check mount is correct
```bash
# Verify mounts
docker inspect claude-swarm | grep -A 10 Mounts

# Ensure no typos in paths
docker-compose config | grep volumes
```

---

## Performance Considerations {#performance-considerations}

### File System Performance Hierarchy

1. **Fastest**: Linux host with native Docker
   - Direct kernel integration
   - No virtualization overhead
   - Near-native performance

2. **Good**: Named volumes on any platform
   - Docker optimized storage
   - Cached operations
   - Good for dependencies

3. **Moderate**: Bind mounts on Mac/Windows
   - Goes through virtualization layer
   - File watching overhead
   - Acceptable for source code

4. **Slowest**: Large directories on Mac/Windows
   - node_modules with 50,000 files
   - Massive git repositories
   - Frequent small file operations

### Optimization Strategies

```yaml
services:
  app:
    volumes:
      # Source code - needs syncing
      - ./src:/app/src:cached  # macOS optimization
      
      # Build outputs - one direction
      - ./dist:/app/dist:delegated  # Container priority
      
      # Dependencies - named volume
      - deps:/app/node_modules
      
      # Temp files - anonymous volume
      - /app/tmp
      
volumes:
  deps:
```

### Performance Testing

```bash
# Test write performance
docker exec claude-swarm bash -c "time dd if=/dev/zero of=/workspace/test.dat bs=1M count=100"

# Test read performance  
docker exec claude-swarm bash -c "time cat /workspace/test.dat > /dev/null"

# Test many small files
docker exec claude-swarm bash -c "
  time for i in {1..1000}; do 
    echo $i > /workspace/projects/test_$i.txt
  done
"
```

---

## Security Implications {#security-implications}

### 1. Read-Only Mounts

Protect sensitive files:
```yaml
volumes:
  # Prevent container from modifying SSH keys
  - ~/.ssh:/home/developer/.ssh:ro
  
  # Config files that shouldn't change
  - ./prod-config.yml:/app/config.yml:ro
```

### 2. User Namespace Remapping

Enhance security with user namespaces:
```json
// /etc/docker/daemon.json
{
  "userns-remap": "default"
}
```

### 3. Secrets Management

Never put secrets in volumes:
```yaml
# BAD - secrets in volume
volumes:
  - ./secrets:/app/secrets  # NO!

# GOOD - use Docker secrets
secrets:
  api_key:
    file: ./api_key.txt
    
services:
  app:
    secrets:
      - api_key
```

### 4. Volume Permissions

Set appropriate permissions:
```dockerfile
# In Dockerfile
RUN mkdir -p /app/data && \
    chown -R appuser:appuser /app/data && \
    chmod 750 /app/data
```

---

## Advanced Patterns {#advanced-patterns}

### 1. Multi-Stage Development

```yaml
# docker-compose.override.yml (development)
services:
  app:
    volumes:
      - ./src:/app/src
      - ./tests:/app/tests
    command: npm run dev

# docker-compose.prod.yml (production)  
services:
  app:
    volumes:
      - logs:/app/logs  # Only logs, no source
    command: npm start
```

### 2. Shared Volumes Between Containers

```yaml
services:
  app:
    volumes:
      - shared-data:/data
      
  worker:
    volumes:
      - shared-data:/data  # Same data accessible
      
  backup:
    volumes:
      - shared-data:/backup:ro  # Read-only access
      
volumes:
  shared-data:
```

### 3. Volume Initialization

```yaml
services:
  db:
    image: postgres
    volumes:
      # Initialize with SQL scripts
      - ./init-scripts:/docker-entrypoint-initdb.d
      - postgres-data:/var/lib/postgresql/data
      
volumes:
  postgres-data:
```

### 4. Development vs Production Patterns

```bash
# Development - everything mounted
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Staging - configs only
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up

# Production - minimal mounts
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### 5. Backup Strategies

```bash
# Backup named volume
docker run --rm \
  -v myapp_data:/source:ro \
  -v $(pwd)/backups:/backup \
  alpine \
  tar -czf /backup/data-$(date +%Y%m%d).tar.gz -C /source .

# Restore named volume
docker run --rm \
  -v myapp_data:/target \
  -v $(pwd)/backups:/backup:ro \
  alpine \
  tar -xzf /backup/data-20240123.tar.gz -C /target
```

---

## Summary and Best Practices

### Key Takeaways

1. **Volume mounts** = Live development bridge
2. **Docker cp** = One-time file transfer  
3. **Named volumes** = Docker-managed storage
4. **Bind mounts** = Direct host directory mapping

### Best Practices Checklist

- ✅ Use bind mounts for source code
- ✅ Use named volumes for dependencies
- ✅ Use read-only mounts for sensitive files
- ✅ Match user IDs between host and container
- ✅ Configure Git for consistent line endings
- ✅ Use .dockerignore to exclude unnecessary files
- ✅ Test performance with your specific use case
- ✅ Document your volume strategy in README
- ✅ Use docker-compose for complex setups
- ✅ Keep security in mind - principle of least privilege

### The Claude Swarm Advantage

Our setup leverages all these concepts to create a seamless development experience:
- Edit in your favorite IDE (VS Code, etc.)
- Run in an isolated, reproducible environment
- Share files bidirectionally and instantly
- Maintain security with read-only mounts
- Optimize performance with named volumes

This is the power of Docker file sharing - bringing the best of both worlds together! 🚀

---

*This guide is part of the Claude Swarm Docker documentation. For more information, see the other guides in this series.*