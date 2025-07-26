# Bacon's Constructive Brainstorming Approach - Implementation Guide

## Overview

This implementation uses Claude Code's hooks system to enforce a structured problem-solving methodology that prevents common AI failures like jumping to solutions without analysis, hallucinations without citations, and missing the learning capture phase.

## The 8-Phase Approach

### 1. **Problem Definition Phase** (10% time)
- **Enforced**: Clear problem statement required before any work
- **Hook**: Blocks all operations until `.brainstorm/problem-statement.md` exists
- **Purpose**: Ensures everyone understands what we're solving

### 2. **Data Gathering Phase** (25% time)
- **Enforced**: Must cite all sources with `[Source: URL/Reference]`
- **Hook**: Reminds about citations, tracks data sources
- **Purpose**: Prevents hallucinations, builds solid foundation

### 3. **Analysis Phase** (25% time)
- **Enforced**: Deep analysis before solutions, model searches
- **Hook**: Reminds to search Ollama/HuggingFace, requires QA
- **Purpose**: Ensures thorough understanding before solutioning

### 4. **Solution Generation** (20% time)
- **Enforced**: Brainstorming mode - no criticism allowed
- **Hook**: Sets high-temperature flag, collects all ideas
- **Purpose**: Maximizes creative output from all agents

### 5. **Solution Selection** (10% time)
- **Enforced**: Voting/weighting process for consensus
- **Hook**: Requires votes, documents dissent
- **Purpose**: Builds agreement while preserving minority views

### 6. **Planning & Action** (10% time)
- **Enforced**: Detailed plan and testing before implementation
- **Hook**: Blocks commits without test results
- **Purpose**: Ensures solutions actually work

### 7. **SSC Collection** (End of session)
- **Enforced**: STOP/START/CONTINUE capture required
- **Hook**: Blocks final commit without SSC
- **Purpose**: Continuous improvement through reflection

### 8. **Time Management** (Throughout)
- **Enforced**: Time windows with warnings at 25%, 50%, 75%, 100%
- **Hook**: Periodic checks every 5 minutes
- **Purpose**: Prevents analysis paralysis or rushed solutions

## Quick Start

### 1. Install the Hooks

```bash
# Copy hooks configuration to Claude Code config directory
cp bacon-brainstorming-hooks.json ~/.config/claude-code/hooks.json

# Or merge with existing hooks
jq -s '.[0] * .[1]' ~/.config/claude-code/hooks.json bacon-brainstorming-hooks.json > ~/.config/claude-code/hooks.json.new
mv ~/.config/claude-code/hooks.json.new ~/.config/claude-code/hooks.json
```

### 2. Initialize a Brainstorming Session

```bash
# Run the setup script
./setup-brainstorm-session.sh "Implement autonomous AI agents for code review"

# This creates:
# - .brainstorm/problem-statement.md (for you to fill out)
# - .brainstorm/ directory structure
# - All required scripts with proper permissions
```

### 3. Follow the Phases

```bash
# Phase 1: Define the problem clearly
edit .brainstorm/problem-statement.md

# Phase 2: Gather data (25% of time)
# Document all sources in .brainstorm/data-sources.md
# Use format: [Source: URL or Reference]

# Phase 3: Analyze deeply
# Search for relevant models: ollama search "code review"
# Document analysis in .brainstorm/analysis.md
# QA your analysis in .brainstorm/analysis-qa.md

# Phase 4: Generate solutions (brainstorm mode)
# Add all ideas to .brainstorm/solutions.md
# No criticism! All ideas welcome!

# Phase 5: Select best solutions
# Vote on solutions, document in .brainstorm/solution-votes.json
# Select top 3 in .brainstorm/selected-solutions.md

# Phase 6: Plan and test
# Create plan in .brainstorm/implementation-plan.md
# Test and mark: touch .brainstorm/solution-tests-passed.flag

# Phase 7: Capture learnings
# Fill out .brainstorm/ssc-collection.md
# - STOP: What should we stop doing?
# - START: What should we start doing?
# - CONTINUE: What's working well?
```

### 4. Advance Through Phases

```bash
# When ready to move to next phase:
echo 'phase-complete' > .brainstorm/phase-complete.signal

# The hook will validate requirements and advance automatically
```

## Hook Features in Detail

### 1. **Solution Jump Prevention**
```json
{
  "name": "Solution Jump Preventer",
  "matcher": {"tools": ["Edit", "Write", "MultiEdit"]},
  "command": "Prevents code writing during problem/data phases"
}
```
- Blocks writing code files (.py, .js, .ts) during early phases
- Forces proper analysis before implementation

### 2. **Citation Enforcement**
```json
{
  "name": "Citation Enforcer",
  "matcher": {"tools": ["Write", "Edit"]},
  "command": "Reminds to include citations during data gathering"
}
```
- Reminds about citation format during data gathering
- Helps prevent hallucinations

### 3. **Time Allocation Management**
```json
{
  "name": "Time Allocation Checker",
  "command": "bash .brainstorm/check-time-allocation.sh"
}
```
- Enforces time percentages per phase
- Warns at 25%, 50%, 75% completion
- Blocks at 100% to force phase advancement

### 4. **Multi-Agent Collaboration**
```json
{
  "name": "Multi-Agent Problem Understanding",
  "trigger": "agent-join",
  "command": "Shares problem statement with all agents"
}
```
- Ensures all agents understand the problem
- Collects ideas from all agents
- Documents dissenting opinions

### 5. **Learning Capture**
```json
{
  "name": "SSC Collection Enforcer",
  "command": "Blocks commit without STOP/START/CONTINUE"
}
```
- Forces reflection on what worked/didn't work
- Updates central learnings database
- Archives session for future reference

## Example Session

```bash
# 1. Start session (2-hour sprint)
./setup-brainstorm-session.sh "Optimize database query performance"
export BRAINSTORM_TOTAL_TIME=120  # 2 hours in minutes

# 2. Define problem (12 minutes)
echo "Database queries taking >5 seconds, causing timeouts" > .brainstorm/problem-statement.md

# 3. Gather data (30 minutes)
# Research similar issues, document sources
echo "## Data Sources
[Source: https://stackoverflow.com/questions/db-optimization]
- Index usage patterns...
[Source: Internal metrics dashboard]
- Query execution plans...
" > .brainstorm/data-sources.md

# 4. Analyze (30 minutes)
# Deep dive, search for tools
ollama search "sql optimization" > .brainstorm/model-search.log
echo "## Analysis
Key findings:
1. Missing indexes on foreign keys
2. N+1 query patterns
3. Inefficient JOIN ordering
" > .brainstorm/analysis.md

# 5. Generate solutions (24 minutes)
echo "## Solution Ideas
1. Add composite indexes
2. Implement query caching
3. Denormalize hot paths
4. Use materialized views
5. Partition large tables
6. Optimize ORM queries
" > .brainstorm/solutions.md

# 6. Select solutions (12 minutes)
# Vote and select top 3
echo "## Selected Solutions
1. Add composite indexes (highest impact, lowest risk)
2. Implement query caching (medium impact, medium complexity)
3. Optimize ORM queries (ongoing improvement)
" > .brainstorm/selected-solutions.md

# 7. Plan and test (12 minutes)
echo "## Implementation Plan
1. Analyze slow query log
2. Create index migration
3. Test on staging
4. Monitor performance
" > .brainstorm/implementation-plan.md
# Run tests...
touch .brainstorm/solution-tests-passed.flag

# 8. Capture learnings
echo "## STOP/START/CONTINUE
STOP: Making schema changes without analyzing query patterns first
START: Regular query performance reviews
CONTINUE: Using explain plans before optimization
" > .brainstorm/ssc-collection.md

# Session complete! Learnings saved to ~/.brainstorm-learnings/database.md
```

## Customization

### Adjust Time Allocations
Edit the `PHASE_ALLOCATION` array in the scripts:
```bash
declare -A PHASE_ALLOCATION=(
    ["PROBLEM_DEFINITION"]=10    # Adjust percentages
    ["DATA_GATHERING"]=25        # Must total 100%
    ["ANALYSIS"]=25
    # ...
)
```

### Add Custom Validations
Add new phase transitions in `bacon-brainstorming-hooks.json`:
```json
{
  "name": "Custom Validator",
  "trigger": "phase-complete:ANALYSIS",
  "command": "your-custom-validation.sh"
}
```

### Integrate with CI/CD
The hooks can trigger CI/CD pipelines:
```json
{
  "name": "Deploy After Testing",
  "trigger": "solution-tests-passed",
  "command": "kubectl apply -f deployment.yaml"
}
```

## Benefits

1. **Prevents Premature Solutions**: Can't code until analysis is complete
2. **Ensures Data Quality**: Citations required, prevents hallucinations  
3. **Maximizes Creativity**: Dedicated brainstorming time without criticism
4. **Builds Consensus**: Structured voting with dissent documentation
5. **Guarantees Testing**: Can't proceed without validating solutions
6. **Captures Learning**: Forced reflection improves future sessions
7. **Manages Time**: Prevents both rushing and analysis paralysis
8. **Enables Collaboration**: All agents stay synchronized on problem/phase

## Troubleshooting

### "Cannot advance: X not found"
- Check the phase requirements in `advance-phase.sh`
- Ensure you've created all required files for the phase

### Time warnings appearing too frequently
- Adjust warning cooldown in `check-phase-time.sh`
- Default is 5 minutes between warnings

### Hooks not triggering
- Verify hooks.json is in the correct location
- Check Claude Code logs for hook execution errors
- Ensure scripts have execute permissions

### Session data not persisting
- Check `.brainstorm-archives/` directory permissions
- Verify `~/.brainstorm-learnings/` directory exists

## Next Steps

1. **Install hooks**: Copy configuration to Claude Code
2. **Run a test session**: Try a simple problem first
3. **Customize for your workflow**: Adjust times and validations
4. **Share learnings**: Review archived sessions regularly
5. **Iterate and improve**: Update hooks based on experience

The goal is structured creativity - enough process to prevent common failures, but not so much that it stifles innovation. The hooks enforce the discipline while you focus on the problem-solving.