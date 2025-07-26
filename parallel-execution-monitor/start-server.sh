#!/bin/bash

# CASPER Parallel Execution Monitor - Server Startup Script

cd "$(dirname "$0")"

# Kill any existing server on port 8000
echo "Checking for existing servers..."
if lsof -i :8000 > /dev/null 2>&1; then
    echo "Killing existing server on port 8000..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the server
echo "Starting CASPER Parallel Execution Monitor on http://localhost:8000"
echo ""
echo "Available monitors:"
echo "  - Version 1 (Original): http://localhost:8000/"
echo "  - Version 2 (Force-directed): http://localhost:8000/monitor-v2.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
python3 -m http.server 8000