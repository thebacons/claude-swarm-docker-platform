#!/bin/bash
# React-specific validation hook

FILE_PATH="$1"
echo "[REACT-CHECK] Validating React patterns in: $FILE_PATH"

# Check if it's actually a React file
if ! grep -q "React\|react" "$FILE_PATH"; then
    echo "[REACT-CHECK] Not a React file, skipping"
    exit 0
fi

# Create React validation script
VALIDATOR="/tmp/react-validator-$$.js"
cat > "$VALIDATOR" << 'EOF'
const fs = require('fs');
const filePath = process.argv[2];
const content = fs.readFileSync(filePath, 'utf8');
const fileName = require('path').basename(filePath);

console.log('[REACT-CHECK] Analyzing React patterns...');

// Error tracking
let errors = [];
let warnings = [];

// Check 1: Module system compatibility
if (content.includes('export default') || content.includes('import ')) {
    // ES6 modules detected
    const htmlPath = filePath.replace(/\.jsx?$/, '.html');
    try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        if (html.includes('type="text/babel"') && !html.includes('type="module"')) {
            errors.push('ES6 modules used with babel script loader - will fail!');
            errors.push('Solution: Convert to UMD format or use module script type');
        }
    } catch (e) {
        warnings.push('Could not find corresponding HTML file to check script loading');
    }
}

// Check 2: React hook usage
const hookPattern = /\b(useState|useEffect|useContext|useReducer|useMemo|useCallback)\(/g;
const hooks = content.match(hookPattern);
if (hooks) {
    // Check if React is properly imported/available
    if (!content.includes('React.use') && !content.includes('import') && !content.includes('require')) {
        errors.push('React hooks used without proper React import/reference');
        errors.push('Solution: Add "const { useState, useEffect } = React;" at the top');
    }
    
    // Check if hooks are used inside component
    if (!content.match(/function\s+\w+\s*\(|const\s+\w+\s*=\s*\(/)) {
        warnings.push('Hooks found but no clear component definition');
    }
}

// Check 3: Component definition and export
const componentPattern = /(?:function|const)\s+([A-Z]\w+)/g;
const components = content.match(componentPattern);
if (components && components.length > 0) {
    const componentName = components[0].match(/(?:function|const)\s+([A-Z]\w+)/)[1];
    
    // Check if component is exported (for ES6)
    if (content.includes('import') && !content.includes(`export default ${componentName}`) && !content.includes('export {')) {
        warnings.push(`Component ${componentName} defined but not exported`);
    }
    
    // Check if using JSX without React in scope
    if (content.includes('<') && content.includes('>') && !content.includes('React.createElement')) {
        if (!content.includes('import React') && !content.includes('React')) {
            errors.push('JSX used without React in scope');
            errors.push('Solution: Ensure React is available globally or imported');
        }
    }
}

// Check 4: For browser-based React (no build tools)
if (!content.includes('import') && !content.includes('require')) {
    // This is meant for direct browser usage
    if (content.includes('export')) {
        errors.push('Using export statements without module system');
        errors.push('Solution: Remove export statements for script tag usage');
    }
    
    // Check if trying to use destructured imports
    if (content.match(/const\s*{\s*\w+\s*}\s*=\s*require/)) {
        errors.push('CommonJS require found - not available in browser');
        errors.push('Solution: Use global React object');
    }
}

// Report results
if (errors.length > 0) {
    console.error('[REACT-CHECK] ❌ Validation FAILED:');
    errors.forEach(err => console.error('  ERROR:', err));
    process.exit(1);
}

if (warnings.length > 0) {
    console.log('[REACT-CHECK] ⚠️  Warnings:');
    warnings.forEach(warn => console.log('  WARNING:', warn));
}

console.log('[REACT-CHECK] ✅ React patterns valid');
EOF

# Run validation
node "$VALIDATOR" "$FILE_PATH"
RESULT=$?

# Cleanup
rm -f "$VALIDATOR"

if [ $RESULT -ne 0 ]; then
    echo "[REACT-CHECK] Creating error report for fixer..."
    mkdir -p /mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/.claude-code/validation-errors
    echo "React validation failed for $FILE_PATH" > "/mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/.claude-code/validation-errors/react-$(basename $FILE_PATH).error"
fi

exit $RESULT