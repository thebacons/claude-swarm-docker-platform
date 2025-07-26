# Running Claude Code Between Containers

## 🎯 The Challenge
You want to use Claude Code in one container (e.g., Policeman) to execute commands in another container (e.g., Developer-1).

## 🔧 Solutions

### Solution 1: SSH from Container to Container
Since all containers have SSH enabled, you can SSH from one to another:

```bash
# From Policeman container
ssh claude@developer-1 -p 22 'claude "Create a React component"'
# Password: claude

# Or start an interactive session
ssh claude@developer-1 -p 22
# Then use claude normally
```

### Solution 2: Docker Exec from Within Container
Install Docker client in the container to control other containers:

```bash
# From inside Policeman container
# First install Docker client (one-time setup)
sudo apt-get update && sudo apt-get install -y docker.io

# Then execute Claude in other containers
docker exec casper-developer-1 claude "Build a login form"
```

### Solution 3: Network API Approach (Advanced)
Create a simple API wrapper around Claude Code:

```python
# api-wrapper.py (in each container)
from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/claude', methods=['POST'])
def run_claude():
    command = request.json.get('command')
    result = subprocess.run(['claude', command], capture_output=True, text=True)
    return jsonify({
        'output': result.stdout,
        'error': result.stderr
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Solution 4: Shared Command Queue (Redis)
Use Redis to pass commands between containers:

```python
# In Policeman - send command
import redis
r = redis.Redis(host='redis', password='casper_redis_2024')
r.lpush('developer-1:commands', 'Create a user authentication module')

# In Developer-1 - receive and execute
command = r.rpop('developer-1:commands')
if command:
    os.system(f'claude "{command.decode()}"')
```

## 🚀 Practical Examples

### 1. Direct Container-to-Container SSH
```bash
# SSH into Policeman
ssh claude@localhost -p 2222

# From Policeman, control Developer-1
ssh claude@developer-1 'claude "Create a navbar component"'
# Enter password: claude

# Or use sshpass to avoid password prompt
sudo apt-get install -y sshpass
sshpass -p claude ssh claude@developer-1 'claude "Create a navbar"'
```

### 2. Orchestrated Execution Script
Create this script in Policeman container:

```bash
#!/bin/bash
# orchestrate.sh

echo "Orchestrating tasks across agents..."

# Frontend task
sshpass -p claude ssh claude@developer-1 \
  'claude "Create a React dashboard with charts"' &

# Backend task  
sshpass -p claude ssh claude@developer-2 \
  'claude "Create REST API endpoints for dashboard data"' &

# Test task
sshpass -p claude ssh claude@tester \
  'claude "Write tests for dashboard components"' &

wait
echo "All tasks distributed!"
```

### 3. Python Orchestration with SSH
```python
# orchestrate_with_claude.py
import subprocess
import concurrent.futures

def run_claude_on_agent(agent, task):
    cmd = f"sshpass -p claude ssh claude@{agent} 'claude \"{task}\"'"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return f"{agent}: {result.stdout}"

# Define tasks
tasks = [
    ("developer-1", "Create a user registration form"),
    ("developer-2", "Create user model and database schema"),
    ("tester", "Write test cases for user registration")
]

# Execute in parallel
with concurrent.futures.ThreadPoolExecutor() as executor:
    futures = [executor.submit(run_claude_on_agent, agent, task) 
               for agent, task in tasks]
    
    for future in concurrent.futures.as_completed(futures):
        print(future.result())
```

## 📝 Setup SSH Keys (Avoid Password Prompts)

```bash
# In Policeman container
ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa

# Copy key to other containers
sshpass -p claude ssh-copy-id claude@developer-1
sshpass -p claude ssh-copy-id claude@developer-2
sshpass -p claude ssh-copy-id claude@tester

# Now you can SSH without passwords
ssh claude@developer-1 'claude "Build a feature"'
```

## 🎮 Quick Start

1. **SSH into Policeman**:
   ```bash
   ssh claude@localhost -p 2222
   ```

2. **Install sshpass** (in Policeman):
   ```bash
   sudo apt-get update && sudo apt-get install -y sshpass
   ```

3. **Test cross-container Claude execution**:
   ```bash
   # From Policeman, run Claude on Developer-1
   sshpass -p claude ssh claude@developer-1 'claude --version'
   
   # Run actual task
   sshpass -p claude ssh claude@developer-1 'claude "Create a login component"'
   ```

## 💡 Important Notes

1. **Internal Network**: Containers can reach each other by hostname (developer-1, developer-2, etc.)
2. **Internal SSH Port**: Use port 22 when SSHing between containers
3. **External SSH Ports**: Use 2222-2225 when SSHing from your host machine

## 🔧 Current Reality vs. Future Vision

**Current**: Manual SSH commands between containers
**Future Vision**: Claude Code in Policeman would understand orchestration role and automatically distribute tasks

For now, the Python scripts provide proven orchestration:
```bash
python3 /home/claude/workspace/scripts/demo-swarm.py
```