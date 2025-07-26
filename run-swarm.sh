#!/bin/bash

echo "=== CASPER Swarm Orchestrator ==="
echo "Running the proven parallel AI agent system"
echo ""

# Check if containers are running
if ! docker ps | grep -q "claude-policeman"; then
    echo "⚠️  Starting CASPER containers..."
    docker-compose -f docker-compose.enhanced.yml up -d
    sleep 10
fi

# Show options
echo "Choose an option:"
echo "1. Run interactive swarm orchestrator"
echo "2. Run performance demo (shows 3.7x speedup)"
echo "3. Build expense tracker (15 agents in parallel)"
echo "4. Run simple CLI interface"
echo "5. Check container health"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "Starting interactive swarm orchestrator..."
        echo "This uses the proven parallel execution system."
        echo ""
        docker exec -it claude-policeman python3 /workspace/scripts/swarm-orchestrator.py
        ;;
    2)
        echo ""
        echo "Running performance demo..."
        echo "This will show sequential vs parallel execution times."
        echo ""
        docker exec -it claude-policeman python3 /workspace/scripts/demo-swarm.py
        ;;
    3)
        echo ""
        echo "Building expense tracker with 15 parallel agents..."
        echo "This is the same test that successfully created 40+ files."
        echo ""
        # Create a task file for expense tracker
        cat > /tmp/expense-tracker-task.yaml << 'EOF'
task: "Build a complete expense tracker application"
requirements:
  - React-based frontend
  - Local storage for data persistence
  - Expense categories and filtering
  - Monthly/yearly summaries
  - Charts and visualizations
  - Responsive design
  - No ES6 modules (browser compatible)
agents: 15
waves:
  - name: "Core Development"
    agents: 5
    parallel: true
  - name: "Testing & Validation"
    agents: 5
    parallel: true
  - name: "Enhancement & Polish"
    agents: 5
    parallel: true
EOF
        docker cp /tmp/expense-tracker-task.yaml claude-policeman:/workspace/expense-tracker-task.yaml
        docker exec -it claude-policeman python3 /workspace/scripts/swarm-orchestrator.py --task-file /workspace/expense-tracker-task.yaml
        ;;
    4)
        echo ""
        echo "Starting simple CLI interface..."
        docker exec -it claude-policeman python3 /workspace/scripts/casper-cli.py
        ;;
    5)
        echo ""
        echo "Checking container health..."
        echo ""
        echo "=== Policeman Container ==="
        docker exec claude-policeman /workspace/scripts/health-check.sh
        echo ""
        echo "=== All Containers Status ==="
        docker-compose -f docker-compose.enhanced.yml ps
        ;;
    *)
        echo "Invalid choice!"
        ;;
esac