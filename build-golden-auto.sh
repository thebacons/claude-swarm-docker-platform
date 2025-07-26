#!/bin/bash

echo "=== Automated CASPER Golden Image Build ==="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Find Claude Code binary
CLAUDE_BIN=$(which claude)
if [ ! -f "$CLAUDE_BIN" ]; then
    echo -e "${RED}❌ Claude Code not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found Claude Code at: $CLAUDE_BIN${NC}"

# Create build directory
BUILD_DIR="/tmp/casper-golden-build-$$"
mkdir -p "$BUILD_DIR"

echo "Creating build context..."

# Create the Dockerfile
cat > "$BUILD_DIR/Dockerfile" << 'EOF'
# CASPER Golden Image with Claude Code
FROM ubuntu:22.04

ARG NODE_VERSION="20"
ARG PYTHON_VERSION="3.11"
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl git wget sudo build-essential software-properties-common \
    ca-certificates gnupg lsb-release jq unzip vim nano htop \
    net-tools iputils-ping openssh-client && rm -rf /var/lib/apt/lists/*

# Add Python PPA and install Python
RUN add-apt-repository ppa:deadsnakes/ppa -y && \
    apt-get update && \
    apt-get install -y \
    python${PYTHON_VERSION} python${PYTHON_VERSION}-venv \
    python${PYTHON_VERSION}-dev python${PYTHON_VERSION}-distutils && \
    rm -rf /var/lib/apt/lists/*

# Set Python as default
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

# Set up directories
WORKDIR /home/claude
RUN mkdir -p .claude .config/claude-code .cache .local/bin \
    workspace/projects workspace/hooks workspace/scripts workspace/configs \
    && chown -R claude:claude /home/claude

USER claude

# Install Python packages
RUN pip3 install --user anthropic requests pyyaml python-dotenv \
    redis psycopg2-binary aiofiles asyncio rich click

# Copy Claude Code binary
COPY --chown=claude:claude claude /home/claude/.local/bin/claude
RUN chmod +x /home/claude/.local/bin/claude

# Copy Claude configurations
COPY --chown=claude:claude claude-home/ /home/claude/.claude/
COPY --chown=claude:claude claude-config/ /home/claude/.config/claude-code/

# Copy hooks and scripts
COPY --chown=claude:claude hooks/ /home/claude/workspace/hooks/
COPY --chown=claude:claude swarm-orchestrator.py /home/claude/workspace/scripts/
COPY --chown=claude:claude demo-swarm.py /home/claude/workspace/scripts/
COPY --chown=claude:claude swarm-config.yaml /home/claude/workspace/scripts/

# Environment
ENV PATH="/home/claude/.local/bin:${PATH}"
ENV CLAUDE_HOME="/home/claude/.claude"

# Create startup script
RUN cat > /home/claude/startup.sh << 'STARTUP'
#!/bin/bash
echo "=== CASPER Golden Image ==="
echo "Claude Code Pre-installed Edition"
echo ""

# Load environment
if [ -f /home/claude/workspace/.env ]; then
    set -a
    source /home/claude/workspace/.env
    set +a
fi

# Export API keys
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"
export GITHUB_PAT_KEY="${GITHUB_PAT_KEY}"
export GITHUB_USERNAME="${GITHUB_USERNAME}"
export LINEAR_API_KEY="${LINEAR_API_KEY}"
export AGENT_ROLE="${AGENT_ROLE:-orchestrator}"

# Verify Claude Code
if command -v claude &> /dev/null; then
    echo "✅ Claude Code version: $(claude --version 2>&1 | head -1)"
else
    echo "❌ Claude Code not found!"
fi

# Check MCP server config
if [ -f /home/claude/.config/claude-code/mcp-servers.json ]; then
    echo "✅ MCP servers configured"
fi

# Agent-specific messages
case "$AGENT_ROLE" in
    "orchestrator"|"policeman")
        echo ""
        echo "👮 Policeman Orchestrator Ready"
        echo "- Can spawn up to 15 parallel agents"
        echo "- Proven 3.7x performance improvement"
        echo "- Full hook validation active"
        ;;
    "developer")
        echo ""
        echo "💻 Developer Agent Ready"
        echo "Specialization: ${AGENT_SPECIALIZATION:-general}"
        ;;
    "tester")
        echo ""
        echo "🧪 Tester Agent Ready"
        ;;
esac

cd /home/claude/workspace
exec "$@"
STARTUP

RUN chmod +x /home/claude/startup.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD claude --version || exit 1

ENTRYPOINT ["/home/claude/startup.sh"]
CMD ["/bin/bash"]
EOF

# Copy Claude binary
echo "Copying Claude Code binary..."
cp "$CLAUDE_BIN" "$BUILD_DIR/claude"
chmod +x "$BUILD_DIR/claude"

# Copy Claude configurations
echo "Copying Claude configurations..."
cp -r ~/.claude "$BUILD_DIR/claude-home" 2>/dev/null || mkdir -p "$BUILD_DIR/claude-home"
cp -r ~/.config/claude-code "$BUILD_DIR/claude-config" 2>/dev/null || mkdir -p "$BUILD_DIR/claude-config"

# Remove sensitive files
rm -f "$BUILD_DIR/claude-home/.credentials.json" 2>/dev/null

# Copy project files
echo "Copying project files..."
cp -r hooks "$BUILD_DIR/"
cp swarm-orchestrator.py "$BUILD_DIR/"
cp demo-swarm.py "$BUILD_DIR/"
cp swarm-config.yaml "$BUILD_DIR/" 2>/dev/null || echo "name: basic" > "$BUILD_DIR/swarm-config.yaml"

# Build the image
echo ""
echo -e "${YELLOW}Building Docker image...${NC}"
cd "$BUILD_DIR"
docker build -t casper-golden:latest . --progress=plain

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Golden image built successfully!${NC}"
    echo ""
    echo "Image name: casper-golden:latest"
    echo ""
    echo "To start CASPER with the golden image:"
    echo "  docker-compose -f docker-compose.golden.yml up -d"
    echo ""
    echo "To test a single container:"
    echo "  docker run -it --rm -e ANTHROPIC_API_KEY=\$ANTHROPIC_API_KEY casper-golden:latest"
else
    echo -e "${RED}❌ Build failed!${NC}"
fi

# Cleanup
rm -rf "$BUILD_DIR"