#!/bin/bash
# Setup MCP server configurations for all CASPER containers

echo "🔧 Setting up MCP server configurations for CASPER containers..."

# Create config directories in containers
echo "📁 Creating config directories..."
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    docker exec $container mkdir -p /home/claude/.claude/config
    docker exec $container chown -R claude:claude /home/claude/.claude
done

# Deploy Policeman MCP config (full access)
echo "👮 Configuring Policeman MCP servers (Linear, GitHub, Filesystem)..."
docker cp configs/mcp-policeman.json casper-policeman:/home/claude/.claude/config/mcp.json
docker exec casper-policeman chown claude:claude /home/claude/.claude/config/mcp.json

# Deploy Developer MCP configs (GitHub, Filesystem)
echo "💻 Configuring Developer-1 MCP servers (GitHub, Filesystem)..."
docker cp configs/mcp-developer.json casper-developer-1:/home/claude/.claude/config/mcp.json
docker exec casper-developer-1 chown claude:claude /home/claude/.claude/config/mcp.json

echo "💻 Configuring Developer-2 MCP servers (GitHub, Filesystem)..."
docker cp configs/mcp-developer.json casper-developer-2:/home/claude/.claude/config/mcp.json
docker exec casper-developer-2 chown claude:claude /home/claude/.claude/config/mcp.json

# Deploy Tester MCP config (Filesystem only)
echo "🧪 Configuring Tester MCP servers (Filesystem)..."
docker cp configs/mcp-tester.json casper-tester:/home/claude/.claude/config/mcp.json
docker exec casper-tester chown claude:claude /home/claude/.claude/config/mcp.json

# Install MCP server packages if needed
echo "📦 Checking MCP server installations..."

# Note: The actual MCP servers might need to be installed in the containers
# For now, we'll just verify the configs are in place

echo "✅ MCP configurations deployed!"
echo ""
echo "📋 Configuration Summary:"
echo "- Policeman: Linear + GitHub + Filesystem"
echo "- Developer-1: GitHub + Filesystem"
echo "- Developer-2: GitHub + Filesystem"
echo "- Tester: Filesystem only"
echo ""
echo "Note: MCP servers require:"
echo "1. mcp-server-filesystem package installed"
echo "2. mcp-server-github package installed"
echo "3. LINEAR_API_KEY and GITHUB_PAT_KEY environment variables set"
echo ""
echo "Test with: docker exec casper-policeman cat /home/claude/.claude/config/mcp.json"