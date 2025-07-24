# Claude Swarm Docker - Complete Implementation Guide

## 🎯 Table of Contents
1. [What is Claude Swarm?](#what-is-claude-swarm)
2. [System Architecture](#system-architecture)
3. [Prerequisites & Installation](#prerequisites--installation)
4. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
5. [Understanding the Components](#understanding-the-components)
6. [Creating Your First Project](#creating-your-first-project)
7. [Team Configurations Explained](#team-configurations-explained)
8. [Running Your First Swarm](#running-your-first-swarm)
9. [Advanced Usage](#advanced-usage)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Best Practices & Tips](#best-practices--tips)

---

## 🤖 What is Claude Swarm?

Claude Swarm is a **multi-agent AI development framework** that allows multiple AI instances to work together on complex projects. Think of it as having a team of specialized AI developers, each with their own role and expertise, collaborating on your project.

### Key Concepts:
- **Agent**: An individual AI instance with specific capabilities
- **Swarm**: A coordinated team of agents working together
- **Claude Code**: The AI coding assistant that powers each agent
- **Docker**: Containerization technology that isolates and manages the environment

### Why Use Claude Swarm?
1. **Parallel Development**: Multiple agents can work on different parts simultaneously
2. **Specialization**: Each agent can focus on their area of expertise
3. **Scalability**: Add more agents as your project grows
4. **Safety**: Docker isolation prevents unintended system changes

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Host Machine                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Docker Environment                      │  │
│  │                                                     │  │
│  │  ┌─────────────────┐    ┌──────────────────────┐  │  │
│  │  │  Claude Swarm    │    │    Redis Server      │  │  │
│  │  │   Container      │<-->│  (Session Storage)   │  │  │
│  │  │                  │    └──────────────────────┘  │  │
│  │  │  ┌────────────┐  │                              │  │
│  │  │  │ Agent 1    │  │    ┌──────────────────────┐  │  │
│  │  │  │ (Lead Dev) │  │    │   Your Project       │  │  │
│  │  │  ├────────────┤  │    │    /frontend         │  │  │
│  │  │  │ Agent 2    │  │<-->│    /backend          │  │  │
│  │  │  │ (Frontend) │  │    │    /database         │  │  │
│  │  │  ├────────────┤  │    └──────────────────────┘  │  │
│  │  │  │ Agent 3    │  │                              │  │
│  │  │  │ (Backend)  │  │                              │  │
│  │  │  └────────────┘  │                              │  │
│  │  └─────────────────┘                              │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow:
```
User Request → Lead Agent → Task Decomposition
                    ↓
              Agent Assignment
                    ↓
         Parallel Task Execution
                    ↓
              Result Integration
                    ↓
              User Response
```

---

## 📋 Prerequisites & Installation

### What You Need:
1. **Docker Desktop** (version 20.10 or higher)
   - Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Mac: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: Follow [Docker Engine installation](https://docs.docker.com/engine/install/)

2. **Git** (for version control)
   - Windows: [Download Git](https://git-scm.com/download/win)
   - Mac: `brew install git` or [download](https://git-scm.com/download/mac)
   - Linux: `sudo apt-get install git` (Ubuntu/Debian)

3. **Anthropic API Key**
   - Sign up at [Anthropic Console](https://console.anthropic.com/)
   - Create an API key with billing enabled
   - Keep this key secure - it's like a password!

4. **Terminal/Command Line**
   - Windows: PowerShell or Windows Terminal
   - Mac/Linux: Terminal application

### System Requirements:
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **Internet**: Stable connection for API calls

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Verify Docker Installation

Open your terminal and run:
```bash
docker --version
```
**What this does**: Checks if Docker is installed correctly
**Expected output**: `Docker version 24.0.x, build xxxxx`

If you see an error, Docker isn't installed properly. Revisit the prerequisites.

### Step 2: Verify Docker is Running

```bash
docker ps
```
**What this does**: Lists running containers
**Expected output**: A table header (even if no containers are running)

If you get an error like "Cannot connect to Docker daemon", start Docker Desktop.

### Step 3: Clone or Navigate to Project

```bash
cd /path/to/claude-swarm-docker
```
**What this does**: Changes to your project directory
**Note**: Replace `/path/to/` with your actual path

### Step 4: Verify Files

```bash
ls -la
```
**What this does**: Lists all files in the directory
**You should see**:
- `Dockerfile` - Instructions for building the container
- `docker-compose.yml` - Multi-container configuration
- `.env` - Environment variables (including API key)
- `configs/` - Team configuration files
- Various `.sh` scripts

### Step 5: Build the Docker Image

```bash
docker-compose build
```
**What this does**: 
- Downloads Ubuntu 22.04 base image
- Installs Node.js, Ruby, Python
- Sets up the development environment
- Creates a user called "developer"

**This takes**: 5-10 minutes first time (cached after)

**What you'll see**: Progress bars and installation messages

### Step 6: Start the Containers

```bash
docker-compose up -d
```
**What this does**:
- `-d` means "detached mode" (runs in background)
- Starts both claude-swarm and redis containers
- Creates necessary networks and volumes

**Expected output**: 
```
Creating claude-redis ... done
Creating claude-swarm ... done
```

### Step 7: Verify Everything is Running

```bash
docker-compose ps
```
**What this does**: Shows status of all containers
**Expected output**:
```
NAME           IMAGE                              STATUS
claude-redis   redis:7-alpine                     Up X minutes
claude-swarm   claude-swarm-docker-claude-swarm   Up X minutes
```

---

## 🔧 Understanding the Components

### Directory Structure:
```
claude-swarm-docker/
├── .env                    # Your API key and settings
├── Dockerfile             # Container build instructions
├── docker-compose.yml     # Multi-container orchestration
├── shell.sh              # Quick container access
├── init-project.sh       # Project creation wizard
├── claude-swarm.sh       # Swarm launcher
├── setup.sh              # Initial setup helper
├── configs/              # Team templates
│   ├── basic-swarm.yml   # Simple 2-agent team
│   ├── full-stack-team.yml # Complete dev team
│   ├── yolo-team.yml     # Fast prototyping team
│   └── research-team.yml # Analysis team
└── projects/             # Your projects go here
```

### Key Scripts Explained:

#### 1. **shell.sh** - Container Access
```bash
./shell.sh
```
- Opens a bash shell inside the container
- You become the "developer" user
- All tools are available here

#### 2. **init-project.sh** - Project Creator
```bash
./init-project.sh my-app basic
```
- First argument: project name
- Second argument: team type (basic/fullstack/yolo/research)
- Creates folder structure and configuration

#### 3. **claude-swarm.sh** - Swarm Launcher
```bash
./claude-swarm.sh claude-swarm.yml
```
- Reads configuration file
- Prepares agent instances
- Sets up communication channels

---

## 🎨 Creating Your First Project

Let's create a simple web application project step by step:

### Step 1: Access the Container

```bash
./shell.sh
```
**What happens**: You enter the container environment as the "developer" user

**You'll see**:
```
Accessing Claude Swarm container shell...
Entering container as 'developer' user
Tip: Run 'claude' to authenticate with your API key
developer@claude-swarm:/workspace$
```

### Step 2: Create a New Project

Inside the container, run:
```bash
./init-project.sh my-first-app basic
```

**What this creates**:
```
projects/my-first-app/
├── src/                  # Source code
├── tests/                # Test files
├── docs/                 # Documentation
├── claude-swarm.yml      # Team configuration
├── .gitignore           # Git ignore rules
└── README.md            # Project description
```

### Step 3: Examine the Configuration

```bash
cd projects/my-first-app
cat claude-swarm.yml
```

**Understanding the configuration**:
```yaml
version: 1
swarm:
  name: "my-first-app Development Team"
  main: lead_dev              # Primary agent

instances:
  lead_dev:
    description: "Lead developer coordinating the project"
    directory: .              # Works in project root
    model: sonnet            # Claude 3.5 Sonnet
    connections: [assistant_dev]  # Can communicate with assistant
    tools: [Read, Edit, Write, Bash, WebSearch]
    
  assistant_dev:
    description: "Assistant developer for implementation"
    directory: ./src          # Works in src directory
    model: haiku             # Claude 3 Haiku (faster/cheaper)
    tools: [Read, Edit, Write]
```

---

## 👥 Team Configurations Explained

### 1. Basic Team (2 agents)
```
┌─────────────┐     ┌─────────────┐
│  Lead Dev   │<--->│  Assistant  │
│  (Sonnet)   │     │   (Haiku)   │
└─────────────┘     └─────────────┘
```
- **Use for**: Simple projects, learning
- **Cost**: Low
- **Speed**: Fast

### 2. Full-Stack Team (5 agents)
```
         ┌─────────────┐
         │  Architect  │
         │   (Opus)    │
         └──────┬──────┘
                │
    ┌───────────┼───────────┐
    ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌─────────┐
│Frontend │ │Backend  │ │ DevOps  │
│(Sonnet) │ │(Sonnet) │ │(Sonnet) │
└─────────┘ └─────────┘ └─────────┘
```
- **Use for**: Web applications, APIs
- **Cost**: Medium
- **Speed**: Parallel development

### 3. YOLO Team (3 agents) ⚠️
```
┌─────────────┐
│  YOLO Lead  │ (Autonomous mode)
│   (Opus)    │
└──────┬──────┘
       │
┌──────┴──────┐
↓             ↓
┌─────────┐ ┌─────────┐
│ Speed   │ │ Chaos   │
│ Coder   │ │ Tester  │
└─────────┘ └─────────┘
```
- **Use for**: Rapid prototyping
- **Cost**: High
- **Speed**: Very fast
- **Risk**: High (autonomous operations)

### 4. Research Team (4 agents)
```
       ┌──────────────┐
       │Lead Researcher│
       │    (Opus)    │
       └───────┬──────┘
               │
    ┌──────────┼──────────┐
    ↓          ↓          ↓
┌────────┐ ┌────────┐ ┌────────┐
│ Data   │ │Literature│ │Technical│
│Analyst │ │Reviewer │ │ Writer  │
└────────┘ └────────┘ └────────┘
```
- **Use for**: Analysis, documentation
- **Cost**: Medium-High
- **Speed**: Thorough

---

## 🚀 Running Your First Swarm

### Step 1: Start the Swarm

From your project directory:
```bash
../../claude-swarm.sh claude-swarm.yml
```

**What you'll see**:
```
╔═══════════════════════════════════════════════════╗
║        Claude Swarm Orchestrator v1.0             ║
╚═══════════════════════════════════════════════════╝

Loading swarm: my-first-app Development Team
Main instance: lead_dev

Session created: 20250123_164523_a1b2c3d4

Preparing swarm instances...

=== Main Instance ===
Starting instance: lead_dev
  Directory: .
  Model: sonnet
  Tools: all
✓ Instance lead_dev ready

=== Connected Instances ===
Starting instance: assistant_dev
  Directory: ./src
  Model: haiku
  Tools: Read,Edit,Write
✓ Instance assistant_dev ready
```

### Step 2: Launch the Main Agent

The swarm creates launch scripts for each agent:
```bash
sessions/[session_id]/lead_dev/launch.sh
```

### Step 3: Working with the Swarm

In a real implementation, you would:
1. Start with the lead agent
2. Give it a high-level task
3. It delegates to other agents
4. Monitor progress via logs

**Example interaction**:
```
You: "Create a simple todo list web app with React"

Lead Dev: "I'll coordinate this project. Let me break it down:
1. Frontend: React components for the UI
2. State management for todos
3. Local storage persistence

I'll have my assistant set up the basic structure while I design the architecture..."
```

---

## 🔬 Advanced Usage

### Custom Swarm Configuration

Create your own team in `projects/my-app/custom-swarm.yml`:

```yaml
version: 1
swarm:
  name: "Custom Team"
  main: architect
  
instances:
  architect:
    description: "System architect and coordinator"
    directory: .
    model: opus
    connections: [frontend_senior, frontend_junior, backend_dev]
    tools: [Read, Edit, Write, WebSearch]
    prompt: |
      You are a senior architect focusing on scalable design.
      Always consider performance and security.
    
  frontend_senior:
    description: "Senior React developer"
    directory: ./frontend
    model: sonnet
    connections: [frontend_junior, architect]
    tools: [Read, Edit, Write, Bash]
    temperature: 0.7  # More creative
    
  frontend_junior:
    description: "Junior developer learning React"
    directory: ./frontend/components
    model: haiku
    connections: [frontend_senior]
    tools: [Read, Edit, Write]
    temperature: 0.3  # More focused
    
  backend_dev:
    description: "API developer"
    directory: ./backend
    model: sonnet
    connections: [architect]
    tools: [Read, Edit, Write, Bash]
```

### Environment Variables

Customize behavior in `.env`:
```bash
# API Configuration
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Swarm Settings
MAX_AGENTS=10              # Maximum concurrent agents
AGENT_TIMEOUT=300          # Seconds before timeout
LOG_LEVEL=DEBUG           # DEBUG, INFO, WARNING, ERROR

# Cost Controls
DAILY_TOKEN_LIMIT=1000000  # Daily token budget
REQUIRE_APPROVAL=true      # Require approval for operations
```

### Monitoring and Logs

View real-time logs:
```bash
# All logs
docker-compose logs -f

# Just Claude swarm
docker-compose logs -f claude-swarm

# Session logs
tail -f projects/my-app/sessions/*/session.log
```

### Cost Management

Monitor token usage:
```bash
# In container
cat ~/.claude/usage.json

# Check specific session
cat sessions/*/usage.log
```

---

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### 1. "Cannot connect to Docker daemon"
**Problem**: Docker isn't running
**Solution**: 
```bash
# Start Docker Desktop (GUI)
# Or on Linux:
sudo systemctl start docker
```

#### 2. "Permission denied" errors
**Problem**: File permission issues
**Solution**:
```bash
# Fix permissions
docker-compose exec claude-swarm sudo chown -R developer:developer /workspace
```

#### 3. API Authentication Failures
**Problem**: Invalid or missing API key
**Solution**:
1. Check `.env` file has correct key
2. Restart containers:
```bash
docker-compose restart
```

#### 4. Container won't start
**Problem**: Port conflicts
**Solution**:
```bash
# Check what's using ports
netstat -tulpn | grep -E '3000|8080|6379'

# Stop conflicting services or change ports in docker-compose.yml
```

#### 5. Out of Memory
**Problem**: Too many agents or large operations
**Solution**:
1. Increase Docker memory limit
2. Reduce MAX_AGENTS in .env
3. Use smaller models (haiku vs opus)

### Debug Commands

```bash
# Container health
docker-compose exec claude-swarm ps aux

# Disk usage
docker-compose exec claude-swarm df -h

# Network connectivity
docker-compose exec claude-swarm ping -c 3 api.anthropic.com

# View container logs
docker logs claude-swarm --tail 50

# Interactive troubleshooting
docker-compose exec claude-swarm /bin/bash
```

---

## 💡 Best Practices & Tips

### 1. Start Small
- Begin with basic team configuration
- Test with simple tasks
- Gradually increase complexity

### 2. Cost Optimization
```
Model Selection Strategy:
- Opus: Complex reasoning, architecture decisions ($$$)
- Sonnet: General development, implementation ($$)
- Haiku: Simple tasks, code formatting ($)
```

### 3. Project Organization
```
projects/
├── prototypes/        # Quick experiments (YOLO team)
├── production/        # Serious projects (Full-stack team)
├── research/          # Analysis projects (Research team)
└── learning/          # Tutorial projects (Basic team)
```

### 4. Safety Practices
- **Never** run YOLO mode on production code
- Always backup before major operations
- Review agent changes before committing
- Use version control (git) religiously

### 5. Efficient Workflows

**Morning Routine**:
```bash
# 1. Start containers
docker-compose up -d

# 2. Check health
docker-compose ps

# 3. Access shell
./shell.sh

# 4. Review yesterday's work
cd projects/current-project
git status
git log --oneline -10
```

**Before Stopping Work**:
```bash
# 1. Save all work
git add .
git commit -m "WIP: Description of progress"

# 2. Check resource usage
docker stats --no-stream

# 3. Stop containers (optional)
docker-compose down
```

### 6. Collaboration Tips

When working with AI agents:
- Be specific in requirements
- Break large tasks into smaller ones
- Provide examples when possible
- Review and guide rather than micromanage

### 7. Performance Optimization

**Fast Development**:
- Use haiku for routine tasks
- Parallelize independent work
- Cache common operations
- Reuse agent sessions

**Quality Focus**:
- Use opus for critical decisions
- Implement review cycles
- Add test agents for validation
- Document decisions

---

## 📚 Additional Resources

### Learning Path
1. **Week 1**: Master basic team, simple projects
2. **Week 2**: Try full-stack team, build a real app
3. **Week 3**: Experiment with custom configurations
4. **Week 4**: Optimize workflows and costs

### Useful Commands Reference
```bash
# Docker commands
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
docker-compose restart        # Restart services

# Project commands
./shell.sh                    # Container access
./init-project.sh NAME TYPE   # Create project
./claude-swarm.sh CONFIG      # Start swarm

# Inside container
claude                        # Start Claude CLI
npm install                   # Install Node packages
bundle install               # Install Ruby gems
python -m pip install        # Install Python packages
```

### Support Resources
- Docker Documentation: https://docs.docker.com/
- Anthropic Documentation: https://docs.anthropic.com/
- Git Basics: https://git-scm.com/book

---

## 🎯 Quick Start Checklist

- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] Anthropic API key in `.env`
- [ ] Containers built (`docker-compose build`)
- [ ] Containers running (`docker-compose up -d`)
- [ ] First project created (`./init-project.sh test basic`)
- [ ] Swarm configuration understood
- [ ] First swarm session launched
- [ ] Basic workflow mastered

Congratulations! You're ready to build with Claude Swarm! 🚀

Remember: Start simple, experiment safely, and gradually increase complexity as you become comfortable with the system.