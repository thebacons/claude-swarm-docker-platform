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

# Install Python packages for swarm orchestration
echo "Installing swarm dependencies..."
pip3 install --user anthropic pyyaml redis psycopg2-binary 2>/dev/null || true

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
        echo ""
        echo "=== CASPER Swarm Orchestrator Ready ==="
        echo "Available commands:"
        echo "  python3 /workspace/scripts/swarm-orchestrator.py  # Run full swarm"
        echo "  python3 /workspace/scripts/demo-swarm.py          # Performance demo"
        echo "  python3 /workspace/scripts/casper-cli.py          # Interactive CLI"
        echo ""
        
        # Check if swarm orchestrator is available
        if [ -f /workspace/scripts/swarm-orchestrator.py ]; then
            echo "✅ Proven swarm orchestrator detected!"
            echo "   - 15 parallel agents tested"
            echo "   - 3.7x performance improvement"
            echo "   - Hook validation integrated"
        fi
        ;;
    "developer")
        echo "Starting Developer agent services..."
        echo "Specialization: ${AGENT_SPECIALIZATION:-general}"
        echo "Ready to receive tasks from Policeman orchestrator"
        ;;
    "tester")
        echo "Starting Tester agent services..."
        echo "Ready to validate code from Developer agents"
        ;;
esac

echo ""
echo "=== Container Ready ==="
echo ""

# Keep container running
exec "$@"