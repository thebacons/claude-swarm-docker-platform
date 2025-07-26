# CI/CD Enforcement Design Document

## Executive Summary

This document outlines a comprehensive CI/CD enforcement system for the MCP Multi-Agent Orchestration Framework. The system ensures code quality, testing compliance, and proper git workflow through a combination of git hooks, agent wrappers, and a rules engine.

## 1. Git Pre-Commit Hooks for TypeScript/Linting

### 1.1 Overview
Pre-commit hooks run before each commit to ensure code quality and consistency. They prevent commits that don't meet quality standards.

### 1.2 Hook Configuration

#### 1.2.1 TypeScript Type Checking
```bash
#!/bin/bash
# .git/hooks/pre-commit

# TypeScript type checking
echo "Running TypeScript type check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript type errors found. Please fix before committing."
    exit 1
fi
```

#### 1.2.2 ESLint Configuration
```bash
# ESLint check for staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$')

if [ -n "$STAGED_FILES" ]; then
    echo "Running ESLint on staged files..."
    npx eslint $STAGED_FILES --fix
    
    # Re-add files that were auto-fixed
    git add $STAGED_FILES
    
    # Check if there are still errors
    npx eslint $STAGED_FILES
    if [ $? -ne 0 ]; then
        echo "❌ ESLint errors found. Please fix before committing."
        exit 1
    fi
fi
```

#### 1.2.3 Prettier Formatting
```bash
# Prettier formatting check
if [ -n "$STAGED_FILES" ]; then
    echo "Running Prettier formatting check..."
    npx prettier --check $STAGED_FILES
    if [ $? -ne 0 ]; then
        echo "Auto-formatting with Prettier..."
        npx prettier --write $STAGED_FILES
        git add $STAGED_FILES
    fi
fi
```

### 1.3 Python Code Quality Checks
```bash
# Python linting with Black and Flake8
PYTHON_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.py$')

if [ -n "$PYTHON_FILES" ]; then
    echo "Running Black formatter..."
    black $PYTHON_FILES
    git add $PYTHON_FILES
    
    echo "Running Flake8..."
    flake8 $PYTHON_FILES
    if [ $? -ne 0 ]; then
        echo "❌ Flake8 errors found. Please fix before committing."
        exit 1
    fi
fi
```

### 1.4 Test Requirement Check
```bash
# Check for test files when code files are modified
check_test_coverage() {
    local code_file=$1
    local test_file=""
    
    if [[ $code_file == *.ts || $code_file == *.tsx ]]; then
        test_file="${code_file%.ts*}.test.ts"
    elif [[ $code_file == *.py ]]; then
        test_file="test_${code_file}"
    fi
    
    if [ -n "$test_file" ] && [ ! -f "$test_file" ]; then
        echo "⚠️  Warning: No test file found for $code_file"
        echo "Expected test file: $test_file"
        return 1
    fi
    return 0
}

# Check all staged code files have corresponding tests
MISSING_TESTS=0
for file in $STAGED_FILES; do
    if [[ $file != *.test.* ]] && [[ $file != test_* ]]; then
        check_test_coverage $file || MISSING_TESTS=$((MISSING_TESTS + 1))
    fi
done

if [ $MISSING_TESTS -gt 0 ]; then
    echo "⚠️  $MISSING_TESTS files without tests. Consider adding tests."
fi
```

## 2. Pre-Push Hooks to Prevent Direct Main Commits

### 2.1 Branch Protection Hook
```bash
#!/bin/bash
# .git/hooks/pre-push

protected_branch='main'
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

if [ $protected_branch = $current_branch ]; then
    echo "❌ Direct push to main branch is not allowed!"
    echo "Please create a feature branch and submit a pull request."
    echo ""
    echo "To create a feature branch:"
    echo "  git checkout -b feature/your-feature-name"
    echo "  git push -u origin feature/your-feature-name"
    exit 1
fi
```

### 2.2 Test Status Verification
```bash
# Check if all required tests have passed
TEST_STATUS_FILE=".test-status.json"

if [ ! -f "$TEST_STATUS_FILE" ]; then
    echo "❌ No test status file found. Please run all tests before pushing."
    exit 1
fi

# Parse test status (requires jq)
TUT_PASSED=$(jq -r '.TUT.passed' $TEST_STATUS_FILE)
FUT_PASSED=$(jq -r '.FUT.passed' $TEST_STATUS_FILE)
SIT_PASSED=$(jq -r '.SIT.passed' $TEST_STATUS_FILE)
RGT_PASSED=$(jq -r '.RGT.passed' $TEST_STATUS_FILE)

if [ "$TUT_PASSED" != "true" ] || [ "$FUT_PASSED" != "true" ] || 
   [ "$SIT_PASSED" != "true" ] || [ "$RGT_PASSED" != "true" ]; then
    echo "❌ Not all required tests have passed!"
    echo "TUT: $TUT_PASSED"
    echo "FUT: $FUT_PASSED"
    echo "SIT: $SIT_PASSED"
    echo "RGT: $RGT_PASSED"
    echo ""
    echo "Please ensure all tests pass before pushing."
    exit 1
fi
```

### 2.3 Linear Integration Check
```bash
# Check if commits reference Linear issues
COMMITS=$(git log origin/$current_branch..HEAD --pretty=format:"%s")
MISSING_REFS=0

while IFS= read -r commit; do
    if ! echo "$commit" | grep -qE "(BAC-[0-9]+|FUT-BAC-[0-9]+|TUT-BAC-[0-9]+)"; then
        echo "⚠️  Commit missing Linear reference: $commit"
        MISSING_REFS=$((MISSING_REFS + 1))
    fi
done <<< "$COMMITS"

if [ $MISSING_REFS -gt 0 ]; then
    echo "❌ $MISSING_REFS commits without Linear issue references."
    echo "Please amend commits to include issue references."
    exit 1
fi
```

## 3. Agent Git Wrapper Design

### 3.1 Architecture Overview
The Agent Git Wrapper provides a controlled interface for AI agents to interact with git, enforcing CI/CD rules and maintaining audit trails.

### 3.2 Core Components

#### 3.2.1 GitWrapper Class
```python
from typing import List, Dict, Optional, Tuple
import subprocess
import json
import datetime
from pathlib import Path

class AgentGitWrapper:
    """Secure git wrapper for AI agents with CI/CD enforcement."""
    
    def __init__(self, agent_id: str, working_dir: Path):
        self.agent_id = agent_id
        self.working_dir = working_dir
        self.audit_log = []
        self.rules_engine = RulesEngine()
        
    def execute_git_command(self, command: List[str]) -> Tuple[bool, str]:
        """Execute git command with validation and auditing."""
        # Validate command against rules
        if not self.rules_engine.validate_command(command):
            return False, "Command violates CI/CD rules"
        
        # Log the attempt
        self.audit_log.append({
            "timestamp": datetime.datetime.now().isoformat(),
            "agent_id": self.agent_id,
            "command": " ".join(command),
            "status": "attempting"
        })
        
        # Execute command
        try:
            result = subprocess.run(
                ["git"] + command,
                cwd=self.working_dir,
                capture_output=True,
                text=True,
                check=True
            )
            
            # Log success
            self.audit_log[-1]["status"] = "success"
            self.audit_log[-1]["output"] = result.stdout
            
            return True, result.stdout
            
        except subprocess.CalledProcessError as e:
            # Log failure
            self.audit_log[-1]["status"] = "failed"
            self.audit_log[-1]["error"] = e.stderr
            
            return False, e.stderr
```

#### 3.2.2 Safe Operation Methods
```python
    def create_feature_branch(self, branch_name: str) -> Tuple[bool, str]:
        """Create a feature branch following naming conventions."""
        # Validate branch name
        if not branch_name.startswith("feature/"):
            branch_name = f"feature/{branch_name}"
        
        # Ensure we're not on main
        current_branch = self.get_current_branch()
        if current_branch == "main":
            self.execute_git_command(["checkout", "-b", branch_name])
        else:
            return False, "Must be on main branch to create feature branch"
        
        return True, f"Created branch: {branch_name}"
    
    def commit_with_validation(self, message: str, files: List[str]) -> Tuple[bool, str]:
        """Commit files with CI/CD validation."""
        # Check if we're on a feature branch
        current_branch = self.get_current_branch()
        if current_branch == "main":
            return False, "Cannot commit directly to main branch"
        
        # Run pre-commit checks
        if not self.run_pre_commit_checks(files):
            return False, "Pre-commit checks failed"
        
        # Stage files
        for file in files:
            success, output = self.execute_git_command(["add", file])
            if not success:
                return False, f"Failed to stage {file}: {output}"
        
        # Commit with message
        return self.execute_git_command(["commit", "-m", message])
    
    def push_with_validation(self) -> Tuple[bool, str]:
        """Push current branch with validation."""
        # Check test status
        if not self.verify_test_status():
            return False, "All tests must pass before pushing"
        
        # Get current branch
        current_branch = self.get_current_branch()
        
        # Push to origin
        return self.execute_git_command(["push", "-u", "origin", current_branch])
```

#### 3.2.3 Test Integration
```python
    def run_test_suite(self, test_type: str) -> Dict[str, any]:
        """Run specified test suite and update status."""
        test_commands = {
            "TUT": ["npm", "run", "test:unit"],
            "FUT": ["npm", "run", "test:functional"],
            "SIT": ["npm", "run", "test:integration"],
            "RGT": ["npm", "run", "test:regression"]
        }
        
        if test_type not in test_commands:
            return {"error": "Invalid test type"}
        
        # Run tests
        result = subprocess.run(
            test_commands[test_type],
            cwd=self.working_dir,
            capture_output=True,
            text=True
        )
        
        # Update test status file
        status = {
            "type": test_type,
            "passed": result.returncode == 0,
            "timestamp": datetime.datetime.now().isoformat(),
            "output": result.stdout if result.returncode == 0 else result.stderr
        }
        
        self.update_test_status(test_type, status)
        
        return status
    
    def verify_test_status(self) -> bool:
        """Check if all required tests have passed."""
        status_file = self.working_dir / ".test-status.json"
        
        if not status_file.exists():
            return False
        
        with open(status_file, 'r') as f:
            status = json.load(f)
        
        required_tests = ["TUT", "FUT", "SIT", "RGT"]
        for test in required_tests:
            if test not in status or not status[test].get("passed", False):
                return False
        
        return True
```

### 3.3 Agent Integration Interface
```python
class AIAgentGitInterface:
    """High-level interface for AI agents to interact with git."""
    
    def __init__(self, agent_id: str):
        self.wrapper = AgentGitWrapper(agent_id, Path.cwd())
        self.linear_client = LinearAPIClient()
    
    async def implement_feature(self, task_id: str, description: str):
        """Complete workflow for implementing a feature."""
        # 1. Get task details from Linear
        task = await self.linear_client.get_task(task_id)
        
        # 2. Create feature branch
        branch_name = f"feature/{task_id.lower()}-{self.slugify(task.title)}"
        success, output = self.wrapper.create_feature_branch(branch_name)
        
        if not success:
            return {"error": output}
        
        # 3. Update Linear status
        await self.linear_client.update_task_status(task_id, "In Progress")
        
        return {
            "branch": branch_name,
            "status": "ready_for_implementation"
        }
    
    async def complete_implementation(self, task_id: str, files: List[str]):
        """Complete implementation with full CI/CD compliance."""
        # 1. Run all tests
        test_results = {}
        for test_type in ["TUT", "FUT", "SIT", "RGT"]:
            test_results[test_type] = self.wrapper.run_test_suite(test_type)
        
        # 2. Check if all tests passed
        all_passed = all(result["passed"] for result in test_results.values())
        
        if not all_passed:
            return {
                "error": "Tests failed",
                "test_results": test_results
            }
        
        # 3. Commit changes
        commit_message = f"feat: {task_id} - Implementation complete with all tests passing"
        success, output = self.wrapper.commit_with_validation(commit_message, files)
        
        if not success:
            return {"error": f"Commit failed: {output}"}
        
        # 4. Push to remote
        success, output = self.wrapper.push_with_validation()
        
        if not success:
            return {"error": f"Push failed: {output}"}
        
        # 5. Update Linear
        await self.linear_client.update_task_status(task_id, "In Review")
        
        return {
            "status": "success",
            "branch": self.wrapper.get_current_branch(),
            "test_results": test_results
        }
```

## 4. Rules Engine Specification

### 4.1 Overview
The Rules Engine provides a flexible, configurable system for enforcing CI/CD policies across all agent operations.

### 4.2 Rule Definition Schema
```yaml
# rules-config.yaml
version: "1.0"
rules:
  - id: "no-direct-main-commits"
    description: "Prevent direct commits to main branch"
    type: "git_operation"
    conditions:
      - field: "current_branch"
        operator: "equals"
        value: "main"
      - field: "operation"
        operator: "in"
        value: ["commit", "push"]
    action: "block"
    message: "Direct commits to main branch are not allowed"
    
  - id: "require-linear-reference"
    description: "Ensure commits reference Linear issues"
    type: "commit_message"
    conditions:
      - field: "message"
        operator: "not_matches"
        value: "(BAC-[0-9]+|FUT-BAC-[0-9]+|TUT-BAC-[0-9]+)"
    action: "block"
    message: "Commit message must reference a Linear issue"
    
  - id: "test-before-push"
    description: "Ensure all tests pass before pushing"
    type: "pre_push"
    conditions:
      - field: "test_status.all_passed"
        operator: "equals"
        value: false
    action: "block"
    message: "All tests must pass before pushing"
    
  - id: "code-quality-standards"
    description: "Enforce code quality standards"
    type: "pre_commit"
    checks:
      - name: "typescript"
        command: "npx tsc --noEmit"
        file_pattern: "\\.(ts|tsx)$"
      - name: "eslint"
        command: "npx eslint"
        file_pattern: "\\.(ts|tsx|js|jsx)$"
      - name: "black"
        command: "black --check"
        file_pattern: "\\.py$"
```

### 4.3 Rules Engine Implementation
```python
from typing import Dict, List, Any, Optional
import re
import yaml
from dataclasses import dataclass
from enum import Enum

class RuleAction(Enum):
    BLOCK = "block"
    WARN = "warn"
    AUTO_FIX = "auto_fix"

@dataclass
class Rule:
    id: str
    description: str
    type: str
    conditions: List[Dict[str, Any]]
    action: RuleAction
    message: str
    checks: Optional[List[Dict[str, str]]] = None

class RulesEngine:
    """Flexible rules engine for CI/CD enforcement."""
    
    def __init__(self, config_path: str = "rules-config.yaml"):
        self.rules = self.load_rules(config_path)
        self.rule_cache = {}
        
    def load_rules(self, config_path: str) -> List[Rule]:
        """Load rules from configuration file."""
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        rules = []
        for rule_data in config['rules']:
            rule = Rule(
                id=rule_data['id'],
                description=rule_data['description'],
                type=rule_data['type'],
                conditions=rule_data.get('conditions', []),
                action=RuleAction(rule_data['action']),
                message=rule_data['message'],
                checks=rule_data.get('checks')
            )
            rules.append(rule)
        
        return rules
    
    def evaluate_rule(self, rule: Rule, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Evaluate a single rule against the context."""
        for condition in rule.conditions:
            field_value = self.get_field_value(context, condition['field'])
            operator = condition['operator']
            expected_value = condition['value']
            
            if not self.evaluate_condition(field_value, operator, expected_value):
                return None  # Rule doesn't apply
        
        # All conditions met, rule applies
        return {
            'rule_id': rule.id,
            'action': rule.action,
            'message': rule.message
        }
    
    def evaluate_condition(self, field_value: Any, operator: str, expected_value: Any) -> bool:
        """Evaluate a single condition."""
        operators = {
            'equals': lambda a, b: a == b,
            'not_equals': lambda a, b: a != b,
            'in': lambda a, b: a in b,
            'not_in': lambda a, b: a not in b,
            'matches': lambda a, b: bool(re.match(b, str(a))),
            'not_matches': lambda a, b: not bool(re.match(b, str(a))),
            'greater_than': lambda a, b: a > b,
            'less_than': lambda a, b: a < b
        }
        
        if operator not in operators:
            raise ValueError(f"Unknown operator: {operator}")
        
        return operators[operator](field_value, expected_value)
    
    def get_field_value(self, context: Dict[str, Any], field_path: str) -> Any:
        """Extract field value from context using dot notation."""
        parts = field_path.split('.')
        value = context
        
        for part in parts:
            if isinstance(value, dict) and part in value:
                value = value[part]
            else:
                return None
        
        return value
    
    def validate_git_operation(self, operation: str, context: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validate a git operation against all applicable rules."""
        # Add operation to context
        context['operation'] = operation
        
        # Find applicable rules
        applicable_rules = [r for r in self.rules if r.type == 'git_operation']
        
        for rule in applicable_rules:
            result = self.evaluate_rule(rule, context)
            if result and result['action'] == RuleAction.BLOCK:
                return False, result['message']
        
        return True, None
    
    def validate_commit_message(self, message: str) -> Tuple[bool, Optional[str]]:
        """Validate commit message against rules."""
        context = {'message': message}
        applicable_rules = [r for r in self.rules if r.type == 'commit_message']
        
        for rule in applicable_rules:
            result = self.evaluate_rule(rule, context)
            if result and result['action'] == RuleAction.BLOCK:
                return False, result['message']
        
        return True, None
    
    def run_quality_checks(self, files: List[str]) -> Dict[str, Any]:
        """Run code quality checks based on rules."""
        results = {}
        quality_rules = [r for r in self.rules if r.type == 'pre_commit' and r.checks]
        
        for rule in quality_rules:
            for check in rule.checks:
                # Filter files by pattern
                pattern = check.get('file_pattern', '.*')
                matching_files = [f for f in files if re.search(pattern, f)]
                
                if matching_files:
                    # Run check command
                    import subprocess
                    command = check['command'].split() + matching_files
                    result = subprocess.run(command, capture_output=True, text=True)
                    
                    results[check['name']] = {
                        'passed': result.returncode == 0,
                        'output': result.stdout if result.returncode == 0 else result.stderr
                    }
        
        return results
```

### 4.4 Dynamic Rule Updates
```python
class DynamicRulesManager:
    """Manage dynamic rule updates without system restart."""
    
    def __init__(self, rules_engine: RulesEngine):
        self.rules_engine = rules_engine
        self.rule_version = "1.0"
        self.update_callbacks = []
        
    def add_rule(self, rule_data: Dict[str, Any]) -> bool:
        """Add a new rule dynamically."""
        try:
            rule = Rule(
                id=rule_data['id'],
                description=rule_data['description'],
                type=rule_data['type'],
                conditions=rule_data.get('conditions', []),
                action=RuleAction(rule_data['action']),
                message=rule_data['message'],
                checks=rule_data.get('checks')
            )
            
            # Check for duplicate ID
            if any(r.id == rule.id for r in self.rules_engine.rules):
                return False
            
            self.rules_engine.rules.append(rule)
            self.notify_update('rule_added', rule)
            return True
            
        except Exception as e:
            print(f"Error adding rule: {e}")
            return False
    
    def update_rule(self, rule_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing rule."""
        for i, rule in enumerate(self.rules_engine.rules):
            if rule.id == rule_id:
                # Update rule attributes
                for key, value in updates.items():
                    if hasattr(rule, key):
                        setattr(rule, key, value)
                
                self.notify_update('rule_updated', rule)
                return True
        
        return False
    
    def remove_rule(self, rule_id: str) -> bool:
        """Remove a rule."""
        for i, rule in enumerate(self.rules_engine.rules):
            if rule.id == rule_id:
                removed_rule = self.rules_engine.rules.pop(i)
                self.notify_update('rule_removed', removed_rule)
                return True
        
        return False
    
    def notify_update(self, update_type: str, rule: Rule):
        """Notify subscribers of rule updates."""
        for callback in self.update_callbacks:
            callback(update_type, rule)
```

## 5. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Install and configure git hooks in all repositories
- [ ] Deploy basic TypeScript and Python linting
- [ ] Implement branch protection for main
- [ ] Create .test-status.json tracking system

### Phase 2: Agent Integration (Week 2)
- [ ] Implement AgentGitWrapper class
- [ ] Create AIAgentGitInterface
- [ ] Integrate with existing MCP agents
- [ ] Add audit logging system

### Phase 3: Rules Engine (Week 3)
- [ ] Implement core RulesEngine
- [ ] Create rules configuration schema
- [ ] Add dynamic rule management
- [ ] Build rule testing framework

### Phase 4: Linear Integration (Week 4)
- [ ] Connect git operations to Linear API
- [ ] Auto-create test sub-issues
- [ ] Update task status based on git events
- [ ] Generate compliance reports

### Phase 5: Monitoring & Reporting (Week 5)
- [ ] Create CI/CD dashboard
- [ ] Implement compliance metrics
- [ ] Build audit trail viewer
- [ ] Add alerting for violations

## 6. Testing Strategy

### 6.1 Hook Testing
```bash
# Test pre-commit hooks
./test-hooks.sh pre-commit

# Test pre-push hooks
./test-hooks.sh pre-push

# Test with intentional failures
./test-hooks.sh violations
```

### 6.2 Agent Wrapper Testing
```python
# Test agent git operations
def test_agent_git_wrapper():
    wrapper = AgentGitWrapper("test-agent", Path("/tmp/test-repo"))
    
    # Test branch creation
    success, output = wrapper.create_feature_branch("test-feature")
    assert success
    
    # Test commit validation
    success, output = wrapper.commit_with_validation("Test commit", ["file.py"])
    assert success
    
    # Test push validation
    success, output = wrapper.push_with_validation()
    assert not success  # Should fail without tests
```

### 6.3 Rules Engine Testing
```python
# Test rule evaluation
def test_rules_engine():
    engine = RulesEngine("test-rules.yaml")
    
    # Test git operation validation
    context = {"current_branch": "main"}
    valid, message = engine.validate_git_operation("commit", context)
    assert not valid
    assert "not allowed" in message
    
    # Test commit message validation
    valid, message = engine.validate_commit_message("Fix typo")
    assert not valid
    assert "Linear issue" in message
```

## 7. Monitoring and Compliance

### 7.1 Metrics to Track
- Hook execution rate and failures
- Rule violations by type and agent
- Test completion rates
- Time to remediation
- Compliance score trends

### 7.2 Alerting Rules
- Immediate alert for main branch violations
- Daily summary of test failures
- Weekly compliance report
- Monthly trend analysis

### 7.3 Audit Trail Requirements
- All git operations logged with agent ID
- Rule evaluations recorded
- Test results archived
- Compliance decisions traceable

## 8. Security Considerations

### 8.1 Access Control
- Agent-specific git credentials
- Limited command whitelist
- Audit all operations
- Regular credential rotation

### 8.2 Code Injection Prevention
- Sanitize all inputs
- Validate file paths
- Restrict executable commands
- Monitor for anomalies

## 9. Rollback and Recovery

### 9.1 Hook Bypass (Emergency Only)
```bash
# Emergency bypass with audit
SKIP_HOOKS=true git commit --no-verify -m "EMERGENCY: <reason>"
```

### 9.2 Rule Rollback
- Version all rule changes
- Quick rollback mechanism
- Test rule changes in staging
- Gradual rollout support

## 10. Success Metrics

### 10.1 Quality Metrics
- 0% commits to main without PR
- 100% commits with Linear references
- 95%+ test coverage maintained
- <5% hook bypass rate

### 10.1 Efficiency Metrics
- <30 second hook execution time
- <2 minute full test suite
- 90% first-time compliance
- 50% reduction in failed deployments

## Conclusion

This comprehensive CI/CD enforcement system ensures code quality, testing compliance, and proper workflow adherence across all development activities in the MCP Multi-Agent Orchestration Framework. The combination of git hooks, agent wrappers, and a flexible rules engine provides both automation and control while maintaining developer productivity.