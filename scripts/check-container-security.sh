#!/bin/bash
# Container Security Check Script

echo "=== Container Security Check ==="
echo ""

# Check if .env exists and is not in git
echo "1. Checking .env file security..."
if [ -f .env ]; then
    echo "✓ .env file exists"
    
    # Check if it's in .gitignore
    if grep -q "^\.env$" .gitignore; then
        echo "✓ .env is in .gitignore"
    else
        echo "✗ WARNING: .env is NOT in .gitignore!"
    fi
    
    # Check if it's tracked by git
    if git ls-files | grep -q "^\.env$"; then
        echo "✗ CRITICAL: .env is tracked by git!"
    else
        echo "✓ .env is not tracked by git"
    fi
else
    echo "✗ .env file not found"
fi

echo ""
echo "2. Checking container environment variables..."

# Check each container for secrets
for container in claude-policeman claude-developer-1 claude-developer-2 claude-tester; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        echo ""
        echo "Container: $container"
        
        # Check for GitHub PAT
        if docker exec $container printenv GITHUB_PAT_KEY &>/dev/null; then
            echo "✓ GITHUB_PAT_KEY is set"
        else
            echo "✗ GITHUB_PAT_KEY is not set"
        fi
        
        # Check for Anthropic API key
        if docker exec $container printenv ANTHROPIC_API_KEY &>/dev/null; then
            echo "✓ ANTHROPIC_API_KEY is set"
        else
            echo "✗ ANTHROPIC_API_KEY is not set"
        fi
        
        # Check if .env is mounted
        if docker exec $container test -f /workspace/.env; then
            echo "✓ .env file is mounted"
            
            # Check if it's read-only
            if docker exec $container touch /workspace/.env 2>/dev/null; then
                echo "✗ WARNING: .env is writable (should be read-only)"
            else
                echo "✓ .env is read-only"
            fi
        else
            echo "✗ .env file is not mounted"
        fi
    else
        echo "- Container $container is not running"
    fi
done

echo ""
echo "3. Checking for exposed secrets in files..."

# Check for exposed secrets in non-.env files
exposed_count=0

# Check for GitHub PAT
if grep -r "github_pat_11" . --exclude-dir=.git --exclude=".env" 2>/dev/null | grep -v "\.md:" | grep -v "\.txt:" | wc -l | grep -q "^0$"; then
    echo "✓ No GitHub PAT found in code files"
else
    echo "✗ WARNING: GitHub PAT might be exposed in code files"
    exposed_count=$((exposed_count + 1))
fi

# Check for Anthropic key
if grep -r "sk-ant-api" . --exclude-dir=.git --exclude=".env" 2>/dev/null | grep -v "\.md:" | grep -v "example" | wc -l | grep -q "^0$"; then
    echo "✓ No Anthropic API key found in code files"
else
    echo "✗ WARNING: Anthropic API key might be exposed in code files"
    exposed_count=$((exposed_count + 1))
fi

echo ""
echo "4. Security Summary:"
echo "-------------------"

if [ $exposed_count -eq 0 ]; then
    echo "✓ All secrets appear to be properly secured"
else
    echo "✗ Found $exposed_count potential security issues"
fi

echo ""
echo "Recommendations:"
echo "- Always use environment variables or mounted .env files"
echo "- Never hardcode secrets in Dockerfiles or code"
echo "- Rotate secrets regularly"
echo "- Use 'docker-compose restart' after updating .env"
echo ""