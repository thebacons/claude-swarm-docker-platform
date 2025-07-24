@echo off
REM Build and Start Enhanced Claude Swarm Platform (Windows)

echo === Building Enhanced Claude Swarm Platform ===
echo.

REM Check for .env file
if not exist .env (
    echo Error: .env file not found!
    echo Creating .env template...
    (
        echo # Anthropic API Configuration
        echo ANTHROPIC_API_KEY=your-api-key-here
        echo.
        echo # Optional: Linear API for task management
        echo LINEAR_API_KEY=
        echo.
        echo # Optional: GitHub PAT for repository operations
        echo GITHUB_PAT_KEY=
        echo.
        echo # Container Configuration
        echo AUTO_UPDATE_CLAUDE=false
        echo.
        echo # Database Configuration
        echo POSTGRES_USER=claude
        echo POSTGRES_PASSWORD=claude_secure_password
        echo POSTGRES_DB=claude_orchestration
    ) > .env
    echo .env template created. Please add your API key.
    pause
    exit /b 1
)

REM Create necessary directories
echo Creating directory structure...
if not exist logs\policeman mkdir logs\policeman
if not exist logs\developer-1 mkdir logs\developer-1
if not exist logs\developer-2 mkdir logs\developer-2
if not exist logs\tester mkdir logs\tester
if not exist dashboard\dist mkdir dashboard\dist
if not exist scripts mkdir scripts

REM Stop existing containers
echo.
echo Stopping existing containers...
docker-compose -f docker-compose.enhanced.yml down

REM Build the enhanced image
echo.
echo Building enhanced Docker image...
docker-compose -f docker-compose.enhanced.yml build

if errorlevel 1 (
    echo.
    echo Error: Docker build failed!
    echo Please check Docker Desktop is running.
    pause
    exit /b 1
)

REM Start the services
echo.
echo Starting services...
docker-compose -f docker-compose.enhanced.yml up -d

REM Wait for services
echo.
echo Waiting for services to initialize...
timeout /t 10 /nobreak > nul

REM Check service status
echo.
echo === Service Status ===
docker-compose -f docker-compose.enhanced.yml ps

REM Display access information
echo.
echo === Access Information ===
echo Dashboard: http://localhost:3000
echo Policeman Shell: docker exec -it claude-policeman /bin/bash
echo Developer-1 Shell: docker exec -it claude-developer-1 /bin/bash
echo Redis CLI: docker exec -it claude-redis redis-cli
echo PostgreSQL: docker exec -it claude-postgres psql -U claude -d claude_orchestration

echo.
echo === Next Steps ===
echo 1. Test health: docker exec claude-policeman /workspace/scripts/health-check.sh
echo 2. Run hook test: test-container-hooks.bat
echo 3. View logs: docker-compose -f docker-compose.enhanced.yml logs -f

echo.
pause