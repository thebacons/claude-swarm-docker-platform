# Complete Linear MCP Setup Guide for CASPER Containers

## Understanding the Issue

Claude Code needs MCP servers to be configured in the correct location and format. After testing, here's what we've learned:

1. **MCP servers must be in settings.json** under `mcpServers` key
2. **Linear is a remote SSE server**, not an npm package
3. **Environment variables need to be substituted** with actual values

## Working Configuration

The Linear MCP server should be configured in `/home/claude/.config/claude-code/settings.json`:

```json
{
  "theme": "dark",
  "firstRun": false,
  "telemetry": false,
  "mcpServers": {
    "linear": {
      "transport": "sse",
      "url": "https://linear-mcp-server.vercel.app",
      "headers": {
        "Authorization": "Bearer YOUR_LINEAR_API_KEY"
      }
    }
  }
}
```

## Key Findings

1. **The `claude mcp add` command** creates entries but they don't seem to persist properly
2. **Settings.json is the authoritative source** for MCP server configuration
3. **Claude Code needs to be restarted** to pick up new MCP servers
4. **Environment variable substitution** doesn't work in settings.json - need actual values

## Why It's Not Working Yet

Even with correct configuration, the MCP tools (`mcp__linear__*`) aren't appearing because:

1. Claude Code in containers may need to be restarted after settings changes
2. The MCP server connection happens at Claude Code startup
3. The containerized environment might have different MCP loading behavior

## Alternative Approaches

Since native MCP integration is proving difficult, consider:

### 1. Direct Linear API Access
```bash
# Use curl to interact with Linear API
docker exec casper-policeman bash -c '
  curl -H "Authorization: $LINEAR_API_KEY" \
    -X POST https://api.linear.app/graphql \
    -d "{\"query\": \"query { projects { nodes { id name } } }\"}"
'
```

### 2. Create Linear Helper Scripts
Create bash scripts that wrap Linear API calls and make them available to Claude Code.

### 3. Use Claude Code's Built-in Bash
Claude Code can execute bash commands, so agents can interact with Linear through shell scripts.

## Next Steps

1. **Option A**: Rebuild golden image with MCP servers pre-configured in settings.json
2. **Option B**: Create Linear API wrapper scripts for containers
3. **Option C**: Use webhook receivers for Linear events

The Linear communication bridge concept is excellent, but may need implementation through alternative methods rather than native MCP integration.