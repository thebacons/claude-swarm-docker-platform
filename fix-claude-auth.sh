#!/bin/bash

echo "=== Fixing Claude Code Authentication ==="
echo ""

# Option 1: Copy credentials from host to containers
copy_credentials() {
    echo "Option 1: Copying credentials from host..."
    
    # Copy the credentials file to each container
    for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
        echo "Copying to $container..."
        docker cp ~/.claude/.credentials.json $container:/home/claude/.claude/.credentials.json
        docker exec $container chown claude:claude /home/claude/.claude/.credentials.json
        docker exec $container chmod 600 /home/claude/.claude/.credentials.json
    done
    
    echo "✅ Credentials copied to all containers"
}

# Option 2: Use API key authentication
setup_api_key() {
    echo "Option 2: Using API key authentication..."
    
    # Create a script to auto-select API key option
    for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
        echo "Setting up $container..."
        
        # This will:
        # 1. Select "1" for dark theme
        # 2. Select "2" for API key
        # 3. Use the ANTHROPIC_API_KEY from environment
        docker exec $container bash -c 'echo -e "1\n2\n" | claude "test" 2>&1 > /dev/null || true'
    done
    
    echo "✅ API key authentication configured"
}

# Option 3: Manual setup instructions
manual_setup() {
    echo "Option 3: Manual Setup Instructions"
    echo ""
    echo "When you SSH into a container and run claude:"
    echo "1. Press 1 for dark theme"
    echo "2. Press 1 for Claude subscription (if you have one)"
    echo "   OR"
    echo "   Press 2 for API key (uses ANTHROPIC_API_KEY from environment)"
    echo ""
    echo "This is a one-time setup per container."
}

echo "Choose authentication method:"
echo "1. Copy credentials from host (uses your Claude subscription)"
echo "2. Use API key (uses ANTHROPIC_API_KEY environment variable)"
echo "3. Show manual setup instructions"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        copy_credentials
        ;;
    2)
        setup_api_key
        ;;
    3)
        manual_setup
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "=== Testing Claude ==="
docker exec casper-policeman claude "Say hello" 2>&1 | head -5 || echo "You may need to complete setup manually"