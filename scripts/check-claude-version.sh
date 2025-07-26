#!/bin/bash

echo "=== Claude Code Version Check ==="
echo ""

# Check if Claude Code is installed
if command -v claude 2>&1 >/dev/null; then
    echo "Claude Code version:"
    claude --version 2>/dev/null || echo "Version command not available"
else
    echo "Claude Code: Not installed"
    echo "Using Claude SDK wrapper instead"
fi

echo ""
echo "Python version:"
python3 --version

echo ""
echo "Node.js version:"
node --version

echo ""
echo "Anthropic SDK version:"
pip show anthropic | grep Version || echo "Not installed"

echo ""
echo "Swarm dependencies:"
pip show pyyaml | grep Version || echo "PyYAML: Not installed"
pip show redis | grep Version || echo "Redis: Not installed"
pip show psycopg2-binary | grep Version || echo "PostgreSQL: Not installed"

echo ""
echo "=== Environment ==="
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:+[SET]}"
echo "CLAUDE_HOME: $CLAUDE_HOME"
echo "AGENT_ROLE: ${AGENT_ROLE:-not set}"
echo "AGENT_ID: ${AGENT_ID:-not set}"
echo ""