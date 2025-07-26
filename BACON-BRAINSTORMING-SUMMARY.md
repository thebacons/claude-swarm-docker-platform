# Bacon's Constructive Brainstorming Approach - Hook Implementation Summary

## What I've Created

I've implemented a comprehensive hooks-based system that enforces Bacon's Constructive Brainstorming Approach in Claude Code. This prevents common AI failures and ensures structured problem-solving.

## Files Created

### 1. **Core Hook Configuration**
- `bacon-brainstorming-hooks.json` - Full implementation with all phases and validations
- `bacon-brainstorming-hooks-simple.json` - Simplified version for easy integration

### 2. **Supporting Scripts**
- `.brainstorm/check-time-allocation.sh` - Enforces time limits per phase (25% for data gathering, etc.)
- `.brainstorm/advance-phase.sh` - Validates phase requirements and transitions
- `.brainstorm/check-phase-time.sh` - Periodic monitoring with warnings

### 3. **Setup & Documentation**
- `setup-brainstorm-session.sh` - One-command session initialization
- `BACON-BRAINSTORMING-IMPLEMENTATION.md` - Comprehensive implementation guide
- `BACON-BRAINSTORMING-SUMMARY.md` - This summary

## Key Features Implemented

### 1. **Problem Definition Enforcement**
- Cannot start ANY work without defining the problem first
- Blocks file edits until `.brainstorm/problem-statement.md` exists
- Ensures all agents understand what they're solving

### 2. **Anti-Solutioning Protection**
- Prevents writing code (.py, .js, .ts) during problem definition and data gathering phases
- Forces proper analysis before jumping to implementation
- Error message guides users to complete analysis first

### 3. **Citation Requirements**
- Reminds to use `[Source: URL/Reference]` format during data gathering
- Validates minimum 3 sources before advancing from data phase
- Prevents hallucinations by requiring evidence

### 4. **Time Management System**
- Enforces percentage-based time allocation:
  - Problem Definition: 10%
  - Data Gathering: 25%
  - Analysis: 25%
  - Solution Generation: 20%
  - Solution Selection: 10%
  - Planning & Action: 10%
- Warnings at 25%, 50%, 75% completion
- Hard stop at 100% to prevent analysis paralysis

### 5. **Phase Validation Gates**
Each phase has specific requirements before advancing:
- **Problem Definition** → Requires problem-statement.md
- **Data Gathering** → Requires 3+ cited sources
- **Analysis** → Requires analysis-qa.md (quality assurance)
- **Solution Generation** → Requires 5+ solution ideas
- **Solution Selection** → Requires selected top 3 solutions
- **Planning & Action** → Encourages testing (solution-tests-passed.flag)
- **SSC Collection** → Requires STOP/START/CONTINUE reflection

### 6. **Model Search Reminders**
- During analysis phase, reminds to search Ollama/HuggingFace
- Tracks model searches in model-search.log
- Ensures use of available AI resources

### 7. **Brainstorming Mode**
- Sets "high temperature" flag during solution generation
- Reminder: "No criticism! All ideas welcome!"
- Collects ALL ideas before evaluation

### 8. **Multi-Agent Coordination**
- Shares problem statement with all joining agents
- Collects ideas from all participating agents
- Documents dissenting opinions for learning
- Ensures consensus while preserving minority views

### 9. **Learning Capture**
- Blocks final commit without SSC collection
- Automatically archives sessions
- Updates central learnings database
- Enables continuous improvement

### 10. **Activity Logging**
- Complete audit trail of all brainstorming activities
- Timestamps and phase tracking
- Tool usage documentation
- Session summaries generated automatically

## Quick Start Usage

```bash
# 1. Initialize a brainstorming session
./setup-brainstorm-session.sh "How to implement autonomous AI agents"

# 2. Follow the guided process
.brainstorm/status.sh  # Check current status

# 3. Complete each phase
edit .brainstorm/problem-statement.md
.brainstorm/next-phase.sh  # Advance when ready

# 4. Session automatically enforces:
# - No coding until analysis done
# - Citations required for data
# - Time limits per phase
# - Testing before completion
# - Learning capture at end
```

## Integration with Claude Code

### Option 1: Full Integration
```bash
# Copy to Claude Code hooks directory
cp bacon-brainstorming-hooks.json ~/.config/claude-code/hooks.json
```

### Option 2: Merge with Existing Hooks
```bash
# Merge configurations
jq -s '.[0] * .[1]' ~/.config/claude-code/hooks.json bacon-brainstorming-hooks.json > hooks-merged.json
mv hooks-merged.json ~/.config/claude-code/hooks.json
```

### Option 3: Simple Version
```bash
# Use simplified hooks for core features only
cp bacon-brainstorming-hooks-simple.json ~/.config/claude-code/hooks.json
```

## Benefits Delivered

1. **Prevents Premature Solutions** - Can't code until problem understood
2. **Ensures Quality Data** - Citations required, no hallucinations
3. **Maximizes Creativity** - Dedicated brainstorming time
4. **Builds Consensus** - Structured voting process
5. **Guarantees Testing** - Can't skip validation
6. **Captures Learning** - Continuous improvement built-in
7. **Manages Time** - No rushing or endless analysis
8. **Coordinates Agents** - Everyone stays synchronized

## Example Enforcement in Action

```bash
# Attempting to write code too early:
$ claude-code edit solver.py
❌ ERROR: No problem statement found. Create .brainstorm/problem-statement.md first

# After problem defined but during data phase:
$ claude-code write implementation.js  
⚠️ WARNING: Attempting to write code during DATA_GATHERING phase. Complete analysis first!

# Trying to commit without learning capture:
$ git commit -m "Implemented solution"
❌ Cannot commit: STOP/START/CONTINUE collection required

# Time limit reached:
⏰ TIME LIMIT EXCEEDED for ANALYSIS phase!
   Allocated: 30min, Used: 31min
   Run: echo 'phase-complete' > .brainstorm/phase-complete.signal
```

## Next Steps

1. **Test the System**: Run `./setup-brainstorm-session.sh "Test problem"` to try it
2. **Customize Times**: Adjust `BRAINSTORM_TOTAL_TIME` environment variable
3. **Add Validations**: Extend hooks for your specific needs
4. **Review Learnings**: Check `~/.brainstorm-learnings/database.md` regularly
5. **Share Success**: Document what works in your team

The system is now ready to enforce structured brainstorming and prevent the common pitfalls of jumping to solutions, missing citations, skipping testing, and forgetting to capture learnings. Every session will follow the proven 8-phase approach automatically.