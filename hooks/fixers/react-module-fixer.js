#!/usr/bin/env node
// Auto-fixer for React module issues

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: react-module-fixer.js <file-path>');
    process.exit(1);
}

console.log(`[FIXER] Processing ${filePath}...`);

let content = fs.readFileSync(filePath, 'utf8');
let modified = false;

// Fix 1: Convert ES6 imports to browser-compatible format
if (content.includes('import React') && content.includes('useState')) {
    console.log('[FIXER] Converting ES6 imports to browser format...');
    
    // Remove import statements
    content = content.replace(/import\s+React(?:,\s*{[^}]+})?\s+from\s+['"]react['"];?\n?/g, '');
    content = content.replace(/import\s+{[^}]+}\s+from\s+['"]react['"];?\n?/g, '');
    
    // Add React destructuring at the top
    const hooks = [];
    if (content.includes('useState')) hooks.push('useState');
    if (content.includes('useEffect')) hooks.push('useEffect');
    if (content.includes('useContext')) hooks.push('useContext');
    if (content.includes('useReducer')) hooks.push('useReducer');
    
    if (hooks.length > 0) {
        content = `// React hooks for browser usage\nconst { ${hooks.join(', ')} } = React;\n\n` + content;
    }
    
    modified = true;
}

// Fix 2: Remove export statements for script tag usage
if (content.includes('export default')) {
    console.log('[FIXER] Removing ES6 export statements...');
    
    // Extract component name
    const exportMatch = content.match(/export\s+default\s+(\w+)/);
    if (exportMatch) {
        const componentName = exportMatch[1];
        
        // Remove export statement
        content = content.replace(/export\s+default\s+\w+;?\n?/g, '');
        
        // Add global assignment for browser access (optional)
        if (!content.includes(`window.${componentName}`)) {
            content += `\n// Make component available globally\nif (typeof window !== 'undefined') {\n  window.${componentName} = ${componentName};\n}\n`;
        }
    }
    
    modified = true;
}

// Fix 3: Convert module.exports to browser format
if (content.includes('module.exports')) {
    console.log('[FIXER] Converting CommonJS exports...');
    content = content.replace(/module\.exports\s*=\s*(\w+);?/g, (match, name) => {
        return `// Component made available globally\nif (typeof window !== 'undefined') {\n  window.${name} = ${name};\n}`;
    });
    modified = true;
}

// Fix 4: Ensure React is used properly in JSX
if (content.includes('useState(') && !content.includes('React.useState')) {
    // Check if we already added destructuring
    if (!content.includes('const { useState }')) {
        console.log('[FIXER] Fixing standalone hook usage...');
        // Replace standalone hook calls
        content = content.replace(/\buseState\(/g, 'React.useState(');
        content = content.replace(/\buseEffect\(/g, 'React.useEffect(');
        content = content.replace(/\buseContext\(/g, 'React.useContext(');
        modified = true;
    }
}

// Fix 5: Add missing React import for JSX
if (content.includes('<') && content.includes('>') && !content.includes('React') && !content.includes('pragma')) {
    console.log('[FIXER] Adding React for JSX usage...');
    content = '/* global React */\n' + content;
    modified = true;
}

if (modified) {
    // Create backup
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
    console.log(`[FIXER] Created backup at ${backupPath}`);
    
    // Write fixed content
    fs.writeFileSync(filePath, content);
    console.log('[FIXER] ✅ File fixed successfully!');
    
    // Log success
    const successDir = '/mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/.claude-code/validation-success';
    fs.mkdirSync(successDir, { recursive: true });
    fs.writeFileSync(path.join(successDir, path.basename(filePath) + '.fixed'), 'Fixed at ' + new Date().toISOString());
} else {
    console.log('[FIXER] No fixes needed');
}

// Now run validation again
const { execSync } = require('child_process');
try {
    execSync(`bash /mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/hooks/validators/react-check.sh "${filePath}"`, { stdio: 'inherit' });
    console.log('[FIXER] ✅ Validation passed after fixes!');
} catch (e) {
    console.error('[FIXER] ❌ Validation still failing after fixes');
    process.exit(1);
}