#!/bin/bash
# Auto-Format Hook - Runs code formatters after file edits
# Supports Python, JavaScript, TypeScript

FILE_PATH="${CLAUDE_FILE_PATH:-}"
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"

# Only process if we have a file path
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Determine file type and run appropriate formatter
case "$FILE_PATH" in
    *.py)
        # Python formatting with black (if available)
        if command -v black &> /dev/null; then
            echo "Running black formatter on $FILE_PATH" >&2
            black "$FILE_PATH" 2>/dev/null || true
        fi
        
        # Python import sorting with isort (if available)
        if command -v isort &> /dev/null; then
            isort "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
        
    *.js|*.jsx|*.ts|*.tsx)
        # JavaScript/TypeScript formatting with prettier (if available)
        if command -v prettier &> /dev/null; then
            echo "Running prettier formatter on $FILE_PATH" >&2
            prettier --write "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
        
    *.json)
        # JSON formatting with jq (if available)
        if command -v jq &> /dev/null; then
            echo "Formatting JSON file $FILE_PATH" >&2
            jq . "$FILE_PATH" > "$FILE_PATH.tmp" && mv "$FILE_PATH.tmp" "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
esac

# Log the formatting action
echo "$(date) | Auto-formatted $FILE_PATH after $TOOL_NAME" >> /home/claude/workspace/logs/formatting.log

exit 0