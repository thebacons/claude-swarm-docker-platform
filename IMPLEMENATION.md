\# Claude Code + Swarm Docker Environment - Complete Setup Guide



\## \*\*Prerequisites\*\*



\- Docker 20.10+ and Docker Compose 2.0+

\- Anthropic API key with active billing

\- Git configured on your host system

\- At least 4GB free disk space



\## \*\*Step-by-Step Installation\*\*



\### \*\*1. Create Project Directory\*\*

```bash

mkdir claude-swarm-docker

cd claude-swarm-docker

```



\### \*\*2. Create Required Files\*\*



Create the following directory structure:

```

claude-swarm-docker/

├── Dockerfile

├── docker-compose.yml

├── setup.sh

├── .env.example

├── configs/

│   ├── basic-swarm.yml

│   ├── full-stack-team.yml

│   ├── yolo-team.yml

│   └── research-team.yml

└── projects/

```



\### \*\*3. Copy Configuration Files\*\*



Copy all the files from the artifacts above into their respective locations:



\- Copy the \*\*Dockerfile\*\* content into `Dockerfile`

\- Copy the \*\*docker-compose.yml\*\* section into `docker-compose.yml`  

\- Copy the \*\*setup.sh\*\* section into `setup.sh`

\- Copy each YAML configuration into the `configs/` directory



\### \*\*4. Run Setup Script\*\*

```bash

chmod +x setup.sh

./setup.sh

```



\### \*\*5. Configure Environment\*\*

```bash

cp .env.example .env

nano .env  # Add your Anthropic API key

```



\### \*\*6. Build and Start Container\*\*

```bash

docker-compose up -d

```



\### \*\*7. Access Container and Configure Claude\*\*

```bash

./shell.sh  # Access container shell



\# Inside container:

claude      # Follow authentication prompts

```



\## \*\*Usage Examples\*\*



\### \*\*Basic Development Team\*\*

```bash

\# Initialize project

./init-project.sh my-web-app basic

cd projects/my-web-app



\# Start basic swarm (safe mode)

../../claude-swarm.sh claude-swarm.yml



\# Inside Claude main instance:

> "Create a React component for user login"

```



\### \*\*Full-Stack Development\*\*

```bash

\# Initialize full-stack project

./init-project.sh enterprise-app fullstack

cd projects/enterprise-app



\# Start comprehensive swarm

../../claude-swarm.sh claude-swarm.yml



\# Main architect can delegate to specialized teams:

> "Implement user authentication with JWT tokens"

> "Create a responsive dashboard UI"

> "Set up PostgreSQL database schema"

```



\### \*\*YOLO Mode (High Risk/High Speed)\*\*

```bash

\# For rapid prototyping (⚠️ USE WITH CAUTION)

./init-project.sh prototype yolo

cd projects/prototype



\# Start autonomous swarm

../../claude-swarm.sh claude-swarm.yml vibe



\# Agents work with full permissions:

> "Build a complete social media app with user posts, comments, and authentication"

```



\### \*\*Research \& Analysis\*\*

```bash

\# Initialize research project

./init-project.sh market-analysis research

cd projects/market-analysis



\# Start research team

../../claude-swarm.sh claude-swarm.yml



\# Coordinate research tasks:

> "Research current AI coding assistant market and competitive landscape"

> "Analyze technical requirements for our new product"

```



\## \*\*Advanced Configuration\*\*



\### \*\*Custom Swarm Configuration\*\*

```yaml

\# projects/my-app/claude-swarm.yml

version: 1

swarm:

&nbsp; name: "Custom Development Team"

&nbsp; main: senior\_dev

instances:

&nbsp; senior\_dev:

&nbsp;   description: "Senior developer with code review responsibilities"

&nbsp;   directory: .

&nbsp;   model: opus

&nbsp;   connections: \[junior\_dev, tester]

&nbsp;   tools: \[Read, Edit, Bash, Write, WebSearch]

&nbsp;   prompt: "You are a senior developer focused on code quality and mentoring."

&nbsp; 

&nbsp; junior\_dev:

&nbsp;   description: "Junior developer implementing features"

&nbsp;   directory: ./src

&nbsp;   model: sonnet

&nbsp;   tools: \[Edit, Write, Read]

&nbsp;   prompt: "You implement features under senior developer guidance."

&nbsp; 

&nbsp; tester:

&nbsp;   description: "QA engineer writing and running tests"

&nbsp;   directory: ./tests

&nbsp;   model: sonnet

&nbsp;   tools: \[Edit, Write, Bash, Read]

&nbsp;   prompt: "You write comprehensive tests and ensure code quality."

```



\### \*\*Mixed AI Provider Setup\*\*

```yaml

\# Example using both Claude and OpenAI models

version: 1

swarm:

&nbsp; name: "Mixed AI Team"

&nbsp; main: claude\_lead

instances:

&nbsp; claude\_lead:

&nbsp;   description: "Claude lead developer"

&nbsp;   directory: .

&nbsp;   model: opus

&nbsp;   connections: \[gpt\_creative, claude\_backend]

&nbsp;   

&nbsp; gpt\_creative:

&nbsp;   description: "GPT-4 for creative UI/UX tasks"

&nbsp;   provider: openai

&nbsp;   model: gpt-4o

&nbsp;   temperature: 0.7

&nbsp;   directory: ./frontend

&nbsp;   vibe: true  # OpenAI instances default to vibe mode

&nbsp;   

&nbsp; claude\_backend:

&nbsp;   description: "Claude for backend development"

&nbsp;   directory: ./backend

&nbsp;   model: sonnet

&nbsp;   tools: \[Read, Edit, Write, Bash]

```



\## \*\*Security Best Practices\*\*



\### \*\*Safe Development\*\*

1\. \*\*Always use containers\*\* - Never run YOLO mode on your host system

2\. \*\*Regular backups\*\* - Backup your projects directory frequently

3\. \*\*Monitor costs\*\* - Claude Code usage can add up quickly

4\. \*\*Gradual adoption\*\* - Start with basic mode, progress to advanced



\### \*\*YOLO Mode Safety\*\*

```bash

\# Create isolated project

docker run --rm -it \\

&nbsp; -v $(pwd)/sandbox:/workspace/projects \\

&nbsp; claude-swarm-dev /bin/bash



\# Inside container, limited to sandbox directory

claude --dangerously-skip-permissions

```



\### \*\*Environment Isolation\*\*

```bash

\# Production isolation

docker-compose -f docker-compose.prod.yml up -d



\# Development with mounted volumes

docker-compose -f docker-compose.dev.yml up -d

```



\## \*\*Troubleshooting\*\*



\### \*\*Common Issues\*\*



\*\*API Authentication Failures\*\*

```bash

\# Reset Claude authentication

docker-compose exec claude-swarm claude logout

docker-compose exec claude-swarm claude



\# Verify API key in .env file

cat .env | grep ANTHROPIC\_API\_KEY

```



\*\*Container Permission Issues\*\*

```bash

\# Fix file permissions

docker-compose exec claude-swarm sudo chown -R developer:developer /workspace

```



\*\*Swarm Configuration Errors\*\*

```bash

\# Validate YAML syntax

docker-compose exec claude-swarm ruby -e "require 'yaml'; YAML.load\_file('claude-swarm.yml')"



\# Debug swarm initialization

docker-compose exec claude-swarm claude-swarm --config claude-swarm.yml --verbose

```



\*\*Node.js/Ruby Installation Issues\*\*

```bash

\# Rebuild container with no cache

docker-compose build --no-cache



\# Check versions inside container

docker-compose exec claude-swarm node --version

docker-compose exec claude-swarm ruby --version

docker-compose exec claude-swarm claude --version

```



\### \*\*Performance Optimization\*\*



\*\*Reduce Token Usage\*\*

\- Use `sonnet` model for routine tasks

\- Limit tool access per instance

\- Write concise, specific prompts

\- Use streaming mode for long tasks



\*\*Speed Up Development\*\*

\- Cache Docker layers efficiently

\- Use persistent volumes for node\_modules

\- Implement hot-reloading for web apps

\- Set up efficient logging



\## \*\*Cost Management\*\*



\### \*\*Model Selection Strategy\*\*

\- \*\*Opus\*\*: Complex architecture decisions, code reviews

\- \*\*Sonnet\*\*: Feature implementation, routine development  

\- \*\*Haiku\*\*: Simple tasks, documentation



\### \*\*Usage Monitoring\*\*

```bash

\# Check usage logs

docker-compose exec claude-swarm tail -f ~/.claude-swarm/sessions/\*/session.log



\# Monitor API costs in Anthropic Console

\# https://console.anthropic.com/dashboard

```



\### \*\*Efficiency Tips\*\*

1\. \*\*Batch operations\*\* - Group related tasks

2\. \*\*Use plan mode\*\* - Get approval before execution

3\. \*\*Limit scope\*\* - Be specific about requirements

4\. \*\*Regular cleanup\*\* - Remove unused sessions



\## \*\*Advanced Workflows\*\*



\### \*\*CI/CD Integration\*\*

```yaml

\# .github/workflows/claude-swarm.yml

name: Claude Swarm Development

on: \[push, pull\_request]

jobs:

&nbsp; swarm-review:

&nbsp;   runs-on: ubuntu-latest

&nbsp;   container:

&nbsp;     image: your-registry/claude-swarm:latest

&nbsp;   steps:

&nbsp;     - uses: actions/checkout@v3

&nbsp;     - name: Run Claude Code Review

&nbsp;       env:

&nbsp;         ANTHROPIC\_API\_KEY: ${{ secrets.ANTHROPIC\_API\_KEY }}

&nbsp;       run: |

&nbsp;         claude-swarm --config .claude-swarm/ci-review.yml \\

&nbsp;           --prompt "Review this PR for code quality and security issues"

```



\### \*\*Team Collaboration\*\*

```bash

\# Shared development environment

docker-compose -f docker-compose.team.yml up -d



\# Mount shared volumes

volumes:

&nbsp; - team-shared:/workspace/shared

&nbsp; - individual-work:/workspace/personal

```



This environment provides a comprehensive foundation for agentic development with both safety guardrails and high-performance autonomous modes. Start with basic configurations and gradually explore more advanced features as you become comfortable with the tools.

