# MCP Persistent Architecture Solution Plan

## Deep Analysis: The Core Problem

### Current State
1. **Claude Code is stateless**: Each `claude` command is a new process
2. **MCP servers need persistence**: stdio transport requires long-lived processes
3. **Container has zombie processes**: Evidence that MCP servers try to run but die
4. **No daemon mode**: Claude Code CLI lacks a server/service mode

### Key Insights from Research
1. **Remote MCP servers exist**: Linear uses `https://mcp.linear.app/sse`
2. **SSE transport**: Server-Sent Events for persistent connections
3. **Local vs Remote**: Local servers spawn processes, remote servers use HTTP
4. **mcp-remote tool**: Acts as a bridge for OAuth-based remote servers

## Proposed Solution: MCP Broker Architecture

### Architecture Overview
```
Container Environment
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Claude Code ──stdio──> MCP Broker ──HTTP/SSE──> APIs  │
│  (stateless)           (persistent)             (remote)│
│                              │                          │
│                              ├──> Linear API            │
│                              ├──> GitHub API            │
│                              └──> Local Services        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Solution Components

#### 1. MCP Broker Service (New Component)
A persistent Node.js service that:
- Runs as a daemon in the container
- Accepts stdio connections from Claude Code
- Maintains persistent connections to remote APIs
- Translates between stdio and HTTP/SSE protocols
- Manages authentication and state

#### 2. Local MCP Proxy Servers
For each service, create a thin proxy that:
- Accepts stdio from Claude Code
- Forwards to the MCP Broker via HTTP
- Returns responses back via stdio
- Runs only during Claude Code execution

#### 3. Modified Container Architecture
```dockerfile
# Start MCP Broker on container startup
CMD ["sh", "-c", "node /opt/mcp-broker/server.js & tail -f /dev/null"]
```

### Implementation Approach

#### Phase 1: Validate Persistent Service
1. Test running a Node.js service in background
2. Ensure it survives between Claude Code calls
3. Verify it can maintain SSE connections

#### Phase 2: Build MCP Broker
1. **Input**: stdio protocol from Claude Code
2. **Output**: HTTP/SSE to remote services
3. **Features**:
   - Connection pooling
   - Authentication management
   - Request/response translation
   - Error handling and recovery

#### Phase 3: Create Proxy Servers
For each MCP server, create a lightweight proxy:
```javascript
// linear-proxy.js
const net = require('net');
const http = require('http');

// Accept stdio from Claude Code
process.stdin.on('data', (data) => {
  // Forward to MCP Broker
  http.post('http://localhost:8080/mcp/linear', data)
    .then(response => process.stdout.write(response));
});
```

#### Phase 4: Configure Claude Code
```json
{
  "mcpServers": {
    "linear": {
      "transport": "stdio",
      "command": "node",
      "args": ["/opt/mcp-proxies/linear-proxy.js"],
      "env": {}
    }
  }
}
```

### Alternative Approaches Considered

#### 1. Direct Remote MCP (Not Viable)
- Linear's SSE endpoint requires OAuth
- Containers can't handle browser-based auth
- API keys not supported by remote endpoints

#### 2. Shared MCP Gateway (Complex)
- Central service outside containers
- Requires network configuration
- Security concerns with shared state

#### 3. Keep Claude Code Running (Not Possible)
- No daemon/server mode in CLI
- Would require forking Claude Code
- Against design philosophy

### Benefits of MCP Broker Approach

1. **Persistence**: Broker maintains connections
2. **Compatibility**: Works with existing Claude Code
3. **Flexibility**: Can adapt between protocols
4. **Scalability**: One broker serves multiple MCP requests
5. **Debugging**: Central point for logging/monitoring

### Technical Considerations

1. **Startup Order**: Broker must start before Claude Code use
2. **Health Checks**: Ensure broker is running
3. **Resource Usage**: Minimal overhead (~50MB RAM)
4. **Error Recovery**: Auto-restart on failure
5. **Configuration**: Environment-based setup

### Next Steps (No Code Yet)

1. **Proof of Concept**: Test persistent Node.js service in container
2. **Protocol Analysis**: Understand MCP stdio format
3. **API Mapping**: Map stdio commands to HTTP endpoints
4. **Security Review**: Ensure safe credential handling
5. **Performance Testing**: Verify low latency

This architecture solves the fundamental problem by introducing a persistent layer between stateless Claude Code and stateful MCP requirements, while maintaining compatibility with the existing Claude Code CLI.