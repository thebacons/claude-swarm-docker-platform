#!/bin/bash

echo "=== Health Check ==="

# Check API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "WARNING: ANTHROPIC_API_KEY not set"
    exit 1
fi

# Test Python SDK
python3 -c "import anthropic; print('✓ Anthropic SDK available')" 2>/dev/null || echo "✗ Anthropic SDK error"

# Test swarm dependencies
python3 -c "import yaml; print('✓ YAML support available')" 2>/dev/null || echo "✗ YAML module missing"
python3 -c "import redis; print('✓ Redis module available')" 2>/dev/null || echo "✗ Redis module missing"
python3 -c "import psycopg2; print('✓ PostgreSQL module available')" 2>/dev/null || echo "✗ PostgreSQL module missing"

# Test network connectivity
if command -v curl &> /dev/null; then
    curl -s -o /dev/null -w "✓ Network connectivity OK\n" https://api.anthropic.com 2>/dev/null || echo "✗ Network error"
fi

# Test Redis connection (if configured)
if [ ! -z "$REDIS_HOST" ]; then
    python3 -c "
import os
try:
    import redis
    r = redis.Redis(host=os.environ.get('REDIS_HOST', 'localhost'), 
                    password=os.environ.get('REDIS_PASSWORD', ''))
    r.ping()
    print('✓ Redis connection OK')
except:
    print('✗ Redis connection failed')
" 2>/dev/null || echo "✗ Redis module not installed"
fi

# Test PostgreSQL connection (if configured)
if [ ! -z "$POSTGRES_HOST" ]; then
    python3 -c "
import os
try:
    import psycopg2
    conn = psycopg2.connect(
        host=os.environ.get('POSTGRES_HOST', 'localhost'),
        database=os.environ.get('POSTGRES_DB', 'claude_orchestration'),
        user=os.environ.get('POSTGRES_USER', 'claude'),
        password=os.environ.get('POSTGRES_PASSWORD', '')
    )
    conn.close()
    print('✓ PostgreSQL connection OK')
except:
    print('✗ PostgreSQL connection failed')
" 2>/dev/null || echo "✗ PostgreSQL module not installed"
fi

# Check swarm orchestrator
if [ -f /workspace/scripts/swarm-orchestrator.py ]; then
    echo "✓ Swarm orchestrator available"
else
    echo "✗ Swarm orchestrator not found"
fi

# Test file permissions
touch /workspace/test-write 2>/dev/null && rm /workspace/test-write && echo "✓ Write permissions OK" || echo "✗ Write permission error"

echo "=== Health Check Complete ==="