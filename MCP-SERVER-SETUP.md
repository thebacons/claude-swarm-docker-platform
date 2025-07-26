# MCP Server Setup for CASPER Containers

## Overview

Each CASPER container has different MCP (Model Context Protocol) server access based on its role:

- **Policeman**: Full access (Linear, GitHub, Filesystem)
- **Developers**: Code access (GitHub, Filesystem)
- **Tester**: Basic access (Filesystem only)

## Quick Setup

```bash
# Run the setup script
./setup-mcp-servers.sh

# Verify configuration
docker exec casper-policeman cat /home/claude/.claude/config/mcp.json
```

## MCP Server Configurations

### Policeman (Orchestrator)
- **Linear**: Project management and task tracking
- **GitHub**: Repository management and code operations
- **Filesystem**: Full workspace access

### Developer Agents
- **GitHub**: Code commits, branches, PRs
- **Filesystem**: Project file access

### Tester Agent
- **Filesystem**: Test file access only

## Environment Variables Required

Make sure these are set in your `.env` file:
```bash
LINEAR_API_KEY=lin_api_...
GITHUB_PAT_KEY=github_pat_...
```

## Testing MCP Servers

After setup, test each container:

```bash
# Test Policeman has Linear access
docker exec casper-policeman claude "List my Linear tasks"

# Test Developer has GitHub access
docker exec casper-developer-1 claude "Show current git status"

# Test filesystem access
docker exec casper-tester claude "List files in the workspace"
```

## Troubleshooting

### MCP servers not found
The containers may need the actual MCP server packages installed:
```bash
# Install in container (if needed)
docker exec casper-policeman npm install -g @modelcontextprotocol/server-filesystem
docker exec casper-policeman npm install -g @modelcontextprotocol/server-github
```

### Authentication errors
- Verify environment variables are passed to containers
- Check that API keys are valid
- Linear server is remote, so internet access is required

## Advanced Configuration

You can customize MCP access per container by editing the config files in `configs/`:
- `mcp-policeman.json` - Full orchestrator access
- `mcp-developer.json` - Developer agent access
- `mcp-tester.json` - Tester agent access

After editing, re-run `./setup-mcp-servers.sh` to deploy changes.