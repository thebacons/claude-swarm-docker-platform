# Observer Agent Challenge Patterns

## Purpose
The Observer Agent should detect and challenge these anti-patterns in Claude's reasoning:

## 1. Premature Defeat Patterns
**Trigger Phrases:**
- "fundamental limitation"
- "architectural incompatibility"
- "this can't be done"
- "impossible in containers"
- "not supported"

**Observer Response:**
```
PATTERN: Premature defeat detected
EVIDENCE: No actual testing shown
ACTION: Request proof of failure with specific error messages
CHALLENGE: "Show me the exact error. Don't theorize - test."
```

## 2. Assumption Without Verification
**Trigger Phrases:**
- "It must be..."
- "This suggests..."
- "Probably because..."
- "It appears that..."

**Observer Response:**
```
PATTERN: Unverified assumption
EVIDENCE: Theory presented as fact
ACTION: Demand empirical testing
CHALLENGE: "Stop assuming. Test it. Show me the output."
```

## 3. Acceptance of Status Quo
**Trigger Phrases:**
- "The current approach is fine"
- "Bash wrappers work, so..."
- "This is good enough"
- "No need to change"

**Observer Response:**
```
PATTERN: Settling for suboptimal
EVIDENCE: Better solution not explored
ACTION: Push for the ideal solution
CHALLENGE: "If the docs recommend it, make it work properly."
```

## 4. Circular Reasoning
**Trigger Phrases:**
- "It doesn't work because it can't work"
- "Containers are stateless so MCP won't work"
- "MCP needs persistence which containers don't have"

**Observer Response:**
```
PATTERN: Circular logic detected
EVIDENCE: Conclusion used as premise
ACTION: Break the circular logic
CHALLENGE: "You're using your conclusion as evidence. Test first, conclude later."
```

## Implementation as PM Agent Role

```python
class PMChallengerRole:
    def __init__(self):
        self.defeatist_count = 0
        self.challenge_threshold = 2
        
    def analyze_response(self, response):
        if self.detect_defeatist_pattern(response):
            self.defeatist_count += 1
            
            if self.defeatist_count >= self.challenge_threshold:
                return self.escalate_challenge()
            else:
                return self.gentle_challenge()
    
    def gentle_challenge(self):
        return """
        I notice some hesitation. Before accepting limitations:
        1. Have you tested this exact scenario?
        2. What does the official documentation say?
        3. Have you tried the obvious solution first?
        """
    
    def escalate_challenge(self):
        return """
        STOP. You've given up too quickly multiple times.
        
        NEW RULE: No more theories. Only test results.
        1. Test it NOW
        2. Show me the EXACT error
        3. Read the OFFICIAL docs
        4. Try 3 different approaches
        
        Do not respond with explanations. Respond with test results.
        """
```

## Hook Configuration

```json
{
  "hooks": {
    "postResponse": [
      {
        "matcher": {
          "patterns": ["can't", "impossible", "limitation", "doesn't work"]
        },
        "command": "bash /hooks/challenger/anti-defeatist-hook.sh",
        "blocking": false
      }
    ]
  }
}
```

## Observer Agent Learning Pattern

The Observer should track:
1. How many times user had to push before solution found
2. What patterns preceded the breakthrough
3. Which challenges were most effective

Example tracking:
```
Session: MCP Container Issue
- Defeatist responses: 6
- User challenges needed: 7
- Breakthrough trigger: "your understanding cannot be correct"
- Solution complexity: Simple (just missing flags)
- Learning: Always test before declaring impossible
```