#!/usr/bin/env node
// Test React component rendering

const fs = require('fs');
const path = require('path');

const componentPath = process.argv[2];
if (!componentPath) {
    console.error('Usage: component-test.js <component-path>');
    process.exit(1);
}

console.log(`[COMPONENT-TEST] Testing ${componentPath}...`);

// Read the component
const componentCode = fs.readFileSync(componentPath, 'utf8');
const componentDir = path.dirname(componentPath);
const componentName = path.basename(componentPath, '.js');

// Create a test HTML file
const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Component Test: ${componentName}</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        #test-status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        #error-details { font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <h1>Component Test: ${componentName}</h1>
    <div id="test-status">Testing...</div>
    <div id="error-details"></div>
    <hr>
    <div id="root"></div>
    
    <script>
        // Error handler
        window.addEventListener('error', function(e) {
            document.getElementById('test-status').className = 'error';
            document.getElementById('test-status').textContent = 'Error: ' + e.message;
            document.getElementById('error-details').textContent = e.stack || '';
            console.error('Component test failed:', e);
        });
    </script>
    
    <!-- Component code -->
    <script>
${componentCode}
    </script>
    
    <!-- Test runner -->
    <script>
        try {
            // Find the component
            let Component = null;
            
            // Check common patterns
            if (typeof App !== 'undefined') Component = App;
            else if (typeof ${componentName} !== 'undefined') Component = ${componentName};
            else if (typeof Counter !== 'undefined') Component = Counter;
            else if (typeof TodoItem !== 'undefined') Component = TodoItem;
            
            if (!Component) {
                // Try to find any function that looks like a component
                for (let key in window) {
                    if (typeof window[key] === 'function' && /^[A-Z]/.test(key) && key !== 'React') {
                        Component = window[key];
                        break;
                    }
                }
            }
            
            if (!Component) {
                throw new Error('No React component found. Make sure component is defined and accessible.');
            }
            
            // Try to render
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(Component));
            
            // If we get here, rendering succeeded
            document.getElementById('test-status').className = 'success';
            document.getElementById('test-status').textContent = '✅ Component rendered successfully!';
            console.log('[COMPONENT-TEST] Success: Component rendered without errors');
            
        } catch (error) {
            document.getElementById('test-status').className = 'error';
            document.getElementById('test-status').textContent = '❌ Render failed: ' + error.message;
            document.getElementById('error-details').textContent = error.stack;
            console.error('[COMPONENT-TEST] Failed:', error);
        }
    </script>
</body>
</html>`;

// Write test file
const testPath = path.join(componentDir, `test-${componentName}.html`);
fs.writeFileSync(testPath, testHtml);
console.log(`[COMPONENT-TEST] Created test file: ${testPath}`);

// Create a validation report
const report = {
    component: componentPath,
    testFile: testPath,
    timestamp: new Date().toISOString(),
    instructions: `Open ${testPath} in a browser to see if the component renders correctly`
};

const reportPath = '/mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/.claude-code/test-reports';
fs.mkdirSync(reportPath, { recursive: true });
fs.writeFileSync(
    path.join(reportPath, `${componentName}-report.json`),
    JSON.stringify(report, null, 2)
);

console.log('[COMPONENT-TEST] ✅ Test harness created');
console.log(`[COMPONENT-TEST] To verify: Open ${testPath} in your browser`);

// Try to detect obvious issues without browser
if (componentCode.includes('import') && componentCode.includes('export')) {
    console.warn('[COMPONENT-TEST] ⚠️  Warning: ES6 modules detected - may not work in test harness');
    console.warn('[COMPONENT-TEST] Consider running fixer: node /mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/hooks/fixers/react-module-fixer.js ' + componentPath);
}