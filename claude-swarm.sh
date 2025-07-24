#!/bin/bash

# Claude Swarm Launcher Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <swarm-config.yml> [vibe]${NC}"
    echo -e "Options:"
    echo -e "  vibe - Enable autonomous mode (YOLO)"
    exit 1
fi

CONFIG_FILE=$1
VIBE_MODE=${2:-""}

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Config file not found: $CONFIG_FILE${NC}"
    exit 1
fi

# Parse YAML to get swarm details (using simple grep for now)
SWARM_NAME=$(grep "name:" "$CONFIG_FILE" | head -1 | cut -d'"' -f2)
MAIN_INSTANCE=$(grep "main:" "$CONFIG_FILE" | head -1 | awk '{print $2}')

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        Claude Swarm Orchestrator v1.0             ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Loading swarm: $SWARM_NAME${NC}"
echo -e "${BLUE}Main instance: $MAIN_INSTANCE${NC}"

if [ "$VIBE_MODE" == "vibe" ]; then
    echo -e "${YELLOW}⚡ VIBE MODE ENABLED - Autonomous operations active!${NC}"
fi

echo ""

# Create session directory
SESSION_ID=$(date +%Y%m%d_%H%M%S)_$(openssl rand -hex 4)
SESSION_DIR="sessions/$SESSION_ID"
mkdir -p "$SESSION_DIR"

# Copy config to session
cp "$CONFIG_FILE" "$SESSION_DIR/swarm-config.yml"

# Log session start
cat > "$SESSION_DIR/session.log" << EOF
Session ID: $SESSION_ID
Started: $(date)
Swarm: $SWARM_NAME
Config: $CONFIG_FILE
Vibe Mode: ${VIBE_MODE:-disabled}
---
EOF

echo -e "${GREEN}Session created: $SESSION_ID${NC}"
echo ""

# Function to start an instance
start_instance() {
    local instance_name=$1
    local instance_dir=$2
    local instance_model=$3
    local instance_vibe=$4
    local instance_tools=$5
    
    echo -e "${BLUE}Starting instance: $instance_name${NC}"
    echo -e "  Directory: $instance_dir"
    echo -e "  Model: $instance_model"
    echo -e "  Tools: $instance_tools"
    
    # Create instance session
    local instance_session="$SESSION_DIR/$instance_name"
    mkdir -p "$instance_session"
    
    # Generate instance launch script
    cat > "$instance_session/launch.sh" << EOF
#!/bin/bash
cd "$instance_dir"
export CLAUDE_SESSION_ID="$SESSION_ID"
export CLAUDE_INSTANCE_NAME="$instance_name"
export ANTHROPIC_API_KEY="\${ANTHROPIC_API_KEY}"

# Launch Claude with appropriate settings
if [ "$instance_vibe" == "true" ] || [ "$VIBE_MODE" == "vibe" ]; then
    echo "🚀 Launching in VIBE mode..."
    claude --dangerously-skip-permissions --model $instance_model
else
    echo "🛡️ Launching in safe mode..."
    claude --model $instance_model
fi
EOF
    
    chmod +x "$instance_session/launch.sh"
    
    # In a real implementation, this would spawn separate processes
    # For now, we'll prepare the launch commands
    echo -e "${GREEN}✓ Instance $instance_name ready${NC}"
    echo -e "  Launch: $instance_session/launch.sh"
    echo ""
}

# Parse instances from config (simplified parsing)
echo -e "${CYAN}Preparing swarm instances...${NC}"
echo ""

# Extract instance configurations
# In a real implementation, we'd use a proper YAML parser
# For now, using a simplified approach

# Start main instance first
echo -e "${YELLOW}=== Main Instance ===${NC}"
start_instance "$MAIN_INSTANCE" "." "opus" "false" "all"

# Parse other instances
echo -e "${YELLOW}=== Connected Instances ===${NC}"
# This would parse the YAML properly in production
# For demo purposes, showing the pattern
if grep -q "frontend_dev:" "$CONFIG_FILE"; then
    start_instance "frontend_dev" "./frontend" "sonnet" "false" "Read,Edit,Write,Bash"
fi
if grep -q "backend_dev:" "$CONFIG_FILE"; then
    start_instance "backend_dev" "./backend" "sonnet" "false" "Read,Edit,Write,Bash"
fi
if grep -q "speed_coder:" "$CONFIG_FILE"; then
    start_instance "speed_coder" "./sandbox" "sonnet" "true" "Read,Edit,Write,Bash"
fi

# Create orchestration script
cat > "$SESSION_DIR/orchestrate.sh" << EOF
#!/bin/bash
# Claude Swarm Orchestration Controller

echo "Claude Swarm Controller - Session $SESSION_ID"
echo "Commands:"
echo "  status - Show instance status"
echo "  logs - View session logs"
echo "  stop - Stop all instances"
echo ""

while true; do
    read -p "swarm> " cmd
    case \$cmd in
        status)
            echo "Active instances in session $SESSION_ID:"
            ls -la "$SESSION_DIR"/*/launch.sh 2>/dev/null | grep -v orchestrate
            ;;
        logs)
            tail -f "$SESSION_DIR/session.log"
            ;;
        stop)
            echo "Stopping swarm..."
            # Would kill instance processes here
            exit 0
            ;;
        *)
            echo "Unknown command: \$cmd"
            ;;
    esac
done
EOF

chmod +x "$SESSION_DIR/orchestrate.sh"

# Final instructions
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Swarm initialized successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}To start working:${NC}"
echo -e "1. Launch main instance:"
echo -e "   ${YELLOW}$SESSION_DIR/$MAIN_INSTANCE/launch.sh${NC}"
echo ""
echo -e "2. Monitor swarm:"
echo -e "   ${YELLOW}$SESSION_DIR/orchestrate.sh${NC}"
echo ""
echo -e "${BLUE}Session directory: $SESSION_DIR${NC}"
echo ""

if [ "$VIBE_MODE" == "vibe" ]; then
    echo -e "${RED}⚠️  VIBE MODE WARNING ⚠️${NC}"
    echo -e "${RED}Agents will operate autonomously!${NC}"
    echo -e "${RED}Monitor closely and backup your work!${NC}"
fi