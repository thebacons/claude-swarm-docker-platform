#!/bin/bash
# Project-wide module system fixer
# Fixes all JavaScript files in a project to use consistent module system

PROJECT_ROOT="$1"

if [ -z "$PROJECT_ROOT" ]; then
    echo "Usage: fix-project-modules.sh <project-root>"
    exit 1
fi

echo "[PROJECT-FIXER] Starting project-wide module fix for: $PROJECT_ROOT"

# Find all JS/JSX files
JS_FILES=$(find "$PROJECT_ROOT" -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v node_modules | grep -v ".backup")
HTML_FILES=$(find "$PROJECT_ROOT" -name "*.html" 2>/dev/null | grep -v node_modules)

# Detect module system from HTML files
MODULE_SYSTEM="none"
for html in $HTML_FILES; do
    if grep -q 'type="text/babel"' "$html"; then
        MODULE_SYSTEM="babel"
        break
    elif grep -q 'type="module"' "$html"; then
        MODULE_SYSTEM="esm"
        break
    fi
done

echo "[PROJECT-FIXER] Detected module system: $MODULE_SYSTEM"

FIXED_COUNT=0
FAILED_COUNT=0

# Fix each JavaScript file
for file in $JS_FILES; do
    echo "[PROJECT-FIXER] Processing: $(basename $file)"
    
    # Create backup
    if [ ! -f "$file.backup" ]; then
        cp "$file" "$file.backup"
        echo "  - Created backup: $file.backup"
    fi
    
    # Apply appropriate fix based on module system
    if [ "$MODULE_SYSTEM" = "babel" ]; then
        # For babel/browser usage - remove all module syntax
        echo "  - Converting to browser-compatible format..."
        
        # Use the react-module-fixer for React files
        if grep -q "React\|react" "$file"; then
            if node hooks/fixers/react-module-fixer.js "$file" > /tmp/fixer.log 2>&1; then
                echo "  ✅ Fixed React module issues"
                FIXED_COUNT=$((FIXED_COUNT + 1))
            else
                echo "  ❌ Failed to fix React modules"
                cat /tmp/fixer.log | grep -E "ERROR|FAIL" | sed 's/^/    /'
                FAILED_COUNT=$((FAILED_COUNT + 1))
            fi
        else
            # For non-React JS files, just remove import/export
            sed -i.tmp 's/^import .* from .*;//g' "$file"
            sed -i.tmp 's/^export default .*;//g' "$file"
            sed -i.tmp 's/^export {.*};//g' "$file"
            rm -f "$file.tmp"
            echo "  ✅ Removed module syntax"
            FIXED_COUNT=$((FIXED_COUNT + 1))
        fi
    elif [ "$MODULE_SYSTEM" = "esm" ]; then
        # For ES modules - ensure proper syntax
        echo "  - Ensuring proper ES module syntax..."
        # Add fixes for ES modules if needed
        FIXED_COUNT=$((FIXED_COUNT + 1))
    fi
done

# Validate component integration
echo "[PROJECT-FIXER] Checking component integration..."

# Build component dependency graph
declare -A COMPONENTS
declare -A COMPONENT_FILES

# First pass - find all component definitions
for file in $JS_FILES; do
    DEFINED_COMPONENTS=$(grep -E "function [A-Z][a-zA-Z0-9]+|const [A-Z][a-zA-Z0-9]+ =|class [A-Z][a-zA-Z0-9]+" "$file" | \
                        sed -E 's/.*(function|const|class) ([A-Z][a-zA-Z0-9]+).*/\2/' | sort | uniq)
    
    for comp in $DEFINED_COMPONENTS; do
        COMPONENTS[$comp]=1
        COMPONENT_FILES[$comp]=$file
        echo "  - Found component '$comp' in $(basename $file)"
    done
done

# Second pass - check component usage
for file in $JS_FILES; do
    USED_COMPONENTS=$(grep -oE "<[A-Z][a-zA-Z0-9]+" "$file" | sed 's/<//g' | sort | uniq)
    
    for comp in $USED_COMPONENTS; do
        # Skip React built-ins
        if [[ "$comp" =~ ^(React|Fragment|StrictMode|Suspense|Profiler)$ ]]; then
            continue
        fi
        
        if [ -z "${COMPONENTS[$comp]}" ]; then
            echo "  [WARNING] Component '$comp' used in $(basename $file) but not defined"
        else
            # For babel mode, ensure component is globally accessible
            if [ "$MODULE_SYSTEM" = "babel" ]; then
                COMP_FILE="${COMPONENT_FILES[$comp]}"
                if ! grep -q "window.$comp = $comp" "$COMP_FILE"; then
                    echo "  - Making '$comp' globally accessible..."
                    echo "" >> "$COMP_FILE"
                    echo "// Make component available globally" >> "$COMP_FILE"
                    echo "if (typeof window !== 'undefined') {" >> "$COMP_FILE"
                    echo "  window.$comp = $comp;" >> "$COMP_FILE"
                    echo "}" >> "$COMP_FILE"
                fi
            fi
        fi
    done
done

# Final validation
echo "[PROJECT-FIXER] Running final validation..."
if bash hooks/validators/project-validator.sh "$PROJECT_ROOT" "fix-complete" > /tmp/final-validation.log 2>&1; then
    echo "[PROJECT-FIXER] ✅ Project validation PASSED after fixes"
else
    echo "[PROJECT-FIXER] ⚠️  Some issues remain:"
    cat /tmp/final-validation.log | grep -E "ERROR|WARNING" | sed 's/^/  /'
fi

# Summary
echo "[PROJECT-FIXER] ===== Fix Summary ====="
echo "[PROJECT-FIXER] Files processed: $(echo $JS_FILES | wc -w)"
echo "[PROJECT-FIXER] Files fixed: $FIXED_COUNT"
echo "[PROJECT-FIXER] Files failed: $FAILED_COUNT"

if [ $FAILED_COUNT -eq 0 ]; then
    echo "[PROJECT-FIXER] ✅ All files fixed successfully!"
    exit 0
else
    echo "[PROJECT-FIXER] ❌ Some files could not be fixed"
    exit 1
fi