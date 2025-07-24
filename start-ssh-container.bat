@echo off
REM Start SSH-enabled Container for PuTTY Access

echo === Starting SSH-enabled Claude Container ===
echo.

REM Build the SSH-enabled image
echo Building SSH-enabled image...
docker build -f Dockerfile.ssh -t claude-swarm-ssh . 2>nul

if errorlevel 1 (
    echo.
    echo Failed to build SSH image. Building from enhanced Dockerfile first...
    
    REM First build the base image
    docker build -f Dockerfile.enhanced -t claude-swarm-base .
    
    REM Create a simpler SSH Dockerfile
    (
        echo FROM claude-swarm-base
        echo USER root
        echo RUN apt-get update ^&^& apt-get install -y openssh-server ^&^& rm -rf /var/lib/apt/lists/*
        echo RUN mkdir /var/run/sshd
        echo RUN echo 'developer:claude' ^| chpasswd
        echo RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
        echo RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
        echo EXPOSE 22
        echo RUN echo '#!/bin/bash' ^> /start-ssh.sh
        echo RUN echo 'service ssh start' ^>^> /start-ssh.sh
        echo RUN echo 'exec /workspace/scripts/startup.sh' ^>^> /start-ssh.sh
        echo RUN chmod +x /start-ssh.sh
        echo USER developer
        echo ENTRYPOINT ["/bin/bash", "-c", "sudo /start-ssh.sh && /bin/bash"]
    ) > Dockerfile.ssh-simple
    
    docker build -f Dockerfile.ssh-simple -t claude-swarm-ssh .
)

REM Stop any existing SSH container
echo.
echo Stopping any existing SSH container...
docker stop claude-ssh 2>nul
docker rm claude-ssh 2>nul

REM Run the SSH container
echo.
echo Starting SSH container on port 2222...
docker run -d ^
    --name claude-ssh ^
    -p 2222:22 ^
    -p 8082:8080 ^
    -e ANTHROPIC_API_KEY=%ANTHROPIC_API_KEY% ^
    -v "%cd%/projects:/workspace/projects" ^
    -v "%cd%/hooks:/workspace/hooks:ro" ^
    --network claude-swarm-docker-spawn_claude-net ^
    claude-swarm-ssh

if errorlevel 1 (
    echo.
    echo Failed to start container!
    pause
    exit /b 1
)

REM Wait for SSH to start
echo.
echo Waiting for SSH service to start...
timeout /t 5 /nobreak > nul

REM Test SSH connection
echo.
echo Testing SSH connection...
echo | ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 developer@localhost -p 2222 echo "SSH connection successful!" 2>nul

if errorlevel 1 (
    echo.
    echo SSH service is starting up. Please wait a moment and try again.
    echo.
    echo You can also check the container logs:
    echo docker logs claude-ssh
) else (
    echo SSH connection test successful!
)

echo.
echo === SSH Container Ready ===
echo.
echo PuTTY Connection Details:
echo   Host: localhost
echo   Port: 2222
echo   Username: developer
echo   Password: claude
echo.
echo Command Line SSH:
echo   ssh developer@localhost -p 2222
echo.
echo To stop the SSH container:
echo   docker stop claude-ssh
echo.
pause