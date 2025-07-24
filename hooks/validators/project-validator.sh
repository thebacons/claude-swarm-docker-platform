#!/bin/bash
# Project-wide validation hook
# Validates all related files in a project when any file is modified

PROJECT_ROOT="$1"
CHANGED_FILE="$2"

echo "[PROJECT-VALIDATOR] Validating entire project: $PROJECT_ROOT"
echo "[PROJECT-VALIDATOR] Triggered by change to: $CHANGED_FILE"

# Determine project type
if [ -f "$PROJECT_ROOT/package.json" ]; then
    PROJECT_TYPE="node"
elif [ -f "$PROJECT_ROOT/index.html" ]; then
    PROJECT_TYPE="web"
else
    PROJECT_TYPE="unknown"
fi

echo "[PROJECT-VALIDATOR] Project type: $PROJECT_TYPE"

# Find all JavaScript/JSX files in project
JS_FILES=$(find "$PROJECT_ROOT" -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v node_modules | grep -v ".backup")
HTML_FILES=$(find "$PROJECT_ROOT" -name "*.html" 2>/dev/null | grep -v node_modules)

ERRORS=0
WARNINGS=0

# Check for module system consistency
echo "[PROJECT-VALIDATOR] Checking module system consistency..."

HAS_IMPORTS=false
HAS_EXPORTS=false
HAS_REQUIRE=false
HAS_BABEL=false
HAS_MODULE_SCRIPT=false

# Scan all JS files
for file in $JS_FILES; do
    if grep -q "^import\|^export" "$file"; then
        HAS_IMPORTS=true
        echo "  - ES6 modules found in: $(basename $file)"
    fi
    if grep -q "require(" "$file"; then
        HAS_REQUIRE=true
        echo "  - CommonJS found in: $(basename $file)"
    fi
done

# Scan HTML files
for file in $HTML_FILES; do
    if grep -q 'type="text/babel"' "$file"; then
        HAS_BABEL=true
        echo "  - Babel script loader in: $(basename $file)"
    fi
    if grep -q 'type="module"' "$file"; then
        HAS_MODULE_SCRIPT=true
        echo "  - Module script in: $(basename $file)"
    fi
done

# Validate consistency
if [ "$HAS_IMPORTS" = true ] && [ "$HAS_BABEL" = true ]; then
    echo "[ERROR] ES6 imports used with babel script loader - incompatible!"
    echo "[FIX] Run: bash hooks/fixers/fix-project-modules.sh $PROJECT_ROOT"
    ERRORS=$((ERRORS + 1))
fi

if [ "$HAS_IMPORTS" = true ] && [ "$HAS_REQUIRE" = true ]; then
    echo "[WARNING] Mixed module systems (ES6 and CommonJS)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check component dependencies
echo "[PROJECT-VALIDATOR] Checking component dependencies..."

# For each JS file, check if referenced components exist
for file in $JS_FILES; do
    # Extract component references (basic pattern matching)
    COMPONENTS=$(grep -oE "<[A-Z][a-zA-Z0-9]+" "$file" | sed 's/<//g' | sort | uniq)
    
    for comp in $COMPONENTS; do
        # Skip React built-ins
        if [[ "$comp" =~ ^(React|Fragment|StrictMode|Suspense|Profiler)$ ]]; then
            continue
        fi
        
        # Check if component is defined somewhere
        FOUND=false
        for jsfile in $JS_FILES; do
            if grep -q "function $comp\|const $comp\|class $comp" "$jsfile"; then
                FOUND=true
                break
            fi
        done
        
        if [ "$FOUND" = false ]; then
            echo "[WARNING] Component '$comp' used in $(basename $file) but not found in project"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
done

# Run individual file validators
echo "[PROJECT-VALIDATOR] Running individual file validations..."

for file in $JS_FILES; do
    echo "  - Validating: $(basename $file)"
    
    # Run syntax check
    if ! bash hooks/validators/syntax-check.sh "$file" > /tmp/syntax-check.log 2>&1; then
        echo "    [ERROR] Syntax validation failed"
        cat /tmp/syntax-check.log | grep -E "ERROR|FAIL" | sed 's/^/    /'
        ERRORS=$((ERRORS + 1))
    fi
    
    # Run React check if applicable
    if grep -q "React\|react" "$file"; then
        if ! bash hooks/validators/react-check.sh "$file" > /tmp/react-check.log 2>&1; then
            echo "    [ERROR] React validation failed"
            cat /tmp/react-check.log | grep -E "ERROR|FAIL" | sed 's/^/    /'
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

# Summary
echo "[PROJECT-VALIDATOR] ===== Validation Summary ====="
echo "[PROJECT-VALIDATOR] Files checked: $(echo $JS_FILES | wc -w) JS, $(echo $HTML_FILES | wc -w) HTML"
echo "[PROJECT-VALIDATOR] Errors: $ERRORS"
echo "[PROJECT-VALIDATOR] Warnings: $WARNINGS"

if [ $ERRORS -gt 0 ]; then
    echo "[PROJECT-VALIDATOR] ❌ Project validation FAILED"
    echo "[PROJECT-VALIDATOR] Run auto-fixer: bash hooks/fixers/fix-project-modules.sh $PROJECT_ROOT"
    exit 1
else
    echo "[PROJECT-VALIDATOR] ✅ Project validation PASSED"
    exit 0
fi