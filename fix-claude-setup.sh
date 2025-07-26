#!/bin/bash

echo "=== Fixing Claude Code First-Run Setup ==="
echo ""

# Create Claude config to skip setup
create_claude_config() {
    local container=$1
    echo "Configuring $container..."
    
    docker exec $container bash -c '
        # Create config directory
        mkdir -p /home/claude/.config/claude-code
        
        # Create settings to skip first-run setup
        cat > /home/claude/.config/claude-code/settings.json << EOF
{
  "theme": "dark",
  "firstRun": false,
  "telemetry": false
}
EOF
        
        # Set proper ownership
        chown -R claude:claude /home/claude/.config/claude-code
        
        echo "✓ Config created for '$container'"
    '
}

# Apply to all containers
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    create_claude_config $container
done

echo ""
echo "=== Testing Claude Code (should skip setup now) ==="
docker exec casper-policeman bash -c 'claude "Who are you and what is your role?"' 2>&1 | head -10

echo ""
echo "✅ Setup fixed! Claude Code will no longer ask for theme selection."