@echo off
REM Enable SSH in existing running container

echo === Enabling SSH in Running Container ===
echo.

REM Install SSH in the running policeman container
echo Installing SSH server in claude-policeman container...
docker exec -u root claude-policeman bash -c "apt-get update && apt-get install -y openssh-server && service ssh start"

REM Configure SSH
echo Configuring SSH...
docker exec -u root claude-policeman bash -c "echo 'developer:claude' | chpasswd"
docker exec -u root claude-policeman bash -c "sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config"
docker exec -u root claude-policeman bash -c "sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config"
docker exec -u root claude-policeman bash -c "mkdir -p /var/run/sshd"

REM Start SSH service
echo Starting SSH service...
docker exec -u root claude-policeman bash -c "service ssh restart"

REM Get container IP
echo.
echo Getting container IP address...
for /f "tokens=*" %%i in ('docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" claude-policeman') do set CONTAINER_IP=%%i

echo.
echo === SSH Enabled ===
echo.
echo Container IP: %CONTAINER_IP%
echo.
echo Since port 22 is not exposed, you have two options:
echo.
echo Option 1 - Use docker exec (recommended):
echo   docker exec -it claude-policeman /bin/bash
echo.
echo Option 2 - Create port forwarding:
echo   docker stop claude-policeman
echo   docker commit claude-policeman claude-policeman-ssh
echo   docker run -d -p 2222:22 --name claude-ssh claude-policeman-ssh
echo.
echo Then connect with PuTTY to localhost:2222
echo.
pause