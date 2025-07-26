#!/bin/bash

echo "=== Setting up SSH access for all CASPER containers ==="
echo ""

# Set password and install SSH for all containers
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    echo "📦 Setting up SSH in $container..."
    
    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        docker exec $container bash -c '
            # Set password for claude user
            echo "claude:claude" | sudo chpasswd
            
            # Update package list quietly
            sudo apt-get update -qq > /dev/null 2>&1
            
            # Install OpenSSH server
            sudo apt-get install -y openssh-server -qq > /dev/null 2>&1
            
            # Configure SSH to allow password authentication
            sudo sed -i "s/#PasswordAuthentication yes/PasswordAuthentication yes/" /etc/ssh/sshd_config
            sudo sed -i "s/PasswordAuthentication no/PasswordAuthentication yes/" /etc/ssh/sshd_config
            
            # Start SSH service
            sudo service ssh start > /dev/null 2>&1
            
            # Check if SSH is running
            if sudo service ssh status > /dev/null 2>&1; then
                echo "✅ SSH enabled successfully"
            else
                echo "❌ Failed to start SSH"
            fi
        '
    else
        echo "⚠️  Container $container is not running. Skipping..."
    fi
    echo ""
done

echo "=== SSH Setup Complete ==="
echo ""
echo "📋 Connection Details:"
echo "-------------------"
echo "Username: claude"
echo "Password: claude"
echo ""
echo "🔌 Port Mappings (after updating docker-compose.golden.yml):"
echo "  casper-policeman  -> localhost:2222"
echo "  casper-developer-1 -> localhost:2223"
echo "  casper-developer-2 -> localhost:2224"
echo "  casper-tester     -> localhost:2225"
echo ""
echo "💡 To connect with PuTTY:"
echo "  1. Host: localhost"
echo "  2. Port: (see above)"
echo "  3. Username: claude"
echo "  4. Password: claude"
echo ""
echo "🚀 Quick test command:"
echo "  ssh claude@localhost -p 2222"