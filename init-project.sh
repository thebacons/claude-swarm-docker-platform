#!/bin/bash

# Claude Swarm Project Initialization Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <project-name> <team-type>${NC}"
    echo -e "Team types: basic, fullstack, yolo, research"
    exit 1
fi

PROJECT_NAME=$1
TEAM_TYPE=$2
PROJECT_DIR="projects/$PROJECT_NAME"

# Validate team type
case $TEAM_TYPE in
    basic|fullstack|yolo|research)
        ;;
    *)
        echo -e "${RED}Invalid team type: $TEAM_TYPE${NC}"
        echo -e "Valid types: basic, fullstack, yolo, research"
        exit 1
        ;;
esac

# Check if project already exists
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Project '$PROJECT_NAME' already exists!${NC}"
    read -p "Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    rm -rf "$PROJECT_DIR"
fi

echo -e "${GREEN}Creating project '$PROJECT_NAME' with $TEAM_TYPE team...${NC}"

# Create project directory
mkdir -p "$PROJECT_DIR"

# Create base structure based on team type
case $TEAM_TYPE in
    basic)
        mkdir -p "$PROJECT_DIR/src" "$PROJECT_DIR/tests" "$PROJECT_DIR/docs"
        cat > "$PROJECT_DIR/claude-swarm.yml" << EOF
version: 1
swarm:
  name: "$PROJECT_NAME Development Team"
  main: lead_dev
instances:
  lead_dev:
    description: "Lead developer coordinating the project"
    directory: .
    model: sonnet
    connections: [assistant_dev]
    tools: [Read, Edit, Write, Bash, WebSearch]
    
  assistant_dev:
    description: "Assistant developer for implementation"
    directory: ./src
    model: haiku
    tools: [Read, Edit, Write]
EOF
        ;;
        
    fullstack)
        mkdir -p "$PROJECT_DIR"/{frontend/src,backend/src,database,tests,deploy,docs}
        cat > "$PROJECT_DIR/claude-swarm.yml" << EOF
version: 1
swarm:
  name: "$PROJECT_NAME Full-Stack Team"
  main: architect
instances:
  architect:
    description: "System architect and team lead"
    directory: .
    model: opus
    connections: [frontend_dev, backend_dev, devops]
    tools: [Read, Edit, Write, WebSearch]
    
  frontend_dev:
    description: "Frontend developer (React/TypeScript)"
    directory: ./frontend
    model: sonnet
    connections: [architect, backend_dev]
    tools: [Read, Edit, Write, Bash]
    
  backend_dev:
    description: "Backend developer (API/Database)"
    directory: ./backend
    model: sonnet
    connections: [architect, frontend_dev]
    tools: [Read, Edit, Write, Bash]
    
  devops:
    description: "DevOps engineer (Docker/CI/CD)"
    directory: ./deploy
    model: sonnet
    connections: [architect]
    tools: [Read, Edit, Write, Bash]
EOF
        ;;
        
    yolo)
        mkdir -p "$PROJECT_DIR"/{sandbox,output,logs}
        cat > "$PROJECT_DIR/claude-swarm.yml" << EOF
version: 1
swarm:
  name: "$PROJECT_NAME YOLO Team"
  main: yolo_lead
  vibe: true  # Enable autonomous mode
instances:
  yolo_lead:
    description: "YOLO team lead - move fast!"
    directory: .
    model: opus
    connections: [speed_coder, chaos_tester]
    tools: [Read, Edit, Write, Bash, WebSearch]
    vibe: true
    
  speed_coder:
    description: "Rapid prototyping specialist"
    directory: ./sandbox
    model: sonnet
    connections: [yolo_lead]
    tools: [Read, Edit, Write, Bash]
    vibe: true
    
  chaos_tester:
    description: "Break it to make it better"
    directory: ./sandbox
    model: haiku
    connections: [speed_coder]
    tools: [Read, Bash]
    vibe: true
EOF
        
        # Add warning file for YOLO mode
        cat > "$PROJECT_DIR/DANGER-README.md" << EOF
# ⚠️ YOLO MODE PROJECT ⚠️

This project is configured for YOLO (autonomous) mode!

## What this means:
- Agents have full permissions in their directories
- Operations execute without confirmation
- Changes happen rapidly and automatically
- Suitable for rapid prototyping ONLY

## Safety measures:
1. All work is isolated to this project directory
2. Container provides additional isolation
3. Regular backups are recommended
4. Monitor agent activity closely

## To disable YOLO mode:
Remove 'vibe: true' from claude-swarm.yml
EOF
        ;;
        
    research)
        mkdir -p "$PROJECT_DIR"/{data,analysis,reports,literature,experiments}
        cat > "$PROJECT_DIR/claude-swarm.yml" << EOF
version: 1
swarm:
  name: "$PROJECT_NAME Research Team"
  main: lead_researcher
instances:
  lead_researcher:
    description: "Lead researcher coordinating analysis"
    directory: .
    model: opus
    connections: [data_analyst, literature_reviewer, technical_writer]
    tools: [Read, Edit, Write, WebSearch]
    
  data_analyst:
    description: "Data analysis and visualization"
    directory: ./analysis
    model: sonnet
    connections: [lead_researcher]
    tools: [Read, Edit, Write, Bash]
    
  literature_reviewer:
    description: "Research and documentation review"
    directory: ./literature
    model: sonnet
    connections: [lead_researcher, technical_writer]
    tools: [Read, Edit, Write, WebSearch]
    
  technical_writer:
    description: "Report and documentation creation"
    directory: ./reports
    model: sonnet
    connections: [lead_researcher, literature_reviewer]
    tools: [Read, Edit, Write]
EOF
        ;;
esac

# Create common files
cat > "$PROJECT_DIR/.gitignore" << EOF
# Claude Swarm
.claude-swarm/
*.log
*.tmp
.env.local

# Dependencies
node_modules/
venv/
__pycache__/
*.pyc

# Build outputs
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

cat > "$PROJECT_DIR/README.md" << EOF
# $PROJECT_NAME

Created with Claude Swarm - $TEAM_TYPE team configuration.

## Team Structure
See \`claude-swarm.yml\` for the complete agent configuration.

## Getting Started
1. Navigate to project: \`cd $PROJECT_DIR\`
2. Start swarm: \`../../claude-swarm.sh claude-swarm.yml\`
3. Begin development with the main agent

## Project Structure
$(find "$PROJECT_DIR" -type d -name ".git" -prune -o -type d -print | sed "s|$PROJECT_DIR|.|g" | sort)

## Notes
- Team type: $TEAM_TYPE
- Created: $(date)
EOF

echo -e "${GREEN}✓ Project '$PROJECT_NAME' created successfully!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. cd $PROJECT_DIR"
echo -e "  2. Review claude-swarm.yml configuration"
echo -e "  3. Start swarm: ../../claude-swarm.sh claude-swarm.yml"