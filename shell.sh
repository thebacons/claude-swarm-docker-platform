#!/bin/bash

# Claude Swarm Container Shell Access Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Accessing Claude Swarm container shell...${NC}"

# Check if container is running
if ! docker-compose ps | grep -q "claude-swarm-spawn.*Up"; then
    echo -e "${YELLOW}Container not running. Starting services...${NC}"
    docker-compose up -d
    sleep 5
fi

# Access container shell as developer user
echo -e "${GREEN}Entering container as 'developer' user${NC}"
echo -e "${YELLOW}Tip: Run 'claude' to authenticate with your API key${NC}"
echo ""

docker-compose exec -u developer claude-swarm /bin/bash