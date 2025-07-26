# Implementation Guide - Claude Swarm Docker Platform

This guide provides step-by-step instructions to build the Claude Swarm Docker Platform from scratch, including all components, configurations, and the SSH access setup.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Docker Configuration](#docker-configuration)
4. [Container Components](#container-components)
5. [SSH Access Setup](#ssh-access-setup)
6. [Hook System](#hook-system)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Windows 10/11 Professional or Enterprise (for Docker Desktop)
- WSL2 enabled and configured
- At least 16GB RAM (8GB minimum available for Docker)
- 50GB free disk space
- Hyper-V enabled

### Software Requirements
```bash
# Install these first:
1. Docker Desktop 4.42.2 or later
2. WSL2 with Ubuntu distribution
3. Git
4. Text editor (VS Code recommended)
5. PuTTY (for SSH access testing)
```

### API Keys
- Anthropic API key (required)
- Linear API key (optional)
- GitHub Personal Access Token (required for pushing code)

## 🔐 CRITICAL: GitHub Authentication Method

### Working GitHub PAT Configuration
The correct GitHub Personal Access Token is stored in the `.env` file:
```bash
# Location: /mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/.env
GITHUB_PAT_KEY=<token-in-env-file>
```

### How to Push to GitHub (Required Method)
```bash
# 1. First export the PAT from .env
source .env  # Or manually export from .env file

# 2. Push using this exact format
git push https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/REPO_NAME.git BRANCH_NAME

# Example for this project:
git push https://${GITHUB_USERNAME}:${GITHUB_PAT_KEY}@github.com/${GITHUB_USERNAME}/claude-swarm-docker-platform.git feature/bac-151-docker-container-base
```

### Important Notes:
- **GitHub Username**: Stored in .env file as `GITHUB_USERNAME`
- **PAT Location**: `/mnt/c/Users/colin/Documents-local/91_Claude-Code/.env`
- **DO NOT** use other PAT tokens found in .env files - only the one above works
- This PAT must be available in containers for agents to push code

## Project Setup

### 1. Create Project Directory
```bash
# In WSL2 or Windows Terminal
mkdir -p ~/claude-swarm-docker-spawn
cd ~/claude-swarm-docker-spawn
git init
```

### 2. Create Directory Structure
```bash
mkdir -p {hooks/{validators,fixers,testers},projects,configs,scripts,logs/{policeman,developer-1,developer-2,tester},dashboard/dist}
```

### 3. Environment Configuration
Create `.env` file:
```bash
cat > .env << 'EOF'
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE

# Optional: Linear API for task management
LINEAR_API_KEY=

# Optional: GitHub PAT for repository operations
GITHUB_PAT_KEY=

# Container Configuration
AUTO_UPDATE_CLAUDE=false

# Database Configuration
POSTGRES_USER=claude
POSTGRES_PASSWORD=claude_secure_password_change_this
POSTGRES_DB=claude_orchestration

# Redis Configuration
REDIS_PASSWORD=redis_secure_password_change_this

# CRITICAL: GitHub PAT for agents to push code
GITHUB_PAT_KEY=<your-working-github-pat-here>
EOF
```

Create `.env.example`:
```bash
cp .env .env.example
# Then remove sensitive values from .env.example
```

## Docker Configuration

### 1. Main Dockerfile (Dockerfile.enhanced)
```dockerfile
# Claude Swarm Docker Container - Enhanced with Claude Code
FROM ubuntu:22.04

# Build arguments for version management
ARG CLAUDE_CODE_VERSION="latest"
ARG NODE_VERSION="20"
ARG PYTHON_VERSION="3.11"

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    sudo \
    build-essential \
    software-properties-common \
    ca-certificates \
    gnupg \
    lsb-release \
    jq \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Add Python PPA and install Python 3.11
RUN add-apt-repository ppa:deadsnakes/ppa -y && \
    apt-get update && \
    apt-get install -y \
    python${PYTHON_VERSION} \
    python${PYTHON_VERSION}-venv \
    python${PYTHON_VERSION}-dev \
    python${PYTHON_VERSION}-distutils \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1 && \
    update-alternatives --install /usr/bin/python python /usr/bin/python${PYTHON_VERSION} 1

# Install pip for Python 3.11
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python${PYTHON_VERSION}

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Install Ruby (for potential future use)
RUN apt-get update && apt-get install -y \
    ruby-full \
    ruby-dev \
    && gem install bundler \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash developer && \
    echo "developer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set up workspace structure
WORKDIR /workspace
RUN mkdir -p \
    projects \
    configs \
    logs \
    sessions \
    hooks \
    .claude-code \
    scripts \
    && chown -R developer:developer /workspace

# Switch to non-root user for Claude Code installation
USER developer

# Set environment variables
ENV PATH="/home/developer/.local/bin:${PATH}"
ENV CLAUDE_HOME="/home/developer/.claude"
ENV ANTHROPIC_API_KEY=""

# Install Python packages as user
RUN pip3 install --user \
    anthropic \
    requests \
    pyyaml \
    python-dotenv

# Copy and set up scripts (created later)
USER root
COPY --chown=developer:developer scripts/ /workspace/scripts/
RUN chmod +x /workspace/scripts/*.sh

# Switch back to developer user
USER developer

# Expose port for potential web UI
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /workspace/scripts/health-check.sh || exit 1

# Set working directory
WORKDIR /workspace

# Entry point
ENTRYPOINT ["/workspace/scripts/startup.sh"]

# Default command
CMD ["/bin/bash"]
```

### 2. Docker Compose Configuration (docker-compose.enhanced.yml)
```yaml
version: '3.8'

services:
  policeman:
    build:
      context: .
      dockerfile: Dockerfile.enhanced
    container_name: claude-policeman
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - LINEAR_API_KEY=${LINEAR_API_KEY:-}
      - GITHUB_PAT_KEY=${GITHUB_PAT_KEY:-}
      - AGENT_ROLE=policeman
      - AUTO_UPDATE_CLAUDE=${AUTO_UPDATE_CLAUDE:-false}
      - REDIS_HOST=claude-redis
      - POSTGRES_HOST=claude-postgres
    volumes:
      - ./projects:/workspace/projects
      - ./hooks:/workspace/hooks:ro
      - ./logs/policeman:/workspace/logs
      - ./.env:/workspace/.env:ro
      - policeman-claude:/home/developer/.claude
      - policeman-cache:/home/developer/.cache
    ports:
      - "8080:8080"
    networks:
      - claude-net
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  developer-1:
    build:
      context: .
      dockerfile: Dockerfile.enhanced
    container_name: claude-developer-1
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - AGENT_ROLE=developer
      - AGENT_ID=developer-1
      - REDIS_HOST=claude-redis
      - POSTGRES_HOST=claude-postgres
    volumes:
      - ./projects:/workspace/projects
      - ./hooks:/workspace/hooks:ro
      - ./logs/developer-1:/workspace/logs
      - dev1-claude:/home/developer/.claude
      - dev1-cache:/home/developer/.cache
    networks:
      - claude-net
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  developer-2:
    build:
      context: .
      dockerfile: Dockerfile.enhanced
    container_name: claude-developer-2
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - AGENT_ROLE=developer
      - AGENT_ID=developer-2
      - REDIS_HOST=claude-redis
      - POSTGRES_HOST=claude-postgres
    volumes:
      - ./projects:/workspace/projects
      - ./hooks:/workspace/hooks:ro
      - ./logs/developer-2:/workspace/logs
      - dev2-claude:/home/developer/.claude
      - dev2-cache:/home/developer/.cache
    networks:
      - claude-net
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  tester:
    build:
      context: .
      dockerfile: Dockerfile.enhanced
    container_name: claude-tester
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - AGENT_ROLE=tester
      - REDIS_HOST=claude-redis
      - POSTGRES_HOST=claude-postgres
    volumes:
      - ./projects:/workspace/projects
      - ./hooks:/workspace/hooks:ro
      - ./logs/tester:/workspace/logs
      - tester-claude:/home/developer/.claude
      - tester-cache:/home/developer/.cache
    networks:
      - claude-net
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  redis:
    image: redis:7-alpine
    container_name: claude-redis
    command: redis-server --requirepass ${REDIS_PASSWORD:-redis_password}
    ports:
      - "6379:6379"
    networks:
      - claude-net
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  postgres:
    image: postgres:15-alpine
    container_name: claude-postgres
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    networks:
      - claude-net
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  dashboard:
    image: nginx:alpine
    container_name: claude-dashboard
    volumes:
      - ./dashboard/dist:/usr/share/nginx/html:ro
      - ./configs/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "3000:80"
    networks:
      - claude-net
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

networks:
  claude-net:
    driver: bridge

volumes:
  postgres-data:
  policeman-claude:
  policeman-cache:
  dev1-claude:
  dev1-cache:
  dev2-claude:
  dev2-cache:
  tester-claude:
  tester-cache:
```

### 3. Database Initialization (scripts/init-db.sql)
```sql
-- Claude Swarm Orchestration Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'idle',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    capabilities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id),
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    assigned_to UUID REFERENCES agents(id),
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    input_data JSONB,
    output_data JSONB,
    error_data JSONB
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agent_id UUID REFERENCES agents(id),
    task_id UUID REFERENCES tasks(id),
    action VARCHAR(100) NOT NULL,
    details JSONB
);

-- Agent communications table
CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_agent UUID REFERENCES agents(id),
    to_agent UUID REFERENCES agents(id),
    message_type VARCHAR(50),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_messages_created ON agent_messages(created_at);

-- Insert default agents
INSERT INTO agents (name, type, capabilities) VALUES
    ('policeman', 'orchestrator', '{"can_assign_tasks": true, "can_validate": true}'),
    ('developer-1', 'developer', '{"languages": ["python", "javascript", "typescript"]}'),
    ('developer-2', 'developer', '{"languages": ["python", "javascript", "typescript"]}'),
    ('tester', 'tester', '{"test_types": ["unit", "integration", "e2e"]}')
ON CONFLICT (name) DO NOTHING;
```

## Container Components

### 1. Startup Script (scripts/startup.sh)
```bash
#!/bin/bash

echo "=== Claude Swarm Container Starting ==="
echo "Agent Role: ${AGENT_ROLE:-unknown}"
echo "Agent ID: ${AGENT_ID:-${AGENT_ROLE}}"
echo ""

# Load environment variables from .env if it exists
if [ -f /workspace/.env ]; then
    echo "Loading environment from .env..."
    set -a
    source /workspace/.env
    set +a
fi

# Check versions
/workspace/scripts/check-claude-version.sh

# Install/update Claude Code if requested
if [ "$AUTO_UPDATE_CLAUDE" = "true" ]; then
    echo "Checking for Claude Code updates..."
    /workspace/scripts/install-claude-code.sh
fi

# Set up hooks if directory is mounted
if [ -d /workspace/hooks ]; then
    echo "Setting up Claude Code hooks..."
    mkdir -p /home/developer/.claude-code
    
    # Create settings.json for hooks
    cat > /home/developer/.claude-code/settings.json << 'SETTINGS'
{
  "hooks": {
    "preToolUse": [],
    "postToolUse": [
      {
        "matcher": {
          "tools": ["Write"],
          "files": ["*.js", "*.jsx", "*.ts", "*.tsx"]
        },
        "command": "bash /workspace/hooks/validators/syntax-check.sh ${CLAUDE_FILE_PATH}",
        "blocking": true
      },
      {
        "matcher": {
          "tools": ["Write"],
          "files": ["*.js", "*.jsx"]
        },
        "command": "bash /workspace/hooks/validators/react-check.sh ${CLAUDE_FILE_PATH}",
        "blocking": true
      }
    ],
    "postConversation": []
  }
}
SETTINGS
    echo "Hooks configured."
fi

# Run health check
/workspace/scripts/health-check.sh

# Start agent-specific services
case "$AGENT_ROLE" in
    "policeman")
        echo "Starting Policeman orchestration services..."
        # Future: Start orchestration API
        ;;
    "developer")
        echo "Starting Developer agent services..."
        # Future: Connect to task queue
        ;;
    "tester")
        echo "Starting Tester agent services..."
        # Future: Start test runners
        ;;
esac

echo ""
echo "=== Container Ready ==="
echo ""

# Keep container running
exec "$@"
```

### 2. Health Check Script (scripts/health-check.sh)
```bash
#!/bin/bash

echo "=== Health Check ==="

# Check API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "WARNING: ANTHROPIC_API_KEY not set"
    exit 1
fi

# Test Python SDK
python3 -c "import anthropic; print('✓ Anthropic SDK available')" 2>/dev/null || echo "✗ Anthropic SDK error"

# Test network connectivity
if command -v curl &> /dev/null; then
    curl -s -o /dev/null -w "✓ Network connectivity OK\n" https://api.anthropic.com 2>/dev/null || echo "✗ Network error"
fi

# Test Redis connection (if configured)
if [ ! -z "$REDIS_HOST" ]; then
    python3 -c "
import os
try:
    import redis
    r = redis.Redis(host=os.environ.get('REDIS_HOST', 'localhost'), 
                    password=os.environ.get('REDIS_PASSWORD', ''))
    r.ping()
    print('✓ Redis connection OK')
except:
    print('✗ Redis connection failed')
" 2>/dev/null || echo "✗ Redis module not installed"
fi

# Test PostgreSQL connection (if configured)
if [ ! -z "$POSTGRES_HOST" ]; then
    python3 -c "
import os
try:
    import psycopg2
    conn = psycopg2.connect(
        host=os.environ.get('POSTGRES_HOST', 'localhost'),
        database=os.environ.get('POSTGRES_DB', 'claude_orchestration'),
        user=os.environ.get('POSTGRES_USER', 'claude'),
        password=os.environ.get('POSTGRES_PASSWORD', '')
    )
    conn.close()
    print('✓ PostgreSQL connection OK')
except:
    print('✗ PostgreSQL connection failed')
" 2>/dev/null || echo "✗ PostgreSQL module not installed"
fi

# Test file permissions
touch /workspace/test-write 2>/dev/null && rm /workspace/test-write && echo "✓ Write permissions OK" || echo "✗ Write permission error"

echo "=== Health Check Complete ==="
```

### 3. Version Check Script (scripts/check-claude-version.sh)
```bash
#!/bin/bash

echo "=== Claude Code Version Check ==="
echo ""

# Check if Claude Code is installed
if command -v claude 2>&1 >/dev/null; then
    echo "Claude Code version:"
    claude --version 2>/dev/null || echo "Version command not available"
else
    echo "Claude Code: Not installed"
    echo "Using Claude SDK wrapper instead"
fi

echo ""
echo "Python version:"
python3 --version

echo ""
echo "Node.js version:"
node --version

echo ""
echo "Anthropic SDK version:"
pip show anthropic | grep Version || echo "Not installed"

echo ""
echo "=== Environment ==="
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:+[SET]}"
echo "CLAUDE_HOME: $CLAUDE_HOME"
echo "AGENT_ROLE: ${AGENT_ROLE:-not set}"
echo "AGENT_ID: ${AGENT_ID:-not set}"
echo ""
```

## SSH Access Setup

### 1. SSH-Enabled Dockerfile (Dockerfile.ssh-simple)
```dockerfile
FROM ubuntu:22.04

# Install SSH and basic tools
RUN apt-get update && apt-get install -y \
    openssh-server \
    sudo \
    curl \
    git \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create user
RUN useradd -m -s /bin/bash developer && \
    echo "developer:claude" | chpasswd && \
    echo "developer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Configure SSH
RUN mkdir /var/run/sshd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Create workspace
WORKDIR /workspace
RUN chown developer:developer /workspace

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
```

### 2. SSH Container Start Script (start-ssh-container.sh)
```bash
#!/bin/bash

echo "=== Starting SSH-enabled Claude Container ==="
echo ""

# Build the SSH-enabled image
echo "Building SSH-enabled image..."
docker build -f Dockerfile.ssh-simple -t claude-ssh-simple . || {
    echo "Failed to build SSH image"
    exit 1
}

# Stop any existing SSH container
echo ""
echo "Stopping any existing SSH container..."
docker stop claude-ssh 2>/dev/null
docker rm claude-ssh 2>/dev/null

# Run the SSH container
echo ""
echo "Starting SSH container on port 2222..."
docker run -d \
    --name claude-ssh \
    -p 2222:22 \
    -e ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}" \
    -v "$(pwd)/projects:/workspace/projects" \
    -v "$(pwd)/hooks:/workspace/hooks:ro" \
    --network claude-swarm-docker-spawn_claude-net \
    claude-ssh-simple || {
    echo "Failed to start SSH container"
    exit 1
}

# Wait for SSH to start
echo ""
echo "Waiting for SSH service to start..."
sleep 5

# Test SSH connection
echo ""
echo "Testing SSH connection..."
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 \
    developer@localhost -p 2222 echo "SSH connection successful!" 2>/dev/null || {
    echo "SSH service is starting up. Please wait a moment and try again."
}

echo ""
echo "=== SSH Container Ready ==="
echo ""
echo "PuTTY Connection Details:"
echo "  Host: localhost"
echo "  Port: 2222"
echo "  Username: developer"
echo "  Password: claude"
echo ""
echo "Command Line SSH:"
echo "  ssh developer@localhost -p 2222"
echo ""
```

### 3. Windows Batch Script (start-ssh-container.bat)
```batch
@echo off
REM Start SSH-enabled Container for PuTTY Access

echo === Starting SSH-enabled Claude Container ===
echo.

REM Build the SSH-enabled image
echo Building SSH-enabled image...
docker build -f Dockerfile.ssh-simple -t claude-ssh-simple .

if errorlevel 1 (
    echo.
    echo Failed to build SSH image.
    pause
    exit /b 1
)

REM Stop any existing SSH container
echo.
echo Stopping any existing SSH container...
docker stop claude-ssh 2>nul
docker rm claude-ssh 2>nul

REM Run the SSH container
echo.
echo Starting SSH container on port 2222...
docker run -d ^
    --name claude-ssh ^
    -p 2222:22 ^
    -e ANTHROPIC_API_KEY=%ANTHROPIC_API_KEY% ^
    -v "%cd%/projects:/workspace/projects" ^
    -v "%cd%/hooks:/workspace/hooks:ro" ^
    --network claude-swarm-docker-spawn_claude-net ^
    claude-ssh-simple

if errorlevel 1 (
    echo.
    echo Failed to start container!
    pause
    exit /b 1
)

REM Wait for SSH to start
echo.
echo Waiting for SSH service to start...
timeout /t 5 /nobreak > nul

echo.
echo === SSH Container Ready ===
echo.
echo PuTTY Connection Details:
echo   Host: localhost
echo   Port: 2222
echo   Username: developer
echo   Password: claude
echo.
echo Command Line SSH:
echo   ssh developer@localhost -p 2222
echo.
pause
```

### 4. Quick Connect Script (connect-container.bat)
```batch
@echo off
REM Quick Container Connection Script

:menu
cls
echo === Claude Swarm Container Access ===
echo.
echo Select a container to connect to:
echo 1. Policeman (Orchestrator)
echo 2. Developer 1
echo 3. Developer 2
echo 4. Tester
echo 5. SSH Container (PuTTY compatible)
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo Connecting to Policeman container...
    docker exec -it claude-policeman /bin/bash
    goto menu
) else if "%choice%"=="2" (
    echo Connecting to Developer 1 container...
    docker exec -it claude-developer-1 /bin/bash
    goto menu
) else if "%choice%"=="3" (
    echo Connecting to Developer 2 container...
    docker exec -it claude-developer-2 /bin/bash
    goto menu
) else if "%choice%"=="4" (
    echo Connecting to Tester container...
    docker exec -it claude-tester /bin/bash
    goto menu
) else if "%choice%"=="5" (
    echo.
    echo SSH Container Details:
    echo   Host: localhost
    echo   Port: 2222
    echo   Username: developer
    echo   Password: claude
    echo.
    echo Use PuTTY or: ssh developer@localhost -p 2222
    echo.
    pause
    goto menu
) else if "%choice%"=="6" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice!
    pause
    goto menu
)
```

## Hook System

### 1. Syntax Validator (hooks/validators/syntax-check.sh)
```bash
#!/bin/bash

# Syntax validation hook for JavaScript/TypeScript files
FILE_PATH="$1"

if [ -z "$FILE_PATH" ]; then
    echo "[SYNTAX-CHECK] Error: No file path provided"
    exit 1
fi

echo "[SYNTAX-CHECK] Validating: $FILE_PATH"

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo "[SYNTAX-CHECK] Error: File not found: $FILE_PATH"
    exit 1
fi

# Get file extension
EXT="${FILE_PATH##*.}"

# Run appropriate syntax check based on file type
case "$EXT" in
    js|jsx)
        # Use Node.js to check syntax
        node -c "$FILE_PATH" 2>&1
        if [ $? -eq 0 ]; then
            echo "[SYNTAX-CHECK] ✅ Syntax valid"
            exit 0
        else
            echo "[SYNTAX-CHECK] ❌ Syntax error detected"
            exit 1
        fi
        ;;
    ts|tsx)
        # TypeScript check (if tsc is available)
        if command -v tsc &> /dev/null; then
            tsc --noEmit "$FILE_PATH" 2>&1
            if [ $? -eq 0 ]; then
                echo "[SYNTAX-CHECK] ✅ TypeScript syntax valid"
                exit 0
            else
                echo "[SYNTAX-CHECK] ❌ TypeScript error detected"
                exit 1
            fi
        else
            echo "[SYNTAX-CHECK] ⚠️  TypeScript compiler not available, skipping"
            exit 0
        fi
        ;;
    py)
        # Python syntax check
        python3 -m py_compile "$FILE_PATH" 2>&1
        if [ $? -eq 0 ]; then
            echo "[SYNTAX-CHECK] ✅ Python syntax valid"
            rm -f "${FILE_PATH}c" # Remove compiled file
            exit 0
        else
            echo "[SYNTAX-CHECK] ❌ Python syntax error"
            exit 1
        fi
        ;;
    *)
        echo "[SYNTAX-CHECK] ⚠️  No syntax check for .$EXT files"
        exit 0
        ;;
esac
```

### 2. React Pattern Validator (hooks/validators/react-check.sh)
```bash
#!/bin/bash

# React pattern validation hook
FILE_PATH="$1"

if [ -z "$FILE_PATH" ]; then
    echo "[REACT-CHECK] Error: No file path provided"
    exit 1
fi

# Only check JS/JSX files
EXT="${FILE_PATH##*.}"
if [[ ! "$EXT" =~ ^(js|jsx)$ ]]; then
    echo "[REACT-CHECK] Skipping non-JavaScript file"
    exit 0
fi

echo "[REACT-CHECK] Validating React patterns in: $FILE_PATH"

# Check for ES6 imports in browser context
if grep -E "^import .* from ['\"]react['\"]" "$FILE_PATH" > /dev/null; then
    echo "[REACT-CHECK] ⚠️  Warning: ES6 imports detected"
    echo "[REACT-CHECK] Consider using browser-compatible format"
    
    # Check if there's a corresponding HTML file
    HTML_FILE="${FILE_PATH%.*}.html"
    if [ ! -f "$HTML_FILE" ]; then
        echo "[REACT-CHECK] ❌ No HTML file found for module loading"
        echo "[REACT-CHECK] Create $HTML_FILE with proper script tags"
        exit 1
    fi
fi

# Check for React hooks without React in scope
if grep -E "(useState|useEffect|useContext|useReducer)" "$FILE_PATH" > /dev/null; then
    if ! grep -E "(React\.|const.*=.*React)" "$FILE_PATH" > /dev/null; then
        echo "[REACT-CHECK] ❌ React hooks used without React in scope"
        echo "[REACT-CHECK] Add: const { useState, useEffect } = React;"
        exit 1
    fi
fi

echo "[REACT-CHECK] ✅ React patterns valid"
exit 0
```

### 3. Test Container Hooks Script (test-container-hooks.sh)
```bash
#!/bin/bash

echo "=== Testing Hook System in Container ==="
echo ""

TEST_FILE="/workspace/projects/test-hooks.js"

echo "Creating test file with ES6 modules (should fail)..."
docker exec claude-policeman bash -c "cat > $TEST_FILE << 'EOF'
import React from 'react';
import { useState } from 'react';

export default function TestComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
EOF"

echo ""
echo "Running syntax check hook..."
docker exec claude-policeman bash -c "/workspace/hooks/validators/syntax-check.sh $TEST_FILE"

echo ""
echo "Running React check hook..."
docker exec claude-policeman bash -c "/workspace/hooks/validators/react-check.sh $TEST_FILE"

echo ""
echo "=== Hook Test Complete ==="
echo ""
```

## Testing & Verification

### 1. Build and Start Script (build-enhanced.sh)
```bash
#!/bin/bash

echo "=== Building Enhanced Claude Swarm Platform ==="
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Creating .env template..."
    cp .env.example .env
    echo ".env created. Please add your API key."
    exit 1
fi

# Create necessary directories
echo "Creating directory structure..."
mkdir -p logs/{policeman,developer-1,developer-2,tester}
mkdir -p dashboard/dist
mkdir -p scripts

# Stop existing containers
echo ""
echo "Stopping existing containers..."
docker-compose -f docker-compose.enhanced.yml down

# Build the enhanced image
echo ""
echo "Building enhanced Docker image..."
docker-compose -f docker-compose.enhanced.yml build

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Docker build failed!"
    exit 1
fi

# Start the services
echo ""
echo "Starting services..."
docker-compose -f docker-compose.enhanced.yml up -d

# Wait for services
echo ""
echo "Waiting for services to initialize..."
sleep 10

# Check service status
echo ""
echo "=== Service Status ==="
docker-compose -f docker-compose.enhanced.yml ps

# Display access information
echo ""
echo "=== Access Information ==="
echo "Dashboard: http://localhost:3000"
echo "Policeman Shell: docker exec -it claude-policeman /bin/bash"
echo "Developer-1 Shell: docker exec -it claude-developer-1 /bin/bash"
echo "Redis CLI: docker exec -it claude-redis redis-cli"
echo "PostgreSQL: docker exec -it claude-postgres psql -U claude -d claude_orchestration"

echo ""
echo "=== Next Steps ==="
echo "1. Test health: docker exec claude-policeman /workspace/scripts/health-check.sh"
echo "2. Run hook test: ./test-container-hooks.sh"
echo "3. View logs: docker-compose -f docker-compose.enhanced.yml logs -f"
echo ""
```

### 2. Verification Steps
```bash
# 1. Verify all containers are running
docker ps
# Should show 7 containers: policeman, developer-1, developer-2, tester, redis, postgres, dashboard

# 2. Test Policeman health
docker exec claude-policeman /workspace/scripts/health-check.sh

# 3. Test Redis connectivity
docker exec -it claude-redis redis-cli -a ${REDIS_PASSWORD} ping
# Should return: PONG

# 4. Test PostgreSQL
docker exec -it claude-postgres psql -U claude -d claude_orchestration -c "SELECT * FROM agents;"
# Should show 4 agents

# 5. Test SSH access
./start-ssh-container.sh
ssh developer@localhost -p 2222
# Password: claude

# 6. Test hook system
./test-container-hooks.sh

# 7. Monitor logs
docker-compose -f docker-compose.enhanced.yml logs -f
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Docker Not Found in WSL
```bash
# Enable Docker Desktop WSL integration:
# Docker Desktop → Settings → Resources → WSL Integration → Enable
```

#### 2. Port Already in Use
```bash
# Find and stop conflicting services
netstat -ano | findstr :8080
netstat -ano | findstr :2222

# Or change ports in docker-compose.yml
```

#### 3. Container Fails Health Check
```bash
# Check logs
docker logs claude-policeman

# Verify API key
docker exec claude-policeman env | grep ANTHROPIC

# Rebuild if needed
docker-compose -f docker-compose.enhanced.yml build --no-cache
```

#### 4. SSH Connection Refused
```bash
# Ensure container is running
docker ps | grep claude-ssh

# Check SSH service
docker exec claude-ssh service ssh status

# Restart container
docker restart claude-ssh
```

#### 5. Permission Denied Errors
```bash
# Fix ownership inside container
docker exec -u root claude-policeman chown -R developer:developer /workspace

# Fix hook permissions
chmod +x hooks/validators/*.sh
chmod +x hooks/fixers/*.js
```

## Security Considerations

1. **API Keys**: Never commit `.env` file to git
2. **Passwords**: Change default passwords in production
3. **Network**: Use custom network for isolation
4. **Resources**: Set appropriate limits to prevent resource exhaustion
5. **SSH**: Disable password auth and use keys in production

## Next Steps

1. **Integrate Claude Code CLI** when it becomes available
2. **Implement actual orchestration logic** in Policeman
3. **Add monitoring dashboard** with real-time metrics
4. **Set up CI/CD pipeline** for automated testing
5. **Create Kubernetes manifests** for production deployment

---

This implementation guide provides everything needed to rebuild the Claude Swarm Docker Platform from scratch, including the SSH access setup that allows PuTTY connections.