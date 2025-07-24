# Claude in Docker - Usage Guide

## ✅ Authentication is Fixed!

The Claude OAuth issue has been resolved. Instead of using the Claude CLI (which has OAuth issues in containers), we now use the Anthropic Python SDK with your API key.

## 🚀 Quick Start

### 1. Access the Container
```bash
./shell.sh
```

### 2. Test Claude Connection
```bash
python3 /workspace/test-claude.py
```

You should see: `Success! Claude says: Hello from Docker!`

### 3. Interactive Chat Mode
```bash
claude-chat
# or
python3 /workspace/claude-api.py
```

This opens an interactive session where you can chat with Claude:
```
Claude API Interactive Mode (type 'exit' to quit)
--------------------------------------------------

You: Hello! What can you help me with?

Claude: I can help you with a wide variety of tasks including...
```

### 4. One-off Commands
```bash
claude-api "Explain Docker containers in one sentence"
```

## 📝 Using Claude in Your Projects

### Python Script Example
```python
#!/usr/bin/env python3
import os
from anthropic import Anthropic

# API key is automatically loaded from environment
client = Anthropic()

# Send a message
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Write a hello world in Python"}
    ]
)

print(response.content[0].text)
```

### Bash Script Integration
```bash
#!/bin/bash
# Use Claude in bash scripts

RESPONSE=$(python3 /workspace/claude-api.py "Generate a git commit message for adding Docker support")
echo "Claude suggests: $RESPONSE"
```

## 🔧 Available Commands

After running `fix-claude-auth.sh`, these commands are available:

| Command | Description |
|---------|-------------|
| `claude-test` | Test Claude connection |
| `claude-chat` | Interactive chat mode |
| `claude-api <prompt>` | One-off API call |
| `python3 /workspace/claude-api.py` | Direct script access |

## 🎯 For Swarm Development

When building swarm agents, use the Python SDK pattern:

```python
# agent_base.py
import os
from anthropic import Anthropic

class ClaudeAgent:
    def __init__(self, role, model="claude-3-5-sonnet-20241022"):
        self.client = Anthropic()
        self.role = role
        self.model = model
    
    def think(self, task):
        """Process a task and return response"""
        prompt = f"As a {self.role}, {task}"
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text

# Example usage
lead_dev = ClaudeAgent("Lead Developer")
result = lead_dev.think("design a REST API for a todo app")
```

## 🛡️ Security Notes

1. **API Key**: Your key is stored in `.env` and automatically loaded
2. **Container Isolation**: Each container has its own environment
3. **No OAuth Required**: Direct API access is more secure in containers
4. **Key Rotation**: Update `.env` and restart containers to change keys

## 🚨 Troubleshooting

### "API key not found"
- Check `.env` file has `ANTHROPIC_API_KEY=sk-ant-api03-...`
- Restart container: `docker-compose restart`

### "Import error: anthropic"
- Run the fix script: `./fix-claude-auth.sh`
- Or manually: `pip3 install --user anthropic`

### "Connection timeout"
- Check internet connectivity: `ping api.anthropic.com`
- Verify Docker's DNS: `docker exec claude-swarm cat /etc/resolv.conf`

## 💡 Tips

1. **Cost Management**: Use `haiku` model for simple tasks
2. **Context Windows**: Claude 3.5 Sonnet supports 200K tokens
3. **Streaming**: For long responses, use streaming API
4. **Rate Limits**: Be aware of API rate limits for production use

## 🎉 Success!

You now have Claude working perfectly in your Docker container without any OAuth issues! The Python SDK approach is more reliable and better suited for containerized environments.