# Comprehensive Hook System Implementation Guide

## Overview
This hook system uses 10 specialized agents to prevent common development mistakes through automated checks and enforcement at various stages of the development workflow.

## Quick Start

### 1. Enable All Hooks
```bash
# Navigate to hooks config directory
cd /mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/hooks-config

# Enable all agent hooks
for config in agent*.json; do
  claude-code hooks add "$config"
done

# Verify hooks are active
claude-code hooks list
```

### 2. Test Hook System
```bash
# Test unauthorized change prevention
echo "test" > production/config.yml  # Should be blocked

# Test assumption detection  
# Make a code change and say "this should work" - will trigger tests

# Test deletion prevention
rm important-file.js  # Should be blocked without justification
```

## Agent Capabilities Summary

### Agent 1: Unauthorized Changes Prevention
- **Blocks**: Direct production edits, config changes without approval
- **Requires**: Feature branches, approval files, change requests
- **Override**: Create `.approved-changes` file with file paths

### Agent 2: Assumption Detection  
- **Detects**: "Should work", "probably works", theoretical fixes
- **Enforces**: Actual testing before claiming functionality
- **Triggers**: Automatic test runs when assumptions detected

### Agent 3: Deletion Review
- **Blocks**: File deletion, code removal without documentation
- **Requires**: Deletion justification, backup creation
- **Creates**: Audit trail of all deletions

### Agent 4: Multi-Agent Suggestions
- **Detects**: Complex tasks suitable for parallelization
- **Suggests**: Multi-agent approaches for efficiency
- **Examples**: Large refactors, multiple file changes, testing

### Agent 5: Testing Enforcement
- **Triggers**: Tests after code changes
- **Blocks**: Commits without passing tests
- **Monitors**: Test coverage for new files

### Agent 6: Hallucination Detection
- **Detects**: Fictional imports, non-existent methods
- **Verifies**: Dependencies, API endpoints, config values
- **Alerts**: When AI suggests impossible solutions

### Agent 7: Staging Enforcement
- **Blocks**: Direct production deployments
- **Requires**: Staging validation first
- **Creates**: 24-hour production window after staging success

### Agent 8: Documentation Checks
- **Detects**: Undocumented functions/classes
- **Reminds**: README updates, API docs, changelogs
- **Tracks**: Documentation debt

### Agent 9: Git Branching
- **Blocks**: Direct main/master commits
- **Enforces**: Branch naming conventions
- **Requires**: Conventional commit messages

### Agent 10: Integration Coordinator
- **Manages**: All other agents
- **Provides**: Emergency stop, audit trails, metrics
- **Coordinates**: Multi-agent workflows

## Common Workflows

### Production Deployment
1. Agent 9 ensures feature branch
2. Agent 5 runs all tests
3. Agent 7 requires staging deployment
4. Agent 1 blocks direct production changes
5. Agent 10 coordinates approval workflow

### Code Deletion
1. Agent 3 blocks deletion
2. Requires deletion-justification.md
3. Creates automatic backup
4. Agent 10 logs to audit trail

### Complex Feature Development
1. Agent 4 suggests multi-agent approach
2. Agent 10 coordinates parallel execution
3. Agent 5 runs tests on each component
4. Agent 8 ensures documentation

## Emergency Controls

### Stop All Operations
```bash
touch .claude-safety/.emergency-stop
```

### Resume Operations
```bash
rm -f .claude-safety/.emergency-stop
```

### View Audit Trail
```bash
tail -f .claude-safety/audit/master-audit.log
```

### Generate Safety Report
```bash
bash -c 'source agent10-integration-coordinator.json && generate-safety-report'
```

## Customization

### Disable Specific Agent
```bash
claude-code hooks remove agent3-deletion-review.json
```

### Modify Hook Behavior
Edit the specific agent JSON file and reload:
```bash
claude-code hooks update agent5-testing-enforcement.json
```

### Add Project-Specific Rules
Create `.project-rules.json`:
```json
{
  "custom_blocks": [
    {
      "pattern": "*.prod.env",
      "message": "Production environment files are read-only"
    }
  ]
}
```

## Best Practices

1. **Don't Disable Agent 10** - It coordinates all safety systems
2. **Use Override Sparingly** - It bypasses safety for good reasons
3. **Review Audit Logs** - Check `.claude-safety/audit/` regularly
4. **Keep Staging Current** - Staging tests expire after 24 hours
5. **Document Overrides** - Explain why safety was bypassed

## Troubleshooting

### Hook Not Triggering
```bash
# Check if hook is loaded
claude-code hooks list | grep "agent-name"

# Test specific hook
claude-code hooks test agent2-assumption-detection.json
```

### Too Many Blocks
```bash
# Temporarily reduce enforcement
echo "development" > .claude-safety/mode

# Return to strict mode
echo "strict" > .claude-safety/mode
```

### Performance Issues
```bash
# Disable non-critical agents (priority 3)
claude-code hooks remove agent4-multi-agent-suggestions.json
claude-code hooks remove agent8-documentation-checks.json
```

## Metrics and Reporting

The system automatically collects:
- Total operations performed
- Blocked operations count  
- Tests run
- Approvals required
- Emergency stops triggered

View daily metrics:
```bash
cat .claude-safety/metrics-$(date +%Y%m%d).json | jq
```

## Integration with CI/CD

Export hooks for CI/CD pipeline:
```bash
# Generate CI-compatible hook script
claude-code hooks export --format=ci > .github/hooks/safety-checks.sh
```

This comprehensive hook system ensures development safety through multiple layers of automated checks while maintaining flexibility through override mechanisms.