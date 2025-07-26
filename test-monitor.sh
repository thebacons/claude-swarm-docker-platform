#!/bin/bash
# Start the CASPER Parallel Execution Monitor

echo "🚀 Starting CASPER Parallel Execution Monitor..."

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Using Python HTTP server..."
    cd parallel-execution-monitor
    echo "📊 Monitor available at: http://localhost:8001"
    echo "Press Ctrl+C to stop"
    python3 -m http.server 8001
elif command -v npx &> /dev/null; then
    echo "✅ Using Node.js HTTP server..."
    cd parallel-execution-monitor
    echo "📊 Monitor available at: http://localhost:8001"
    echo "Press Ctrl+C to stop"
    npx http-server -p 8001
else
    echo "❌ Error: Neither Python 3 nor Node.js found"
    echo "Please install Python 3 or Node.js to run the monitor"
    exit 1
fi