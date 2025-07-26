#!/bin/bash

echo "=== Building CASPER Golden Image with Claude Code ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Claude Code is installed on host
if ! command -v claude &> /dev/null; then
    echo -e "${RED}❌ Claude Code not found on host system!${NC}"
    echo "Please install Claude Code first before building the golden image."
    exit 1
fi

echo -e "${GREEN}✅ Claude Code found on host${NC}"
claude --version 2>/dev/null || echo "Version info not available"

# Method 1: Create golden image from running container
echo ""
echo "Choose build method:"
echo "1. Snapshot method (copy from your current installation)"
echo "2. Manual method (you'll install Claude Code in container)"
echo ""
read -p "Enter choice (1-2): " method

if [ "$method" = "1" ]; then
    echo ""
    echo -e "${YELLOW}=== Snapshot Method ===${NC}"
    echo "This will copy Claude Code from your current system"
    echo ""
    
    # Find Claude Code binary
    CLAUDE_BIN=$(which claude)
    echo "Found Claude binary at: $CLAUDE_BIN"
    
    # Find Claude config directories
    CLAUDE_HOME="${HOME}/.claude"
    CLAUDE_CONFIG="${HOME}/.config/claude-code"
    
    if [ ! -d "$CLAUDE_HOME" ]; then
        echo -e "${RED}Warning: ~/.claude directory not found${NC}"
    fi
    
    if [ ! -d "$CLAUDE_CONFIG" ]; then
        echo -e "${RED}Warning: ~/.config/claude-code directory not found${NC}"
    fi
    
    # Create temporary build context
    BUILD_DIR="/tmp/casper-golden-build-$$"
    mkdir -p "$BUILD_DIR"
    
    echo "Creating build context in $BUILD_DIR..."
    
    # Copy Dockerfile
    cp Dockerfile.golden "$BUILD_DIR/"
    
    # Copy Claude Code binary
    if [ -f "$CLAUDE_BIN" ]; then
        mkdir -p "$BUILD_DIR/claude-bin"
        cp "$CLAUDE_BIN" "$BUILD_DIR/claude-bin/claude"
        chmod +x "$BUILD_DIR/claude-bin/claude"
    fi
    
    # Copy Claude configurations
    if [ -d "$CLAUDE_HOME" ]; then
        cp -r "$CLAUDE_HOME" "$BUILD_DIR/claude-home"
    fi
    
    if [ -d "$CLAUDE_CONFIG" ]; then
        cp -r "$CLAUDE_CONFIG" "$BUILD_DIR/claude-config"
    fi
    
    # Copy hooks and scripts
    cp -r hooks "$BUILD_DIR/"
    cp swarm-orchestrator.py "$BUILD_DIR/"
    cp demo-swarm.py "$BUILD_DIR/"
    cp swarm-config.yaml "$BUILD_DIR/" 2>/dev/null || cp configs/basic-swarm.yml "$BUILD_DIR/swarm-config.yaml"
    
    # Create modified Dockerfile for snapshot method
    cat > "$BUILD_DIR/Dockerfile" << 'EOF'
# Claude Code Golden Image - Snapshot Method
FROM ubuntu:22.04

# Build arguments
ARG NODE_VERSION="20"
ARG PYTHON_VERSION="3.11"

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl git wget sudo build-essential software-properties-common \
    ca-certificates gnupg lsb-release jq unzip vim nano htop \
    net-tools iputils-ping && rm -rf /var/lib/apt/lists/*

# Add Python PPA and install Python 3.11
RUN add-apt-repository ppa:deadsnakes/ppa -y && \
    apt-get update && \
    apt-get install -y \
    python${PYTHON_VERSION} python${PYTHON_VERSION}-venv \
    python${PYTHON_VERSION}-dev python${PYTHON_VERSION}-distutils && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1 && \
    update-alternatives --install /usr/bin/python python /usr/bin/python${PYTHON_VERSION} 1

# Install pip
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python${PYTHON_VERSION}

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install -y nodejs && npm install -g npm@latest

# Create claude user
RUN useradd -m -s /bin/bash claude && \
    echo "claude ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set up directory structure
WORKDIR /home/claude
RUN mkdir -p .claude .claude-code .config/claude-code .cache .local/bin \
    workspace/projects workspace/hooks workspace/scripts workspace/configs \
    && chown -R claude:claude /home/claude

# Switch to claude user
USER claude

# Install Python packages
RUN pip3 install --user anthropic requests pyyaml python-dotenv \
    redis psycopg2-binary aiofiles asyncio rich click

# Copy Claude Code binary
COPY --chown=claude:claude claude-bin/claude /home/claude/.local/bin/claude
RUN chmod +x /home/claude/.local/bin/claude

# Copy Claude configurations (if they exist)
COPY --chown=claude:claude claude-home/ /home/claude/.claude/
COPY --chown=claude:claude claude-config/ /home/claude/.config/claude-code/

# Copy hooks and scripts
COPY --chown=claude:claude hooks/ /home/claude/workspace/hooks/
COPY --chown=claude:claude *.py /home/claude/workspace/scripts/
COPY --chown=claude:claude swarm-config.yaml /home/claude/workspace/scripts/

# Environment
ENV PATH="/home/claude/.local/bin:${PATH}"
ENV CLAUDE_HOME="/home/claude/.claude"

# Create startup script
COPY --chown=claude:claude <<'STARTUP' /home/claude/startup.sh
#!/bin/bash
echo "=== CASPER Golden Image (Claude Code Pre-installed) ==="
if [ -f /home/claude/workspace/.env ]; then
    set -a; source /home/claude/workspace/.env; set +a
fi
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"
if command -v claude &> /dev/null; then
    echo "✅ Claude Code is ready!"
    echo "Run: claude 'your prompt here'"
else
    echo "❌ Claude Code not found!"
fi
cd /home/claude/workspace
exec "$@"
STARTUP

RUN chmod +x /home/claude/startup.sh

ENTRYPOINT ["/home/claude/startup.sh"]
CMD ["/bin/bash"]
EOF
    
    # Build the image
    echo ""
    echo -e "${YELLOW}Building golden image...${NC}"
    cd "$BUILD_DIR"
    docker build -t casper-golden:latest .
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Golden image built successfully!${NC}"
        echo ""
        echo "To test the image:"
        echo "  docker run -it --rm -e ANTHROPIC_API_KEY=\$ANTHROPIC_API_KEY casper-golden:latest"
        echo ""
        echo "To use in docker-compose, update the image reference:"
        echo "  image: casper-golden:latest"
    else
        echo -e "${RED}❌ Build failed!${NC}"
    fi
    
    # Cleanup
    rm -rf "$BUILD_DIR"
    
elif [ "$method" = "2" ]; then
    echo ""
    echo -e "${YELLOW}=== Manual Method ===${NC}"
    echo ""
    echo "Steps:"
    echo "1. Start a temporary container:"
    echo "   docker run -it --name claude-temp ubuntu:22.04 /bin/bash"
    echo ""
    echo "2. Inside the container, install Claude Code manually"
    echo ""
    echo "3. From another terminal, commit the container:"
    echo "   docker commit claude-temp casper-golden:latest"
    echo ""
    echo "4. Remove temporary container:"
    echo "   docker rm claude-temp"
fi