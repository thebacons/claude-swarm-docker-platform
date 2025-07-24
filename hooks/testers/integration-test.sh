#\!/bin/bash
# Integration test for complete projects
# Tests that all components work together

PROJECT_DIR="$1"

if [ -z "$PROJECT_DIR" ]; then
    echo "[INTEGRATION-TEST] Error: No project directory specified"
    exit 1
fi

echo "[INTEGRATION-TEST] Testing project integration: $PROJECT_DIR"

# Check if it's a web project
if [ \! -f "$PROJECT_DIR/index.html" ] && [ \! -f "$PROJECT_DIR/test-app.html" ]; then
    echo "[INTEGRATION-TEST] Not a web project, skipping..."
    exit 0
fi

# Find main HTML file
HTML_FILE=""
if [ -f "$PROJECT_DIR/test-app.html" ]; then
    HTML_FILE="$PROJECT_DIR/test-app.html"
elif [ -f "$PROJECT_DIR/index.html" ]; then
    HTML_FILE="$PROJECT_DIR/index.html"
fi

echo "[INTEGRATION-TEST] Using HTML file: $(basename $HTML_FILE)"

# Create test runner
TEST_RUNNER="/tmp/integration-test-$$.js"
cat > "$TEST_RUNNER" << 'EOFINNER'
const fs = require('fs');
const path = require('path');

// Simple HTML parser to extract script sources
function extractScriptSources(htmlContent) {
    const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*>/g;
    const inlineScriptRegex = /<script[^>]*type="text\/babel"[^>]*>([\s\S]*?)<\/script>/g;
    
    const sources = [];
    let match;
    
    // External scripts
    while ((match = scriptRegex.exec(htmlContent)) !== null) {
        if (!match[1].startsWith('http')) {
            sources.push(match[1]);
        }
    }
    
    return sources;
}

// Check if components can work together
function checkIntegration(projectDir, htmlFile) {
    console.log('[INTEGRATION-TEST] Checking component integration...');
    
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    const scriptFiles = extractScriptSources(htmlContent);
    
    const components = new Map();
    const dependencies = new Map();
    
    // Analyze each script file
    scriptFiles.forEach(file => {
        const filePath = path.join(projectDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Find component definitions
            const componentMatches = content.match(/(?:function < /dev/null | const|class)\s+([A-Z]\w+)/g) || [];
            componentMatches.forEach(match => {
                const name = match.replace(/^(function|const|class)\s+/, '');
                components.set(name, file);
            });
            
            // Find component usage
            const usageMatches = content.match(/<([A-Z]\w+)/g) || [];
            usageMatches.forEach(match => {
                const name = match.substring(1);
                if (\!dependencies.has(file)) {
                    dependencies.set(file, new Set());
                }
                dependencies.get(file).add(name);
            });
        }
    });
    
    // Check for missing dependencies
    let errors = 0;
    dependencies.forEach((deps, file) => {
        deps.forEach(dep => {
            if (\!components.has(dep) && \!['React', 'Fragment', 'StrictMode'].includes(dep)) {
                console.error(`[ERROR] Component '${dep}' used in ${file} but not defined`);
                errors++;
            }
        });
    });
    
    // Check module system consistency
    let hasImports = false;
    let hasBabel = htmlContent.includes('type="text/babel"');
    
    scriptFiles.forEach(file => {
        const filePath = path.join(projectDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.match(/^import\s+/m) || content.match(/^export\s+/m)) {
                hasImports = true;
            }
        }
    });
    
    if (hasImports && hasBabel) {
        console.error('[ERROR] ES6 imports found with babel script loader');
        errors++;
    }
    
    return errors === 0;
}

// Main test
const projectDir = process.argv[2];
const htmlFile = process.argv[3];

try {
    const success = checkIntegration(projectDir, htmlFile);
    
    if (success) {
        console.log('[INTEGRATION-TEST] ✅ All components properly integrated');
        process.exit(0);
    } else {
        console.log('[INTEGRATION-TEST] ❌ Integration issues found');
        process.exit(1);
    }
} catch (error) {
    console.error('[INTEGRATION-TEST] Error:', error.message);
    process.exit(1);
}
EOFINNER

# Run the test
node "$TEST_RUNNER" "$PROJECT_DIR" "$HTML_FILE"
RESULT=$?

# Cleanup
rm -f "$TEST_RUNNER"

if [ $RESULT -eq 0 ]; then
    echo "[INTEGRATION-TEST] ✅ Integration test PASSED"
else
    echo "[INTEGRATION-TEST] ❌ Integration test FAILED"
fi

exit $RESULT
