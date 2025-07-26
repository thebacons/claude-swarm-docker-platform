# ✅ CASPER SSH Access - Final Configuration

## 🎯 Port Mapping (As Requested)

| Container | Role | SSH Port | SSH Command |
|-----------|------|----------|-------------|
| **casper-policeman** | Master Orchestrator | **2222** | `ssh claude@localhost -p 2222` |
| **casper-developer-1** | Frontend Specialist | **2223** | `ssh claude@localhost -p 2223` |
| **casper-developer-2** | Backend Specialist | **2224** | `ssh claude@localhost -p 2224` |
| **casper-tester** | QA Engineer | **2225** | `ssh claude@localhost -p 2225` |

## 🔑 Credentials (All Containers)
- **Username**: `claude`
- **Password**: `claude`

## ✅ What Was Done

1. **Stopped old container** (`claude-ssh`) that was blocking port 2222
2. **Updated Policeman** to use port 2222 as requested
3. **Enabled SSH** on all containers
4. **Cleared SSH known hosts** to avoid warnings

## 🚀 Quick Test

Test all connections:
```bash
# Policeman (Master) - Port 2222
ssh claude@localhost -p 2222

# Developer 1 (Frontend) - Port 2223  
ssh claude@localhost -p 2223

# Developer 2 (Backend) - Port 2224
ssh claude@localhost -p 2224

# Tester (QA) - Port 2225
ssh claude@localhost -p 2225
```

## 📱 PuTTY Configuration

For PuTTY, save these sessions:

1. **CASPER-Policeman**
   - Host: `localhost`
   - Port: `2222` ← Easy to remember!
   - Username: `claude`

2. **CASPER-Dev-Frontend**
   - Host: `localhost`
   - Port: `2223`
   - Username: `claude`

3. **CASPER-Dev-Backend**
   - Host: `localhost`
   - Port: `2224`
   - Username: `claude`

4. **CASPER-Tester**
   - Host: `localhost`
   - Port: `2225`
   - Username: `claude`

## 💡 Memory Aid

- **2222** = Master Policeman (main orchestrator)
- **2223** = Developer 1 (Frontend)
- **2224** = Developer 2 (Backend)
- **2225** = Tester

All containers are running the golden image `casper-golden:fixed` with Claude Code v1.0.30 fully functional!