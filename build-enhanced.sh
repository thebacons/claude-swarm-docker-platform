#!/bin/bash

# Build and Start Enhanced Claude Swarm Platform

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Building Enhanced Claude Swarm Platform ===${NC}"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo -e "${YELLOW}Creating .env template...${NC}"
    cat > .env << 'EOF'
# Anthropic API Configuration
ANTHROPIC_API_KEY=your-api-key-here

# Optional: Linear API for task management
LINEAR_API_KEY=

# Optional: GitHub PAT for repository operations
GITHUB_PAT_KEY=

# Container Configuration
AUTO_UPDATE_CLAUDE=false

# Database Configuration
POSTGRES_USER=claude
POSTGRES_PASSWORD=claude_secure_password
POSTGRES_DB=claude_orchestration
EOF
    echo -e "${GREEN}.env template created. Please add your API key.${NC}"
    exit 1
fi

# Source the .env file
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "your-api-key-here" ]; then
    echo -e "${RED}Error: Please set ANTHROPIC_API_KEY in .env file${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p logs/{policeman,developer-1,developer-2,tester}
mkdir -p dashboard/dist
mkdir -p scripts

# Create placeholder dashboard files
if [ ! -f dashboard/dist/index.html ]; then
    echo -e "${YELLOW}Creating placeholder dashboard...${NC}"
    cat > dashboard/dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Claude Swarm Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Claude Swarm Dashboard</h1>
        <p>Real-time monitoring dashboard coming soon!</p>
        <p>Check Linear task BAC-147 for implementation status.</p>
    </div>
</body>
</html>
EOF
fi

if [ ! -f dashboard/nginx.conf ]; then
    cat > dashboard/nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
fi

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker-compose.enhanced.yml down

# Build the enhanced image
echo -e "${YELLOW}Building enhanced Docker image...${NC}"
docker-compose -f docker-compose.enhanced.yml build

# Start the services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose -f docker-compose.enhanced.yml up -d

# Wait for services to start
echo -e "${YELLOW}Waiting for services to initialize...${NC}"
sleep 10

# Check service status
echo ""
echo -e "${GREEN}=== Service Status ===${NC}"
docker-compose -f docker-compose.enhanced.yml ps

# Run health checks
echo ""
echo -e "${GREEN}=== Running Health Checks ===${NC}"

# Check Policeman
echo -e "${BLUE}Policeman Agent:${NC}"
docker exec claude-policeman /workspace/scripts/health-check.sh 2>/dev/null || echo -e "${YELLOW}Waiting for initialization...${NC}"

# Check Redis
echo ""
echo -e "${BLUE}Redis:${NC}"
docker exec claude-redis redis-cli ping && echo -e "${GREEN}✓ Redis is running${NC}" || echo -e "${RED}✗ Redis error${NC}"

# Check PostgreSQL
echo ""
echo -e "${BLUE}PostgreSQL:${NC}"
docker exec claude-postgres pg_isready -U claude && echo -e "${GREEN}✓ PostgreSQL is running${NC}" || echo -e "${RED}✗ PostgreSQL error${NC}"

# Display access information
echo ""
echo -e "${GREEN}=== Access Information ===${NC}"
echo -e "Dashboard: ${BLUE}http://localhost:3000${NC}"
echo -e "Policeman Shell: ${BLUE}docker exec -it claude-policeman /bin/bash${NC}"
echo -e "Developer-1 Shell: ${BLUE}docker exec -it claude-developer-1 /bin/bash${NC}"
echo -e "Redis CLI: ${BLUE}docker exec -it claude-redis redis-cli${NC}"
echo -e "PostgreSQL: ${BLUE}docker exec -it claude-postgres psql -U claude -d claude_orchestration${NC}"

echo ""
echo -e "${GREEN}=== Next Steps ===${NC}"
echo "1. Enter Policeman container: docker exec -it claude-policeman /bin/bash"
echo "2. Run version check: check-version"
echo "3. Test Claude connection: claude-test"
echo "4. Start orchestration tasks!"

echo ""
echo -e "${YELLOW}Logs are available in ./logs/<agent-name>/${NC}"
echo -e "${YELLOW}View all logs: docker-compose -f docker-compose.enhanced.yml logs -f${NC}"