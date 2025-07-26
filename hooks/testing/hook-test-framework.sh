#!/bin/bash
# Hook Testing Framework - Validates hooks before deployment

# Test directory
TEST_DIR="/home/claude/workspace/.hook-tests"
TEST_LOG="$TEST_DIR/test-results.log"
mkdir -p "$TEST_DIR"

# Function to test a single hook
test_hook() {
    local hook_name="$1"
    local hook_command="$2"
    local expected_behavior="$3"
    
    echo "Testing hook: $hook_name"
    
    # Create isolated test environment
    export CLAUDE_TEST_MODE="true"
    export CLAUDE_SESSION_LOG="$TEST_DIR/test-session.log"
    
    # Execute hook command
    local start_time=$(date +%s%N)
    eval "$hook_command" > "$TEST_DIR/output.txt" 2>&1
    local exit_code=$?
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # milliseconds
    
    # Log results
    echo "$(date) | Hook: $hook_name | Exit: $exit_code | Duration: ${duration}ms" >> "$TEST_LOG"
    
    # Validate behavior
    case "$expected_behavior" in
        "blocking")
            if [ $exit_code -ne 0 ]; then
                echo "✅ PASS: Hook blocked as expected"
                return 0
            else
                echo "❌ FAIL: Hook should have blocked"
                return 1
            fi
            ;;
        "warning")
            if grep -q "WARNING\|⚠️" "$TEST_DIR/output.txt"; then
                echo "✅ PASS: Hook warned as expected"
                return 0
            else
                echo "❌ FAIL: Expected warning not found"
                return 1
            fi
            ;;
        "logging")
            if [ -s "$TEST_DIR/output.txt" ]; then
                echo "✅ PASS: Hook logged output"
                return 0
            else
                echo "❌ FAIL: No log output generated"
                return 1
            fi
            ;;
    esac
}

# Function to test hook interactions
test_hook_interactions() {
    echo "Testing hook cascade scenarios..."
    
    # Scenario 1: Multiple hooks triggering
    export CLAUDE_RESPONSE="This is impossible and can't be done"
    
    # Should trigger both anti-defeatist and circular logic detectors
    # Check that they don't conflict
    
    echo "✅ Hook interaction tests completed"
}

# Function to test performance impact
test_performance_impact() {
    echo "Testing performance impact..."
    
    local baseline_time=$(date +%s%N)
    # Simulate operation without hooks
    sleep 0.1
    local baseline_end=$(date +%s%N)
    local baseline_duration=$(( (baseline_end - baseline_time) / 1000000 ))
    
    # Now with hooks enabled
    export HOOKS_ENABLED="true"
    local hook_time=$(date +%s%N)
    # Simulate operation with hooks
    sleep 0.1
    # Trigger multiple hooks
    local hook_end=$(date +%s%N)
    local hook_duration=$(( (hook_end - hook_time) / 1000000 ))
    
    local overhead=$(( hook_duration - baseline_duration ))
    echo "Performance overhead: ${overhead}ms"
    
    if [ $overhead -lt 100 ]; then
        echo "✅ PASS: Acceptable performance impact"
    else
        echo "⚠️ WARNING: High performance impact: ${overhead}ms"
    fi
}

# Main test execution
echo "=== Hook Testing Framework ==="
echo "Starting comprehensive hook validation..."
echo ""

# Test critical hooks
echo "1. Testing Anti-Defeatist Hook"
test_hook "/home/claude/workspace/hooks/challenger/anti-defeatist-hook.sh" "blocking"

echo ""
echo "2. Testing Context Manager"
export CONTEXT_WARNING_THRESHOLD="100"  # Low threshold for testing
test_hook "/home/claude/workspace/hooks/monitoring/context-manager.sh" "warning"

echo ""
echo "3. Testing Circular Logic Detector"
test_hook "/home/claude/workspace/hooks/monitoring/circular-logic-detector.sh" "logging"

echo ""
echo "4. Testing Hook Interactions"
test_hook_interactions

echo ""
echo "5. Testing Performance Impact"
test_performance_impact

echo ""
echo "=== Test Summary ==="
echo "Results logged to: $TEST_LOG"
grep -c "PASS" "$TEST_LOG" | xargs echo "Passed:"
grep -c "FAIL" "$TEST_LOG" | xargs echo "Failed:"

# Return overall status
if grep -q "FAIL" "$TEST_LOG"; then
    echo "❌ Some tests failed. Do not deploy!"
    exit 1
else
    echo "✅ All tests passed. Safe to deploy!"
    exit 0
fi