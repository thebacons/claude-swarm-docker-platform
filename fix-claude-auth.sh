#!/bin/bash

# Claude Authentication Fix Script for Docker Container

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Claude Authentication Fix for Docker ===${NC}"
echo ""

# Check if container is running
if ! docker-compose ps | grep -q "claude-swarm.*Up"; then
    echo -e "${RED}Error: Container not running!${NC}"
    echo -e "${YELLOW}Starting container...${NC}"
    docker-compose up -d
    sleep 5
fi

# Get API key from .env
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    exit 1
fi

# Source the .env file
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}Error: ANTHROPIC_API_KEY not found in .env!${NC}"
    exit 1
fi

echo -e "${GREEN}Found API key in .env${NC}"
echo ""

# Method 1: Install Python Anthropic SDK
echo -e "${YELLOW}Installing Anthropic Python SDK...${NC}"
docker exec claude-swarm bash -c '
pip3 install --user anthropic requests
' || echo -e "${RED}Failed to install Python SDK${NC}"

# Method 2: Create Python wrapper
echo -e "${YELLOW}Creating Claude API wrapper...${NC}"
docker exec claude-swarm bash -c '
cat > /workspace/claude-api.py << '\''EOF'\''
#!/usr/bin/env python3
import os
import sys
import json
from anthropic import Anthropic

# Initialize with API key
client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

def send_message(prompt, model="claude-3-5-sonnet-20241022", max_tokens=1024):
    """Send a message to Claude and return the response."""
    try:
        message = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text
    except Exception as e:
        return f"Error: {str(e)}"

def interactive_mode():
    """Run in interactive mode."""
    print("Claude API Interactive Mode (type '\''exit'\'' to quit)")
    print("-" * 50)
    
    while True:
        try:
            prompt = input("\nYou: ").strip()
            if prompt.lower() in ['\''exit'\'', '\''quit'\'', '\''q'\'']:
                break
            
            if prompt:
                print("\nClaude: ", end='\'''\'', flush=True)
                response = send_message(prompt)
                print(response)
        except KeyboardInterrupt:
            print("\n\nExiting...")
            break
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Command line mode
        prompt = " ".join(sys.argv[1:])
        print(send_message(prompt))
    else:
        # Interactive mode
        interactive_mode()
EOF

chmod +x /workspace/claude-api.py
'

# Method 3: Create a simple test script
echo -e "${YELLOW}Creating test script...${NC}"
docker exec claude-swarm bash -c '
cat > /workspace/test-claude.py << '\''EOF'\''
#!/usr/bin/env python3
import os
import sys

# Add parent directory to path
sys.path.insert(0, "/home/developer/.local/lib/python3.10/site-packages")

try:
    from anthropic import Anthropic
    
    client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    
    print("Testing Claude connection...")
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=100,
        messages=[{"role": "user", "content": "Say '\''Hello from Docker!'\'' and nothing else."}]
    )
    print("Success! Claude says:", response.content[0].text)
    
except Exception as e:
    print(f"Error: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure ANTHROPIC_API_KEY is set in .env")
    print("2. Check your API key is valid")
    print("3. Ensure you have internet connectivity")
EOF

chmod +x /workspace/test-claude.py
'

# Method 4: Create convenience aliases
echo -e "${YELLOW}Setting up convenience commands...${NC}"
docker exec claude-swarm bash -c '
cat >> ~/.bashrc << '\''EOF'\''

# Claude shortcuts
alias claude-test="python3 /workspace/test-claude.py"
alias claude-chat="python3 /workspace/claude-api.py"
alias claude-api="python3 /workspace/claude-api.py"

# Export API key if available
if [ -f /workspace/.env ]; then
    export $(cat /workspace/.env | grep -v "^#" | xargs)
fi
EOF
'

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo -e "${BLUE}To test Claude access:${NC}"
echo "1. Enter the container: ${YELLOW}./shell.sh${NC}"
echo "2. Run test: ${YELLOW}python3 /workspace/test-claude.py${NC}"
echo ""
echo -e "${BLUE}To use Claude interactively:${NC}"
echo "1. Enter the container: ${YELLOW}./shell.sh${NC}"
echo "2. Run: ${YELLOW}claude-chat${NC} or ${YELLOW}python3 /workspace/claude-api.py${NC}"
echo ""
echo -e "${BLUE}For one-off commands:${NC}"
echo "1. Enter the container: ${YELLOW}./shell.sh${NC}"
echo "2. Run: ${YELLOW}claude-api \"Your prompt here\"${NC}"
echo ""

# Run a quick test
echo -e "${YELLOW}Running quick test...${NC}"
docker exec claude-swarm bash -c '
export ANTHROPIC_API_KEY="'$ANTHROPIC_API_KEY'"
python3 /workspace/test-claude.py
'