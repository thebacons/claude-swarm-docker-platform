#!/usr/bin/env node
// Integration test for complete projects

const fs = require('fs');
const path = require('path');

// Simple HTML parser to extract script sources
function extractScriptSources(htmlContent) {
    const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*>/g;
    const sources = [];
    let match;
    
    while ((match = scriptRegex.exec(htmlContent)) !== null) {
        if (!match[1].startsWith('http')) {
            sources.push(match[1]);
        }
    }
    
    return sources;
}

// Check if components can work together
function checkIntegration(projectDir) {
    console.log('[INTEGRATION-TEST] Checking component integration...');
    
    // Find HTML file
    let htmlFile = null;
    if (fs.existsSync(path.join(projectDir, 'test-app.html'))) {
        htmlFile = path.join(projectDir, 'test-app.html');
    } else if (fs.existsSync(path.join(projectDir, 'index.html'))) {
        htmlFile = path.join(projectDir, 'index.html');
    } else {
        console.log('[INTEGRATION-TEST] No HTML file found');
        return false;
    }
    
    console.log('[INTEGRATION-TEST] Using HTML file:', path.basename(htmlFile));
    
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    const scriptFiles = extractScriptSources(htmlContent);
    
    console.log('[INTEGRATION-TEST] Found script files:', scriptFiles);
    
    const components = new Map();
    const dependencies = new Map();
    
    // Analyze each script file
    scriptFiles.forEach(file => {
        const filePath = path.join(projectDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Find component definitions
            const componentRegex = /(?:function|const|class)\s+([A-Z]\w+)/g;
            let match;
            while ((match = componentRegex.exec(content)) !== null) {
                components.set(match[1], file);
                console.log(`  - Found component '${match[1]}' in ${file}`);
            }
            
            // Find component usage
            const usageRegex = /<([A-Z]\w+)/g;
            while ((match = usageRegex.exec(content)) !== null) {
                const componentName = match[1];
                if (!dependencies.has(file)) {
                    dependencies.set(file, new Set());
                }
                dependencies.get(file).add(componentName);
            }
        }
    });
    
    // Check for missing dependencies
    let errors = 0;
    dependencies.forEach((deps, file) => {
        deps.forEach(dep => {
            if (!components.has(dep) && !['React', 'Fragment', 'StrictMode', 'Suspense'].includes(dep)) {
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
                console.log(`[WARNING] ES6 modules found in ${file}`);
            }
        }
    });
    
    if (hasImports && hasBabel) {
        console.error('[ERROR] ES6 imports found with babel script loader');
        errors++;
    }
    
    // Check if components are globally accessible
    if (hasBabel) {
        components.forEach((file, name) => {
            const filePath = path.join(projectDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            if (!content.includes(`window.${name}`)) {
                console.log(`[WARNING] Component '${name}' may not be globally accessible`);
            }
        });
    }
    
    return errors === 0;
}

// Main
const projectDir = process.argv[2];

if (!projectDir) {
    console.error('[INTEGRATION-TEST] Usage: node run-integration-test.js <project-dir>');
    process.exit(1);
}

console.log('[INTEGRATION-TEST] Testing project:', projectDir);

try {
    const success = checkIntegration(projectDir);
    
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