# Container Access Guide

## Method 1: Docker Exec (Recommended)

### From Windows Command Prompt or PowerShell:
```cmd
docker exec -it claude-policeman /bin/bash
docker exec -it claude-developer-1 /bin/bash
docker exec -it claude-developer-2 /bin/bash
docker exec -it claude-tester /bin/bash
```

### From WSL:
```bash
docker exec -it claude-policeman /bin/bash
docker exec -it claude-developer-1 /bin/bash
```

## Method 2: Windows Terminal Profiles

Add these to your Windows Terminal settings.json:

```json
{
    "profiles": {
        "list": [
            {
                "name": "Claude Policeman",
                "commandline": "docker exec -it claude-policeman /bin/bash",
                "icon": "🤖",
                "colorScheme": "Campbell"
            },
            {
                "name": "Claude Developer 1",
                "commandline": "docker exec -it claude-developer-1 /bin/bash",
                "icon": "💻",
                "colorScheme": "One Half Dark"
            },
            {
                "name": "Claude Developer 2",
                "commandline": "docker exec -it claude-developer-2 /bin/bash",
                "icon": "💻",
                "colorScheme": "One Half Dark"
            },
            {
                "name": "Claude Tester",
                "commandline": "docker exec -it claude-tester /bin/bash",
                "icon": "🧪",
                "colorScheme": "Solarized Dark"
            }
        ]
    }
}
```

## Method 3: SSH Access (for PuTTY)

### Build SSH-enabled container:
```bash
# Build the SSH version
docker build -f Dockerfile.ssh -t claude-ssh .

# Run with SSH exposed
docker run -d -p 2222:22 --name claude-ssh claude-ssh
```

### Connect with PuTTY:
- **Host**: localhost
- **Port**: 2222
- **Username**: developer
- **Password**: claude

### Connect with SSH from Command Line:
```bash
ssh developer@localhost -p 2222
# Password: claude
```

## Method 4: Docker Desktop Terminal

1. Open Docker Desktop
2. Go to Containers tab
3. Click on any running container
4. Click "Terminal" tab
5. You're now in the container shell

## Method 5: VS Code Docker Extension

1. Install Docker extension in VS Code
2. Open Docker view (whale icon)
3. Right-click on any container
4. Select "Attach Shell"

## Quick Access Aliases (Add to your .bashrc or PowerShell profile)

### For PowerShell ($PROFILE):
```powershell
function claude-policeman { docker exec -it claude-policeman /bin/bash }
function claude-dev1 { docker exec -it claude-developer-1 /bin/bash }
function claude-dev2 { docker exec -it claude-developer-2 /bin/bash }
function claude-tester { docker exec -it claude-tester /bin/bash }
```

### For Bash (.bashrc):
```bash
alias claude-policeman='docker exec -it claude-policeman /bin/bash'
alias claude-dev1='docker exec -it claude-developer-1 /bin/bash'
alias claude-dev2='docker exec -it claude-developer-2 /bin/bash'
alias claude-tester='docker exec -it claude-tester /bin/bash'
```

## Container User Information

- **Default User**: developer (non-root)
- **Home Directory**: /home/developer
- **Working Directory**: /workspace
- **Sudo Access**: Yes (no password required)

## Useful Commands Once Connected

```bash
# Check versions
/workspace/scripts/check-claude-version.sh

# Run health check
/workspace/scripts/health-check.sh

# Test Claude SDK
claude-test  # Says hello using Anthropic API

# Check environment
env | grep -E "(ANTHROPIC|CLAUDE|AGENT)"

# View logs
tail -f /workspace/logs/*.log
```

## Troubleshooting

### Container not running?
```bash
docker ps -a  # Check all containers
docker start claude-policeman  # Start specific container
```

### Permission denied?
The containers run as 'developer' user. Use sudo for admin tasks:
```bash
sudo apt update
sudo apt install vim
```

### Can't connect?
1. Ensure Docker Desktop is running
2. Check container status: `docker ps`
3. Restart container: `docker restart claude-policeman`