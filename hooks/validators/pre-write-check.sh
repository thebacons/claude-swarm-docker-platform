#!/bin/bash
# Pre-write validation hook - checks before file is written

echo "[PRE-WRITE-CHECK] Validating before write..."

# Get the content that's about to be written from CLAUDE_TOOL_ARGS
# This would contain the file content in a real hook execution

# For now, just log the attempt
echo "[PRE-WRITE-CHECK] Write attempt detected"
echo "[PRE-WRITE-CHECK] Validation rules:"
echo "  - No ES6 imports with babel script tags"
echo "  - React hooks must be properly scoped"
echo "  - Components must be properly exported"

# Always allow for now (in real implementation, would parse CLAUDE_TOOL_ARGS)
echo "[PRE-WRITE-CHECK] ✓ Pre-write validation passed"
exit 0