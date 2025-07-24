# 🚀 Claude Swarm Testing Guide - Step by Step

## Prerequisites Checklist
- [ ] Docker Desktop is installed and running
- [ ] You have the `claude-swarm-docker` folder
- [ ] Your `.env` file contains the Anthropic API key
- [ ] You've run `docker-compose build` at least once
- [ ] Containers are running (`docker-compose ps` shows them as "Up")

---

## 📋 Step-by-Step Testing Instructions

### Step 1: Open Your Terminal
- **Windows**: Open PowerShell or Windows Terminal
- **Mac**: Open Terminal app
- **Linux**: Open your terminal emulator

### Step 2: Navigate to Project Directory
```bash
cd /path/to/claude-swarm-docker
```

**Examples:**
- Windows: `cd C:\Users\colin\Documents-local\91_Claude-Code\claude-swarm-docker`
- Mac/Linux: `cd ~/Documents/claude-swarm-docker`

**Verify you're in the right place:**
```bash
ls
```
You should see: `Dockerfile`, `docker-compose.yml`, `.env`, etc.

### Step 3: Ensure Docker is Running
```bash
docker ps
```

**Expected output:**
```
NAME           IMAGE                              STATUS
claude-redis   redis:7-alpine                     Up X minutes
claude-swarm   claude-swarm-docker-claude-swarm   Up X minutes
```

**If you see an error:**
- Start Docker Desktop application
- Wait 30 seconds for it to fully start
- Try `docker ps` again

### Step 4: Enter the Container
```bash
./shell.sh
```

**Expected output:**
```
Accessing Claude Swarm container shell...
Entering container as 'developer' user
Tip: Run 'claude' to authenticate with your API key

developer@bb90d5c46132:/workspace$
```

**You're now inside the container!** The prompt changed to show `developer@[container-id]`

### Step 5: Verify Claude Connection
```bash
claude-test
```

**Expected output:**
```
Testing Claude connection...
Success! Claude says: Hello from Docker!
```

**If this fails:**
- Exit container: `exit`
- Run fix script: `./fix-claude-auth.sh`
- Re-enter container: `./shell.sh`
- Try again: `claude-test`

### Step 6: Run the Swarm Demo
```bash
python3 /workspace/demo-swarm.py
```

**This command starts the multi-agent demo!**

### Step 7: Understanding the Output

The demo has 3 parts:

#### Part 1: Sequential Execution (Traditional Way)
```
============================================================
1️⃣  SEQUENTIAL Execution (one at a time):
============================================================
[lead] Starting: Plan the architecture for a chat application
[lead] Completed in 2.3s
Result: [AI response about architecture]

[frontend] Starting: Design the chat UI components
[frontend] Completed in 1.8s
Result: [AI response about UI]
```
- Each agent waits for the previous one to finish
- Total time = sum of all individual times

#### Part 2: Parallel Execution (Swarm Way)
```
============================================================
2️⃣  PARALLEL Execution (all at once):
============================================================
[lead] Starting: Plan the architecture for a chat application
[frontend] Starting: Design the chat UI components
[backend] Starting: Design the database schema for messages
[tester] Starting: Create a test plan for the chat feature
[backend] Completed in 1.7s
[tester] Completed in 1.8s
[frontend] Completed in 2.0s
[lead] Completed in 2.1s
```
- All agents start at the same time
- Total time = time of slowest agent only
- **This is the magic of parallel execution!**

#### Part 3: Performance Comparison
```
============================================================
📊 RESULTS COMPARISON:
============================================================
Sequential execution time: 7.7 seconds
Parallel execution time: 2.1 seconds
⚡ Speed improvement: 3.7x faster!
```

### Step 8: Try Interactive Chat (Optional)
```bash
claude-chat
```

**How to use:**
1. Type your message and press Enter
2. Claude responds
3. Continue conversation
4. Type `exit` to quit

**Example:**
```
You: Write a Python function to reverse a string

Claude: Here's a Python function to reverse a string:

def reverse_string(s):
    return s[::-1]

You: exit
```

### Step 9: Exit the Container
```bash
exit
```

You're back on your host machine!

---

## 🎯 What You Just Tested

1. **Container Access**: Successfully entered the Docker environment
2. **API Connection**: Verified Claude API is working
3. **Parallel Processing**: Saw 4 AI agents working simultaneously
4. **Performance Gain**: Witnessed 3-4x speed improvement
5. **Role Specialization**: Each agent responded according to their role

---

## 🔧 Troubleshooting Guide

### Problem: "docker: command not found"
**Solution**: Docker isn't installed or not in PATH
- Install Docker Desktop
- Restart your terminal
- Try again

### Problem: "Cannot connect to Docker daemon"
**Solution**: Docker isn't running
- Start Docker Desktop application
- Wait for it to fully start (system tray icon)
- Try again

### Problem: "./shell.sh: Permission denied"
**Solution**: Script isn't executable
```bash
chmod +x shell.sh
./shell.sh
```

### Problem: "API key not found" error
**Solution**: Environment variable not set
1. Check `.env` file has your key
2. Exit container: `exit`
3. Restart containers: `docker-compose restart`
4. Enter container again: `./shell.sh`

### Problem: Demo runs but no AI responses
**Solution**: API key might be invalid
- Verify key starts with `sk-ant-api03-`
- Check Anthropic console for valid key
- Ensure billing is enabled on your account

---

## 📊 Understanding the Results

### What's Real vs Simulated

**Real:**
- ✅ Actual API calls to Claude AI
- ✅ True parallel execution
- ✅ Real time measurements
- ✅ Different AI models (Sonnet/Haiku)
- ✅ Genuine AI responses

**Simulated:**
- 📌 File system changes (agents don't modify real files)
- 📌 Network communication between agents
- 📌 Persistent memory between runs

---

## 🚀 Next Steps

### 1. Modify the Demo
Edit `/workspace/demo-swarm.py` to change:
- Task descriptions
- Number of agents
- Agent roles
- Model selection

### 2. Create a Real Project
```bash
./init-project.sh my-app fullstack
cd projects/my-app
cat claude-swarm.yml
```

### 3. Explore the Orchestrator
```bash
python3 /workspace/swarm-orchestrator.py demo
```

### 4. Build Your Own Swarm
Create custom configurations with different agent teams!

---

## 📝 Quick Reference Card

| Command | What it does |
|---------|--------------|
| `./shell.sh` | Enter container |
| `claude-test` | Test API connection |
| `claude-chat` | Interactive Claude chat |
| `python3 /workspace/demo-swarm.py` | Run swarm demo |
| `exit` | Leave container |

---

## 🎉 Congratulations!

You've successfully tested Claude Swarm! You've seen how multiple AI agents can work together in parallel, dramatically speeding up development tasks. This is the foundation for building AI-powered development teams!

**Remember**: This is a demonstration of parallel AI execution. Real-world applications would add file manipulation, inter-agent communication, and persistent state management.

---

*Print this guide and check off each step as you go!*