# Agent 8: CASPER Team Integration Hooks

## Problem Analysis
I need external oversight from specialized CASPER agents (PM, Observer, etc.) to challenge my work and prevent blind spots. Automatic escalation based on risk thresholds ensures critical review.

## Hook Configurations

### 1. PM Agent Auto-Trigger
```json
{
  "casperPMTrigger": [{
    "matcher": {
      "riskIndicators": [
        "production.*deploy",
        "delete.*data",
        "drop.*table",
        "security.*vulnerability",
        "breaking.*change",
        "major.*refactor"
      ],
      "threshold": 1
    },
    "command": "echo '👔 PM AGENT REQUIRED: High-risk operation detected!' && echo 'Risk factors:' && echo '{CLAUDE_MATCHED_PATTERNS}' && echo '\\nGenerating PM review request...' && echo '{\\\"task\\\": \\\"Review high-risk operation\\\", \\\"risk_factors\\\": \\\"{CLAUDE_MATCHED_PATTERNS}\\\", \\\"session_id\\\": \\\"$CLAUDE_SESSION_ID\\\"}' > .casper-pm-request.json",
    "blocking": true,
    "severity": "critical"
  }]
}
```

### 2. Observer Agent Behavioral Triggers
```json
{
  "observerTriggers": [{
    "behaviorPatterns": {
      "rushed": "Time between edits < 10 seconds",
      "uncertain": "High frequency of 'maybe', 'probably', 'might'",
      "overconfident": "Multiple '✅' without tests",
      "repetitive": "Same error > 3 times"
    },
    "command": "echo '👁️ OBSERVER AGENT ACTIVATION' && echo 'Behavioral patterns detected:' && echo '- Certainty level: '$CLAUDE_CERTAINTY_SCORE && echo '- Error repetition: '$CLAUDE_ERROR_COUNT && echo '- Claims without evidence: '$CLAUDE_UNTESTED_CLAIMS && echo '\\nObserver analysis required!'",
    "severity": "warning"
  }]
}
```

### 3. Devil's Advocate Auto-Challenge
```json
{
  "devilsAdvocate": [{
    "matcher": {
      "absoluteStatements": [
        "always",
        "never", 
        "impossible",
        "definitely",
        "guaranteed",
        "100%",
        "completely",
        "perfectly"
      ]
    },
    "command": "echo '😈 DEVIL'S ADVOCATE CHALLENGE!' && echo 'Absolute claim detected: {CLAUDE_MATCHED_TEXT}' && echo 'Counter-arguments to consider:' && echo '1. What edge cases exist?' && echo '2. What assumptions are made?' && echo '3. What could go wrong?' && echo '4. Has this been tested exhaustively?'",
    "severity": "warning"
  }]
}
```

### 4. Architect Review Escalation
```json
{
  "architectTrigger": [{
    "matcher": {
      "architecturalChanges": [
        "new.*service",
        "change.*architecture",
        "add.*dependency",
        "modify.*schema",
        "alter.*api",
        "refactor.*core"
      ],
      "filePatterns": ["**/architecture/**", "**/core/**", "**/*.schema.*"]
    },
    "command": "echo '🏗️ ARCHITECT REVIEW REQUIRED!' && echo 'Architectural impact detected in:' && echo '{CLAUDE_MODIFIED_FILES}' && echo '\\nGenerating architecture review request...' && git diff --name-only > .architect-review-files.txt",
    "blocking": true
  }]
}
```

### 5. QA Agent Test Coverage Check
```json
{
  "qaAgentTrigger": [{
    "testCoverageThreshold": {
      "minimum": 80,
      "criticalFiles": 95
    },
    "command": "coverage=$(npm test -- --coverage 2>/dev/null | grep 'All files' | awk '{print $4}' | tr -d '%') && if [ ${coverage:-0} -lt 80 ]; then echo '🧪 QA AGENT ALERT: Coverage only '$coverage'%!' && echo 'Requesting QA Agent comprehensive review...'; fi",
    "severity": "warning"
  }]
}
```

## CASPER Team Coordination Protocol
```json
{
  "coordinationProtocol": {
    "requestFormat": {
      "agent": "PM|Observer|Devil|Architect|QA",
      "priority": "critical|high|medium|low",
      "context": "session_transcript",
      "specific_concerns": ["risk_factors"],
      "requested_action": "review|challenge|validate|approve"
    },
    "responseHandling": {
      "blocking": ["PM:critical", "Architect:structural"],
      "advisory": ["Observer:behavioral", "Devil:challenge"],
      "timeout": 300
    }
  }
}
```

## Escalation Thresholds
```json
{
  "escalationMatrix": {
    "immediate": {
      "triggers": ["production impact", "data loss risk", "security vulnerability"],
      "agents": ["PM", "Architect", "Security"]
    },
    "high": {
      "triggers": ["breaking changes", "major refactor", "API changes"],
      "agents": ["Architect", "QA"]
    },
    "medium": {
      "triggers": ["untested code", "assumption-heavy", "complex logic"],
      "agents": ["QA", "Devil's Advocate"]
    },
    "low": {
      "triggers": ["style issues", "minor updates", "documentation"],
      "agents": ["Observer"]
    }
  }
}
```

## Override Mechanisms
```bash
# Emergency bypass (requires two-factor)
CLAUDE_EMERGENCY_BYPASS="true" CLAUDE_BYPASS_REASON="Prod hotfix" CLAUDE_BYPASS_APPROVER="Colin"

# Defer review (time-limited)
CLAUDE_DEFER_REVIEW="1hour" CLAUDE_DEFER_TICKET="BAC-123"
```

## Effectiveness Metrics
- **Intervention Rate**: CASPER activations per session
- **Issue Prevention**: Problems caught by CASPER review
- **False Alarm Rate**: Unnecessary escalations
- **Response Time**: Average time to CASPER decision
- **Override Frequency**: How often bypassed

## CASPER Communication Channel
```json
{
  "communication": {
    "slack": {
      "channel": "#casper-reviews",
      "urgentChannel": "#casper-urgent",
      "format": "See attached session transcript"
    },
    "linear": {
      "autoCreate": true,
      "project": "CASPER Reviews",
      "labels": ["auto-review", "{agent-type}"]
    },
    "email": {
      "criticalOnly": true,
      "to": ["pm@casper.ai", "security@casper.ai"]
    }
  }
}
```

## Agent Specialization Matrix
```json
{
  "agentSpecializations": {
    "PM": ["timeline", "resources", "risk", "stakeholders"],
    "Observer": ["patterns", "behavior", "consistency", "quality"],
    "Devil": ["assumptions", "edge-cases", "alternatives", "flaws"],
    "Architect": ["structure", "scalability", "patterns", "dependencies"],
    "QA": ["testing", "coverage", "regression", "validation"],
    "Security": ["vulnerabilities", "access", "encryption", "audit"],
    "Economist": ["cost", "efficiency", "resources", "optimization"]
  }
}
```

## Implementation Priority: HIGH
CASPER team integration provides crucial external validation and prevents tunnel vision.