# SSH Access Clarification for CASPER Golden Image

## 🔑 Correct User Credentials

### Golden Image User Details:
- **Username**: `claude` (NOT developer)
- **Default Password**: None set (you need to set it)
- **Home Directory**: `/home/claude`
- **Shell**: `/bin/bash`
- **Sudo Access**: Yes (NOPASSWD configured)

## 📝 Setting Up SSH Access

### Step 1: Set Password for claude User
```bash
# Access the container
docker exec -it casper-policeman /bin/bash

# Set password for claude user (you choose the password)
sudo passwd claude
# Enter new password: [your-choice]
# Retype new password: [your-choice]

# Or set it to match the original setup
echo "claude:claude" | sudo chpasswd
```

### Step 2: Install and Start SSH Service
```bash
# Inside the container
sudo apt-get update
sudo apt-get install -y openssh-server

# Start SSH service
sudo service ssh start

# Enable SSH to start on boot (optional)
sudo systemctl enable ssh
```

### Step 3: Add Port Mapping
Edit `docker-compose.golden.yml` to add SSH ports:

```yaml
  policeman:
    image: casper-golden:fixed
    container_name: casper-policeman
    ports:
      - "8080:8080"
      - "8081:8081"
      - "2222:22"    # SSH for Policeman
  
  developer-1:
    image: casper-golden:fixed
    container_name: casper-developer-1
    ports:
      - "2223:22"    # SSH for Developer 1
  
  developer-2:
    image: casper-golden:fixed
    container_name: casper-developer-2
    ports:
      - "2224:22"    # SSH for Developer 2
  
  tester:
    image: casper-golden:fixed
    container_name: casper-tester
    ports:
      - "2225:22"    # SSH for Tester
```

### Step 4: Restart Containers
```bash
docker-compose -f docker-compose.golden.yml down
docker-compose -f docker-compose.golden.yml up -d
```

## 🖥️ PuTTY Connection Settings

### For Each Container:

**CASPER-Policeman:**
- Host: `localhost`
- Port: `2222`
- Username: `claude`
- Password: [what you set above]

**CASPER-Developer-1:**
- Host: `localhost`
- Port: `2223`
- Username: `claude`
- Password: [same as above]

**CASPER-Developer-2:**
- Host: `localhost`
- Port: `2224`
- Username: `claude`
- Password: [same as above]

**CASPER-Tester:**
- Host: `localhost`
- Port: `2225`
- Username: `claude`
- Password: [same as above]

## 🚀 Quick Setup Script

Create this script to automate SSH setup in all containers:

```bash
#!/bin/bash
# setup-ssh-all.sh

# Set password for all containers
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    echo "Setting up SSH in $container..."
    docker exec $container bash -c '
        echo "claude:claude" | sudo chpasswd
        sudo apt-get update -qq
        sudo apt-get install -y openssh-server -qq
        sudo service ssh start
        echo "SSH enabled for $container"
    '
done

echo "All containers now have SSH enabled!"
echo "Username: claude"
echo "Password: claude"
```

## 📋 Summary Table

| Container | Docker Name | SSH Port | Username | Default Password |
|-----------|------------|----------|----------|------------------|
| Policeman | casper-policeman | 2222 | claude | (you set it) |
| Developer 1 | casper-developer-1 | 2223 | claude | (you set it) |
| Developer 2 | casper-developer-2 | 2224 | claude | (you set it) |
| Tester | casper-tester | 2225 | claude | (you set it) |

## 💡 Important Notes

1. **User Difference**: The golden image uses `claude` user, not `developer`
2. **Password**: No default password - you must set it
3. **Consistency**: I recommend using password `claude` to match the username
4. **SSH Not Pre-installed**: The golden image doesn't have SSH server by default
5. **Alternative**: Docker exec is still the easiest method for access

## 🔐 Security Best Practice

For production, use SSH keys instead of passwords:

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -f ~/.ssh/casper_key

# Copy public key to container
docker exec -it casper-policeman mkdir -p /home/claude/.ssh
docker cp ~/.ssh/casper_key.pub casper-policeman:/home/claude/.ssh/authorized_keys
docker exec casper-policeman chown -R claude:claude /home/claude/.ssh
docker exec casper-policeman chmod 600 /home/claude/.ssh/authorized_keys

# Connect with key
ssh -i ~/.ssh/casper_key claude@localhost -p 2222
```