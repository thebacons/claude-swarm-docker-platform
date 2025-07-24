#!/bin/bash
# Syntax validation hook for JavaScript files

FILE_PATH="$1"
echo "[SYNTAX-CHECK] Validating: $FILE_PATH"

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo "[ERROR] File not found: $FILE_PATH"
    exit 1
fi

# Create a temporary file for testing
TEMP_FILE="/tmp/syntax-check-$$.js"

# Basic syntax check using Node.js
cat > "$TEMP_FILE" << 'EOF'
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const content = fs.readFileSync(filePath, 'utf8');

try {
    // Try to parse as a module
    new Function(content);
    console.log('[PASS] Basic syntax is valid');
} catch (error) {
    console.error('[FAIL] Syntax error:', error.message);
    console.error('Line:', error.stack.split('\n')[1]);
    process.exit(1);
}

// Check for common React issues
if (content.includes('import React') && content.includes('script type="text/babel"')) {
    console.error('[FAIL] ES6 imports detected with babel script tag - incompatible!');
    console.error('Fix: Use React.createElement or load React via CDN with UMD build');
    process.exit(1);
}

if (content.includes('useState') && !content.includes('React.useState')) {
    if (!content.includes('import') && !content.includes('require')) {
        console.error('[FAIL] Using useState without importing React');
        console.error('Fix: Use React.useState or const { useState } = React;');
        process.exit(1);
    }
}

console.log('[PASS] React patterns look correct');
EOF

# Run the syntax checker
node "$TEMP_FILE" "$FILE_PATH"
RESULT=$?

# Cleanup
rm -f "$TEMP_FILE"

if [ $RESULT -ne 0 ]; then
    echo "[SYNTAX-CHECK] Validation failed! Fix required."
    
    # Log error for fixer subagent
    mkdir -p /mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/.claude-code/validation-errors
    echo "$FILE_PATH: Syntax validation failed" > "/mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/.claude-code/validation-errors/$(basename $FILE_PATH).error"
    
    exit 1
fi

echo "[SYNTAX-CHECK] ✓ Validation passed"
exit 0