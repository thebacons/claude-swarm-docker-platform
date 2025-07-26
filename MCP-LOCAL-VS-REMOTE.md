# Understanding Local vs Remote MCP Servers

## Key Differences

### Local MCP Servers (stdio transport)
- Run as local processes spawned by Claude Code
- Use `npx` to execute server packages
- Communicate via stdin/stdout (stdio)
- Work well on local machines
- **Problem in containers**: Each container needs its own process

### Remote MCP Servers (HTTP/SSE transport)
- Connect to external HTTP endpoints
- Use OAuth for authentication (like Linear)
- Don't spawn local processes
- Better for distributed/containerized environments
- **Problem**: OAuth requires browser for authentication

## The Container Challenge

1. **Local servers in containers**: Work but each container spawns its own process
2. **Remote servers with OAuth**: Can't authenticate without browser access
3. **API-key based local servers**: Best option for containers (what we currently use)

## Current Approach Analysis

Our current setup uses:
- `linear-mcp-server` with API key (local stdio)
- Works in containers but not ideal
- Each container runs its own MCP process

## Better Solutions

### Option 1: Central MCP Gateway
Create a central MCP server that containers connect to:
```
Containers → Central MCP Gateway → External Services
```

### Option 2: Pre-authenticated Remote Servers
Some vendors may offer API-key based remote endpoints (not OAuth)

### Option 3: Keep Local Servers with API Keys
Current approach - functional but not optimal

## Recommendation

For containers, we should:
1. Use local MCP servers with API key authentication (current approach)
2. Ensure `.mcp.json` is properly loaded by Claude Code
3. Remove conflicting old config files
4. Consider central MCP gateway in future