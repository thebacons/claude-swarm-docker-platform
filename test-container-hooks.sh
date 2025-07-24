#!/bin/bash

# Test Hook System Inside Container

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Testing Hook System in Container ===${NC}"
echo ""

# Test file with intentional issues
TEST_FILE="/workspace/projects/test-hooks.js"

echo -e "${YELLOW}Creating test file with ES6 modules (should fail)...${NC}"
docker exec claude-policeman bash -c "cat > $TEST_FILE << 'EOF'
import React from 'react';
import { useState } from 'react';

export default function TestComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
EOF"

echo ""
echo -e "${YELLOW}Running syntax check hook...${NC}"
docker exec claude-policeman bash -c "/workspace/hooks/validators/syntax-check.sh $TEST_FILE"

echo ""
echo -e "${YELLOW}Running React check hook...${NC}"
docker exec claude-policeman bash -c "/workspace/hooks/validators/react-check.sh $TEST_FILE"

echo ""
echo -e "${YELLOW}Attempting to fix with React module fixer...${NC}"
docker exec claude-policeman bash -c "node /workspace/hooks/fixers/react-module-fixer.js $TEST_FILE"

echo ""
echo -e "${YELLOW}Re-running checks after fix...${NC}"
docker exec claude-policeman bash -c "/workspace/hooks/validators/syntax-check.sh $TEST_FILE"
docker exec claude-policeman bash -c "/workspace/hooks/validators/react-check.sh $TEST_FILE"

echo ""
echo -e "${YELLOW}Final file content:${NC}"
docker exec claude-policeman bash -c "cat $TEST_FILE"

echo ""
echo -e "${GREEN}=== Hook Test Complete ===${NC}"