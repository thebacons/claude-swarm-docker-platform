#!/bin/bash

echo "=== Starting CASPER (Claude Agent Swarm Platform) ==="
echo ""

# Check if containers are running
if ! docker ps | grep -q "claude-policeman"; then
    echo "⚠️  CASPER containers are not running!"
    echo ""
    echo "Starting containers..."
    docker-compose -f docker-compose.enhanced.yml up -d
    
    echo ""
    echo "Waiting for services to initialize..."
    sleep 10
fi

echo "✅ CASPER containers are running"
echo ""
echo "=== How to Use CASPER ==="
echo ""
echo "You have several options to interact with CASPER:"
echo ""
echo "1. 🖥️  Interactive CLI (Recommended for first-time users):"
echo "   docker exec -it claude-policeman python3 /workspace/scripts/casper-cli.py"
echo ""
echo "2. 🔧 Direct Container Access:"
echo "   docker exec -it claude-policeman /bin/bash"
echo ""
echo "3. 🌐 SSH Access (for PuTTY users):"
echo "   ./start-ssh-container.sh"
echo "   Then connect to localhost:2222 with PuTTY"
echo ""
echo "4. 📊 View Logs:"
echo "   docker-compose -f docker-compose.enhanced.yml logs -f policeman"
echo ""
echo "=== Example Prompts ==="
echo ""
echo "Once connected, try these example prompts:"
echo ""
echo '• "Create a React todo app with local storage"'
echo '• "Build a REST API with authentication"'
echo '• "Refactor this JavaScript code to TypeScript using parallel processing"'
echo '• "Generate comprehensive tests for my application"'
echo ""
echo "=== Quick Start ==="
echo ""
echo "To start the interactive CLI now, run:"
echo "docker exec -it claude-policeman python3 /workspace/scripts/casper-cli.py"
echo ""

# Ask if user wants to start CLI directly
read -p "Would you like to start the CASPER CLI now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting CASPER CLI..."
    echo ""
    docker exec -it claude-policeman python3 /workspace/scripts/casper-cli.py
fi