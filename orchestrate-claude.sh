#!/bin/bash
# Script to orchestrate Claude Code across containers

echo "=== Claude Code Cross-Container Orchestration Demo ==="
echo ""

# Function to run Claude on a specific container
run_claude_on() {
    local container=$1
    local task=$2
    echo "Sending task to $container..."
    
    # Use docker exec to run Claude with proper environment
    docker exec $container bash -lc "claude \"$task\"" 2>&1 | head -10
    echo "---"
}

# Parallel execution function
run_parallel() {
    echo "=== Running Tasks in Parallel ==="
    
    # Define tasks
    declare -a tasks=(
        "casper-developer-1:Create a React login component with validation"
        "casper-developer-2:Create a REST API endpoint for user authentication"
        "casper-tester:Write unit tests for login functionality"
    )
    
    # Run all tasks in parallel
    for task_spec in "${tasks[@]}"; do
        IFS=':' read -r container task <<< "$task_spec"
        run_claude_on "$container" "$task" &
    done
    
    # Wait for all background jobs
    wait
    echo "All parallel tasks completed!"
}

# Sequential orchestration example
run_sequential() {
    echo "=== Sequential Orchestration Example ==="
    
    echo "Step 1: Planning"
    run_claude_on "casper-policeman" "Create a plan for building a todo app"
    
    echo "Step 2: Frontend Development"
    run_claude_on "casper-developer-1" "Implement a React todo list component"
    
    echo "Step 3: Backend Development"
    run_claude_on "casper-developer-2" "Create API endpoints for todo CRUD operations"
    
    echo "Step 4: Testing"
    run_claude_on "casper-tester" "Write tests for todo app functionality"
}

# Menu
echo "Choose orchestration mode:"
echo "1. Parallel execution (multiple agents simultaneously)"
echo "2. Sequential execution (step by step)"
echo "3. Custom task (specify your own)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        run_parallel
        ;;
    2)
        run_sequential
        ;;
    3)
        read -p "Enter container name (e.g., casper-developer-1): " container
        read -p "Enter task for Claude: " task
        run_claude_on "$container" "$task"
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "=== Alternative: SSH-based Orchestration ==="
echo "You can also SSH between containers:"
echo ""
echo "# From inside Policeman container:"
echo "sshpass -p claude ssh claude@developer-1 'bash -lc \"claude \\\"Your task\\\"\"'"
echo ""
echo "# Or use the Python orchestration script:"
echo "docker exec casper-policeman python3 /home/claude/workspace/scripts/demo-swarm.py"