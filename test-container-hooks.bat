@echo off
REM Test Hook System Inside Container (Windows)

echo === Testing Hook System in Container ===
echo.

set TEST_FILE=/workspace/projects/test-hooks.js

echo Creating test file with ES6 modules (should fail)...
docker exec claude-policeman bash -c "cat > %TEST_FILE% << 'EOF' && echo 'File created' || echo 'Failed to create file'"
import React from 'react';
import { useState } from 'react';

export default function TestComponent() {
  const [count, setCount] = useState(0);
  
  return (
    ^<div^>
      ^<h1^>Test Component^</h1^>
      ^<p^>Count: {count}^</p^>
      ^<button onClick={() =^> setCount(count + 1)}^>
        Increment
      ^</button^>
    ^</div^>
  );
}
EOF

echo.
echo Running syntax check hook...
docker exec claude-policeman bash -c "/workspace/hooks/validators/syntax-check.sh %TEST_FILE%"

echo.
echo Running React check hook...
docker exec claude-policeman bash -c "/workspace/hooks/validators/react-check.sh %TEST_FILE%"

echo.
echo Attempting to fix with React module fixer...
docker exec claude-policeman bash -c "node /workspace/hooks/fixers/react-module-fixer.js %TEST_FILE%"

echo.
echo Re-running checks after fix...
docker exec claude-policeman bash -c "/workspace/hooks/validators/syntax-check.sh %TEST_FILE%"
docker exec claude-policeman bash -c "/workspace/hooks/validators/react-check.sh %TEST_FILE%"

echo.
echo === Hook Test Complete ===
echo.
pause