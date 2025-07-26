# Claude Code First Run Setup - Solutions

## 🎯 The Issue
When you first run Claude Code in a container, it asks for theme preferences. This is a one-time setup per user.

## ✅ Solutions

### Option 1: Manual Setup (One-Time)
When you SSH in and run `claude` for the first time:
1. Press `1` for Dark mode (or your preference)
2. Press Enter
3. Claude will save your preference and never ask again

### Option 2: Automated Setup
```bash
# When running Claude for the first time, auto-select option 1
echo "1" | claude "Your question here"
```

### Option 3: Pre-configure All Containers
Run this from your host to set up all containers:
```bash
for container in casper-policeman casper-developer-1 casper-developer-2 casper-tester; do
    echo "Setting up $container..."
    docker exec $container bash -c 'echo "1" | claude "test" > /dev/null 2>&1'
done
```

### Option 4: Add to Container Startup
Update the startup script to auto-configure Claude:
```bash
# In startup.sh
if [ ! -f /home/claude/.config/claude-code/.configured ]; then
    echo "1" | claude "test" > /dev/null 2>&1
    touch /home/claude/.config/claude-code/.configured
fi
```

## 🚀 Quick Fix for Your Current Session

Since you're already logged into Policeman:
```bash
# Just run this once
echo "1" | claude "test"

# Now Claude will work normally
claude "Who are you and what is your role?"
```

## 💡 Why This Happens

1. Claude Code stores user preferences in `~/.config/claude-code/`
2. The golden image has Claude Code installed but not user preferences
3. Each user needs to set their theme preference once
4. After initial setup, it never asks again

## 🔧 Permanent Solution for Golden Image

To include this in future golden images, add to the Dockerfile:
```dockerfile
# Pre-configure Claude Code
RUN echo "1" | claude "test" > /dev/null 2>&1 || true
```

## 📝 Current Workaround

For now, when you SSH into any container for the first time:
1. Run: `echo "1" | claude "test"`
2. Then use Claude normally: `claude "Your request"`

Or just type `1` and Enter when prompted - it's a one-time setup!