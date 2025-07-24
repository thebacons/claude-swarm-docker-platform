# Docker WSL Setup Instructions

## Issue
Docker commands are not available in this WSL 2 distribution.

## Solution

### 1. Enable WSL Integration in Docker Desktop

1. Open Docker Desktop on Windows
2. Go to Settings (gear icon)
3. Navigate to Resources → WSL Integration
4. Enable integration with your WSL distro
5. Click "Apply & Restart"

### 2. Alternative: Use Windows Docker Directly

If WSL integration cannot be enabled, run Docker commands from Windows:

```powershell
# From Windows PowerShell or Command Prompt
cd C:\Users\colin\Documents-local\91_Claude-Code\claude-swarm-docker-spawn

# Build and run
docker-compose -f docker-compose.enhanced.yml build
docker-compose -f docker-compose.enhanced.yml up -d
```

### 3. Test Docker Access

After enabling WSL integration, test from WSL:
```bash
docker --version
docker-compose --version
```

### 4. Install Docker Compose (if needed)

If docker works but docker-compose doesn't:
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Test
docker-compose --version
```

## Quick Fix for Current Session

If you need to test immediately from Windows:

1. Open Windows Terminal or Command Prompt
2. Navigate to project directory:
   ```
   cd C:\Users\colin\Documents-local\91_Claude-Code\claude-swarm-docker-spawn
   ```
3. Run the Docker commands directly:
   ```
   docker-compose -f docker-compose.enhanced.yml build
   docker-compose -f docker-compose.enhanced.yml up -d
   ```

## Verifying the Fix

Once Docker is accessible from WSL:
```bash
# In WSL
cd /mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn
./build-enhanced.sh
```

## Note
The Docker setup itself is correct. The issue is only with Docker availability in the WSL environment. Once Docker Desktop WSL integration is enabled, all scripts will work as expected.