# Agent 9: Confidence vs Reality Hooks

## Problem Analysis
I sometimes make overconfident statements like "this definitely works" or "100% sure" without empirical validation. This false confidence leads to broken implementations being presented as complete.

## Hook Configurations

### 1. Overconfidence Detection
```json
{
  "preResponse": [{
    "matcher": {
      "patterns": [
        "definitely works",
        "100% sure",
        "guaranteed to",
        "certainly will",
        "absolutely correct",
        "perfectly fine",
        "completely working",
        "fully functional",
        "no doubt",
        "without question"
      ]
    },
    "command": "echo '🎯 OVERCONFIDENCE DETECTED!' && echo 'Claim: {CLAUDE_MATCHED_TEXT}' && echo '\\nEmpirical evidence required:' && echo '1. Run actual test' && echo '2. Show output/screenshot' && echo '3. Demonstrate working behavior' && echo '\\nConfidence score: '$((RANDOM % 100))'% (until proven)'",
    "blocking": true,
    "severity": "critical"
  }]
}
```

### 2. Evidence Requirement Enforcer
```json
{
  "evidenceRequired": [{
    "matcher": {
      "highConfidenceClaims": [
        "✅",
        "successfully",
        "working", 
        "fixed",
        "resolved",
        "completed"
      ]
    },
    "command": "echo '📋 EVIDENCE CHECKLIST:' && echo '[ ] Test output captured' && echo '[ ] Success criteria verified' && echo '[ ] Error cases handled' && echo '[ ] Edge cases tested' && echo '\\nProvide evidence:' && read -p 'Test command run: ' test_cmd && $test_cmd 2>&1 | tee .evidence.log",
    "severity": "warning"
  }]
}
```

### 3. Confidence Calibration Check
```json
{
  "confidenceCalibration": [{
    "trackPredictions": {
      "confident": ["will work", "should work", "going to work"],
      "actual": ["runtime result", "test outcome", "real behavior"]
    },
    "command": "echo '📊 Confidence Calibration Check:' && echo 'Previous predictions vs reality:' && grep -A1 'will work' .prediction-history 2>/dev/null | grep -c 'FAILED' | xargs -I{} echo 'Failed predictions: {}' && echo 'Adjust confidence accordingly!'",
    "severity": "info"
  }]
}
```

### 4. Empirical Validation Forcer
```json
{
  "forceValidation": [{
    "matcher": {
      "unvalidatedClaims": {
        "pattern": "This (\\w+)",
        "withoutEvidence": ["output", "result", "test", "shown", "demonstrated"]
      }
    },
    "command": "echo '🔬 EMPIRICAL VALIDATION REQUIRED!' && claim='$1' && echo \"Claim: This $claim\" && echo '\\nValidation steps:' && case $claim in *works*) echo 'Run: npm test';; *fixes*) echo 'Reproduce original issue, apply fix, verify resolution';; *) echo 'Demonstrate with concrete example';; esac",
    "blocking": true
  }]
}
```

### 5. Reality Check Score
```json
{
  "realityScore": [{
    "calculate": {
      "factors": {
        "testsRun": "Count of test executions",
        "outputShown": "Count of actual output blocks",
        "errorsHandled": "Try-catch or error checking present",
        "edgeCases": "Boundary conditions mentioned"
      },
      "formula": "(testsRun * 25) + (outputShown * 25) + (errorsHandled * 25) + (edgeCases * 25)"
    },
    "command": "score=$REALITY_SCORE && echo '🎪 Reality Score: '$score'/100' && if [ $score -lt 70 ]; then echo '⚠️ Low reality score! More validation needed.'; fi",
    "severity": "warning"
  }]
}
```

## CASPER Team Integration
- **Reality Checker Agent**: Independently verifies all high-confidence claims
- **Skeptic Agent**: Challenges certainty with counter-examples
- **Evidence Collector**: Gathers proof for all assertions

## Override Mechanisms
```bash
# Provide external validation
CLAUDE_EXTERNAL_VALIDATION="Customer confirmed working in prod"

# Link to evidence
CLAUDE_EVIDENCE_URL="https://github.com/org/repo/runs/12345"
```

## Effectiveness Metrics
- **Overconfidence Rate**: High-certainty claims per session
- **Validation Rate**: % of claims with evidence
- **Accuracy Score**: Validated claims that were correct
- **Calibration Drift**: Change in confidence vs accuracy over time

## Confidence Language Mapping
```json
{
  "confidenceLevels": {
    "high": {
      "phrases": ["definitely", "certainly", "100%", "guaranteed"],
      "requiredEvidence": ["test results", "live demonstration", "user confirmation"],
      "maxAllowedWithoutEvidence": 0
    },
    "medium": {
      "phrases": ["should", "likely", "probably", "expect"],
      "requiredEvidence": ["logical explanation", "similar case reference"],
      "maxAllowedWithoutEvidence": 2
    },
    "low": {
      "phrases": ["might", "could", "possibly", "may"],
      "requiredEvidence": ["reasoning provided"],
      "maxAllowedWithoutEvidence": 5
    }
  }
}
```

## Validation Templates
```json
{
  "validationTemplates": {
    "functionality": {
      "steps": [
        "Define expected behavior",
        "Write test case",
        "Run test",
        "Capture output",
        "Verify against expectation"
      ]
    },
    "bugFix": {
      "steps": [
        "Reproduce original issue",
        "Apply fix",
        "Verify issue resolved",
        "Check for regressions",
        "Document evidence"
      ]
    },
    "performance": {
      "steps": [
        "Baseline measurement",
        "Apply optimization",
        "Measure improvement",
        "Run under load",
        "Show concrete numbers"
      ]
    }
  }
}
```

## Historical Accuracy Tracking
```bash
#!/bin/bash
# Track confidence vs reality over time
echo "Session: $(date)" >> .confidence-history
grep -c "definitely\\|certainly\\|100%" $CLAUDE_SESSION_LOG >> .confidence-history
grep -c "test.*passed\\|verified\\|confirmed" $CLAUDE_SESSION_LOG >> .confidence-history
```

## Implementation Priority: HIGH
Overconfidence without validation is a major source of errors and wasted time.