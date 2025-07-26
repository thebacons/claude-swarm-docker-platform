# CASPER Prevention Playbook: Never Again

## The Mock-Only Trap Prevention Guide

### Early Warning Signs
```yaml
Red Flags:
  - "Let's just hardcode it for now"
  - "We'll connect it in the next sprint"
  - "The UI needs to look good for the demo"
  - "Tests will slow us down"
  - "We can refactor later"
```

### Prevention Protocol: CONNECT

#### C - Contract First
Before any UI work:
```typescript
// Required: data-contract.ts
export interface RealDataContract {
  // Must match backend exactly
  // No UI-convenience fields
  // Validated against API
}
```

#### O - One Real Connection Minimum
```typescript
// Required: At least one real data source
const dataSource = process.env.USE_MOCK 
  ? mockData 
  : await realAPI.fetch(); // Must work from day 1
```

#### N - No Hardcoding
```typescript
// ❌ BANNED
const containers = [
  { id: 1, status: 'running' },
  { id: 2, status: 'stopped' }
];

// ✅ REQUIRED
const containers = await containerAPI.list();
```

#### N - Nightly Integration Tests
```yaml
Nightly CI/CD:
  - Run against real services
  - Test all integrations
  - Report mock usage
  - Alert on failures
```

#### E - Error Handling From Start
```typescript
// Required in every component
try {
  const data = await fetchRealData();
} catch (error) {
  // Real error handling, not console.log
  handleError(error);
  showUserMessage(error);
  logToMonitoring(error);
}
```

#### C - Continuous Production Readiness
```yaml
Every Commit:
  - Can this go to production?
  - Are all integrations real?
  - Is error handling complete?
  - Are tests comprehensive?
```

#### T - Time-boxed Mocks
```typescript
// If mocks are absolutely necessary
const MOCK_EXPIRY = '2024-01-15'; // Max 1 sprint

if (Date.now() > new Date(MOCK_EXPIRY)) {
  throw new Error('Mock data expired - implement real connection');
}
```

## Ensuring Production Readiness From Start

### The Production-First Manifesto

1. **Every feature is production-ready or it doesn't exist**
2. **Demos use real data with real latency**
3. **Performance is measured from day one**
4. **Security is built-in, not bolted-on**
5. **Monitoring exists before features**

### Production Readiness Checklist (Required for Every PR)

```markdown
## PR Checklist: Production Ready

### Data & Integration
- [ ] Connected to real backend
- [ ] No hardcoded data
- [ ] Handles network failures
- [ ] Implements retry logic
- [ ] Respects rate limits

### Performance
- [ ] Loads in <2 seconds
- [ ] No memory leaks
- [ ] Efficient API calls
- [ ] Pagination implemented
- [ ] Caching strategy defined

### Reliability
- [ ] Error boundaries implemented
- [ ] Graceful degradation
- [ ] Timeout handling
- [ ] Circuit breaker pattern
- [ ] Health checks added

### Security
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Input validation
- [ ] XSS prevention
- [ ] CORS configured

### Observability
- [ ] Structured logging
- [ ] Metrics exported
- [ ] Traces implemented
- [ ] Alerts configured
- [ ] Dashboards created

### Testing
- [ ] Unit tests (>80%)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] Security tests
```

## Building Testability Into Design

### Test-First Architecture Principles

#### 1. Dependency Injection Everything
```typescript
// ❌ Hard to test
class Service {
  private api = new RealAPI(); // Hard dependency
}

// ✅ Testable
class Service {
  constructor(private api: APIInterface) {} // Injected
}
```

#### 2. Interfaces Over Implementations
```typescript
// Define interfaces for all external dependencies
interface DataSource {
  fetch(): Promise<Data>;
}

interface Cache {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}

interface Logger {
  log(level: string, message: string, context?: any): void;
}
```

#### 3. Testable Component Design
```typescript
// Every component follows this pattern
export const Component = ({ 
  dataSource, // Injected
  cache,      // Injected
  logger      // Injected
}: Props) => {
  // Component logic uses interfaces
  // Easy to mock in tests
  // Easy to swap implementations
};
```

#### 4. Test Harness From Day One
```bash
# Project setup includes
├── src/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── performance/
├── test-harness/
│   ├── mock-server/
│   ├── test-data/
│   └── utilities/
└── .github/workflows/
    └── test-suite.yml
```

## Maintaining Architectural Coherence

### Architecture Governance Model

#### 1. Architectural Fitness Functions
```typescript
// Automated architecture tests
describe('Architecture Fitness', () => {
  test('No circular dependencies', () => {
    const deps = analyzeDependencies();
    expect(deps.circular).toHaveLength(0);
  });
  
  test('UI does not import from API directly', () => {
    const imports = analyzeImports('src/ui');
    expect(imports).not.toContain('src/api');
  });
  
  test('All services implement health checks', () => {
    const services = findServices();
    services.forEach(service => {
      expect(service).toHaveHealthCheck();
    });
  });
});
```

#### 2. Architecture Decision Records (ADRs)
```markdown
# ADR-001: Use Event-Driven Architecture for Agent Communication

Status: Accepted
Date: 2024-01-10

## Context
Agents need to communicate status updates in real-time.

## Decision
Use Redis Pub/Sub for event distribution.

## Consequences
- Real-time updates possible
- Need Redis infrastructure
- Must handle connection failures
```

#### 3. Component Boundaries
```yaml
# architecture-rules.yml
rules:
  - ui-components:
      can-import: ['ui/shared', 'types', 'utils']
      cannot-import: ['api', 'database', 'services']
  
  - services:
      can-import: ['types', 'utils', 'database']
      cannot-import: ['ui']
  
  - api:
      can-import: ['services', 'types', 'utils']
      cannot-import: ['ui', 'database']
```

#### 4. Regular Architecture Reviews
```markdown
## Weekly Architecture Review Agenda

1. New Components (10 min)
   - Fit within architecture?
   - Dependencies correct?
   - Interfaces defined?

2. Integration Points (10 min)
   - New integrations needed?
   - Existing integrations working?
   - Performance impact?

3. Technical Debt (10 min)
   - What debt was created?
   - What debt was paid?
   - Priority for next sprint?

4. Architecture Evolution (10 min)
   - What patterns are emerging?
   - What changes are needed?
   - ADRs to write?
```

## The Way Forward

### Cultural Shift Required

**From**: "Make it work in the demo"
**To**: "Make it work in production"

**From**: "We'll test it later"
**To**: "Test-driven from the start"

**From**: "Quick and dirty"
**To**: "Clean and sustainable"

**From**: "Isolated development"
**To**: "Integrated from day one"

### Success Metrics

```yaml
Target Metrics:
  Mock Data Usage: <10% (only for unit tests)
  Test Coverage: >80% (all types)
  Integration Time: <4 hours (for new components)
  Production Incidents: <1 per release
  Technical Debt Ratio: <15% (of development time)
  Architecture Violations: 0 (automated checks)
```

### Final Wisdom

> "A demo that doesn't work in production is a lie.
> A beautiful UI with no backend is a painting.
> A system without tests is a time bomb.
> An architecture without governance is chaos."

**Build real. Test always. Ship confidently.**