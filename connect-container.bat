@echo off
REM Quick Container Connection Script

echo === Claude Swarm Container Access ===
echo.
echo Select a container to connect to:
echo 1. Policeman (Orchestrator)
echo 2. Developer 1
echo 3. Developer 2
echo 4. Tester
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo Connecting to Policeman container...
    docker exec -it claude-policeman /bin/bash
) else if "%choice%"=="2" (
    echo Connecting to Developer 1 container...
    docker exec -it claude-developer-1 /bin/bash
) else if "%choice%"=="3" (
    echo Connecting to Developer 2 container...
    docker exec -it claude-developer-2 /bin/bash
) else if "%choice%"=="4" (
    echo Connecting to Tester container...
    docker exec -it claude-tester /bin/bash
) else if "%choice%"=="5" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice!
    pause
)

REM Return to menu after disconnecting
echo.
echo Disconnected from container.
pause
call %0