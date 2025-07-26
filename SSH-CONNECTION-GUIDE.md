# SSH Connection Guide - All CASPER Containers

## ✅ SSH is Now Enabled!

All containers have SSH set up with the following credentials:
- **Username**: `claude`
- **Password**: `claude`

## 🔌 Connection Details

### From PuTTY or SSH Client:

| Container | Role | SSH Command | PuTTY Settings |
|-----------|------|-------------|----------------|
| **Policeman** | Master Orchestrator | `ssh claude@localhost -p 2222` | Host: localhost, Port: 2222 |
| **Developer 1** | Frontend Specialist | `ssh claude@localhost -p 2223` | Host: localhost, Port: 2223 |
| **Developer 2** | Backend Specialist | `ssh claude@localhost -p 2224` | Host: localhost, Port: 2224 |
| **Tester** | QA Engineer | `ssh claude@localhost -p 2225` | Host: localhost, Port: 2225 |

## 🎯 Quick Test Commands

Test each connection:
```bash
# Test Developer 1 (Frontend)
ssh claude@localhost -p 2223 "echo 'Frontend Developer Ready!'"

# Test Developer 2 (Backend)
ssh claude@localhost -p 2224 "echo 'Backend Developer Ready!'"

# Test Tester
ssh claude@localhost -p 2225 "echo 'QA Tester Ready!'"
```

## 💻 What You Can Do in Each Container

### Once Connected via SSH:

1. **Check Claude Code**:
   ```bash
   claude --version
   # Output: 1.0.30 (Claude Code)
   ```

2. **Run Claude Code**:
   ```bash
   claude "Hello, I'm a developer agent"
   ```

3. **Check Agent Role**:
   ```bash
   env | grep AGENT
   # Shows: AGENT_ROLE, AGENT_NAME, AGENT_SPECIALIZATION
   ```

4. **Run Swarm Demo** (from Policeman):
   ```bash
   python3 ~/workspace/scripts/demo-swarm.py
   ```

5. **Check Inter-Agent Communication**:
   ```bash
   # From any container, ping others
   ping policeman -c 2
   ping developer-1 -c 2
   ping developer-2 -c 2
   ping tester -c 2
   ```

## 🚀 PuTTY Setup for Each Agent

### Save these sessions in PuTTY:

1. **CASPER-Policeman**
   - Session Name: CASPER-Policeman
   - Host: localhost
   - Port: 2222
   - Connection Type: SSH
   - Auto-login username: claude

2. **CASPER-Developer-Frontend**
   - Session Name: CASPER-Dev-Frontend
   - Host: localhost
   - Port: 2223
   - Connection Type: SSH
   - Auto-login username: claude

3. **CASPER-Developer-Backend**
   - Session Name: CASPER-Dev-Backend
   - Host: localhost
   - Port: 2224
   - Connection Type: SSH
   - Auto-login username: claude

4. **CASPER-Tester**
   - Session Name: CASPER-Tester
   - Host: localhost
   - Port: 2225
   - Connection Type: SSH
   - Auto-login username: claude

## 🎭 Container Roles Explained

- **Policeman (2222)**: Master orchestrator, can spawn and coordinate other agents
- **Developer-1 (2223)**: Frontend specialist (React, TypeScript, UI)
- **Developer-2 (2224)**: Backend specialist (APIs, databases, server)
- **Tester (2225)**: Quality assurance (unit tests, integration tests)

## 📋 Current Status

✅ All containers have SSH enabled
✅ All using the same credentials (claude/claude)
✅ All have Claude Code v1.0.30 installed
✅ All can communicate with each other via internal network

## 💡 Pro Tip

Open multiple PuTTY windows to monitor all agents simultaneously:
1. Connect to Policeman to issue orchestration commands
2. Connect to Developer-1 to see frontend work
3. Connect to Developer-2 to see backend work
4. Connect to Tester to see test execution

You now have full SSH access to your entire CASPER swarm!