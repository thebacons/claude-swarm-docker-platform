# Claude Code Authentication in Docker - Fix Guide

## Problem
When running Claude Code inside a Docker container, the OAuth authentication fails with "Invalid code" error because:
1. Claude Code isn't installed in the container
2. The OAuth callback can't reach the containerized instance
3. Browser-based auth doesn't work well in containers

## Solution 1: Use API Key Authentication (Recommended)

Since you already have an Anthropic API key in your `.env` file, we can use it directly instead of OAuth.

### Step 1: Update Dockerfile to Install Claude Code

Create a new file `install-claude.sh`:

```bash
#!/bin/bash
# Install Claude Code CLI
curl -fsSL https://storage.googleapis.com/anthropic-public/claude-cli/install.sh | sh
```

### Step 2: Configure Claude with API Key

Inside the container, instead of running `claude` (which triggers OAuth), use:

```bash
# Export the API key
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"

# Create Claude config directory
mkdir -p ~/.config/claude

# Create config file with API key
cat > ~/.config/claude/config.json << EOF
{
  "api_key": "${ANTHROPIC_API_KEY}",
  "model": "claude-3-5-sonnet-20241022"
}
EOF

# Test the configuration
claude --version
```

## Solution 2: Use Host's Claude Installation

Mount your host's Claude configuration into the container:

### Update docker-compose.yml:

```yaml
volumes:
  # Add this line to mount host Claude config
  - ~/.config/claude:/home/developer/.config/claude:ro
```

Then restart the container:
```bash
docker-compose down
docker-compose up -d
```

## Solution 3: Manual Token Setup

If you must use OAuth, you can manually copy the token:

1. On your host machine, authenticate Claude:
   ```bash
   claude login
   ```

2. Find your token:
   ```bash
   cat ~/.config/claude/auth.json
   ```

3. Copy the token content into the container:
   ```bash
   docker exec -it claude-swarm bash
   mkdir -p ~/.config/claude
   # Paste the auth.json content
   ```

## Solution 4: Network Mode Host (Linux Only)

For Linux users, you can use host networking:

```yaml
# In docker-compose.yml
services:
  claude-swarm:
    network_mode: host
```

This allows the OAuth callback to work properly.

## Recommended Approach for Claude Swarm

For the swarm use case, we should modify our approach to use direct API calls instead of the Claude CLI:

### Create a Python wrapper `claude-api.py`:

```python
#!/usr/bin/env python3
import os
import anthropic
from anthropic import Anthropic

# Initialize with API key
client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

def send_message(prompt, model="claude-3-5-sonnet-20241022"):
    try:
        message = client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
        print(send_message(prompt))
    else:
        print("Usage: claude-api.py <prompt>")
```

## Quick Fix Script

Create `fix-claude-auth.sh` in the claude-swarm-docker directory:

```bash
#!/bin/bash

echo "Fixing Claude authentication in container..."

# Method 1: Use API key directly
docker exec -it claude-swarm bash -c '
mkdir -p ~/.config/claude
cat > ~/.config/claude/config.json << EOF
{
  "api_key": "'${ANTHROPIC_API_KEY}'",
  "model": "claude-3-5-sonnet-20241022"
}
EOF
echo "Claude configured with API key"
'

# Method 2: Install Python Anthropic SDK
docker exec -it claude-swarm bash -c '
pip3 install anthropic
echo "Anthropic Python SDK installed"
'

echo "Authentication fix complete!"
echo "You can now use Claude via:"
echo "1. Python scripts with the Anthropic SDK"
echo "2. Direct API calls with your key"
```

Run this script:
```bash
chmod +x fix-claude-auth.sh
./fix-claude-auth.sh
```

## Testing the Fix

After applying the fix, test it:

```bash
# Inside container
python3 -c "
import anthropic
client = anthropic.Anthropic()
msg = client.messages.create(
    model='claude-3-5-sonnet-20241022',
    max_tokens=100,
    messages=[{'role': 'user', 'content': 'Say hello!'}]
)
print(msg.content[0].text)
"
```

If this works, you have successfully configured Claude access!

## Best Practice for Swarm

Instead of relying on the Claude CLI, use the Anthropic SDK directly in your swarm agents. This provides:
- Better error handling
- No authentication issues
- Direct API access
- Programmatic control

The swarm scripts should be updated to use the Python SDK instead of the CLI for reliability.