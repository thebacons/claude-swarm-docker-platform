# CASPER Monitor - Detailed Test Cases & Implementation

## Critical Test Scenarios for Production

### 1. Agent Swarm Explosion Test

**Scenario**: Policeman agent spawns 50 subagents simultaneously

```javascript
// test-swarm-explosion.js
describe('Swarm Explosion Handling', () => {
  let monitor, mockAgents;

  beforeEach(() => {
    monitor = new CasperMonitor();
    mockAgents = new MockAgentSwarm();
  });

  test('handles 50 simultaneous subagent spawns', async () => {
    // Setup
    const policemanAgent = mockAgents.getAgent('policeman');
    const startTime = Date.now();
    
    // Action: Spawn 50 subagents at once
    const spawnPromises = Array(50).fill(null).map((_, i) => 
      policemanAgent.spawnSubagent({
        id: `police-sub-${i}`,
        task: `analyze-task-${i}`,
        priority: Math.random() > 0.5 ? 'high' : 'normal'
      })
    );

    // Monitor should receive all spawn events
    const spawnResults = await Promise.all(spawnPromises);
    
    // Assertions
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // Should handle in under 1 second
    expect(monitor.getSubagentCount('policeman')).toBe(50);
    expect(monitor.getDroppedEvents()).toBe(0);
    
    // UI should not freeze
    const fps = await monitor.measureRenderingFPS();
    expect(fps).toBeGreaterThan(30); // Minimum acceptable FPS
    
    // Memory should be reasonable
    const memUsage = await monitor.getMemoryUsage();
    expect(memUsage).toBeLessThan(200 * 1024 * 1024); // 200MB limit
  });

  test('handles rapid subagent lifecycle', async () => {
    // Simulate rapid spawn/complete/terminate cycles
    const cycles = 100;
    const cycleTime = 50; // 50ms per cycle
    
    for (let i = 0; i < cycles; i++) {
      // Spawn
      const subagentId = `rapid-sub-${i}`;
      await mockAgents.spawnSubagent('dev-1', subagentId);
      
      // Work
      await mockAgents.assignTask(subagentId, `task-${i}`);
      await delay(cycleTime);
      
      // Complete and terminate
      await mockAgents.completeTask(subagentId, `task-${i}`);
      await mockAgents.terminateSubagent(subagentId);
    }
    
    // Verify no memory leaks
    const initialMemory = monitor.getInitialMemory();
    const finalMemory = await monitor.getMemoryUsage();
    const leak = finalMemory - initialMemory;
    
    expect(leak).toBeLessThan(10 * 1024 * 1024); // Max 10MB growth
    
    // Verify event history is bounded
    const eventCount = monitor.getEventHistory().length;
    expect(eventCount).toBeLessThan(10000); // Should trim old events
  });
});
```

### 2. Message Storm Test

**Scenario**: Observer agent broadcasts 10,000 pattern detection events in 1 second

```javascript
// test-message-storm.js
describe('Message Storm Resilience', () => {
  test('handles 10K messages in 1 second', async () => {
    const monitor = new CasperMonitor();
    const messageGenerator = new MessageGenerator();
    
    // Generate realistic message distribution
    const messages = messageGenerator.generateStorm({
      total: 10000,
      duration: 1000,
      distribution: {
        'pattern_detected': 40,    // 4000 messages
        'task_update': 30,         // 3000 messages
        'agent_status': 20,        // 2000 messages
        'metric_update': 10        // 1000 messages
      }
    });
    
    // Measure processing
    const processingStart = Date.now();
    let processedCount = 0;
    let droppedCount = 0;
    
    // Send all messages
    for (const message of messages) {
      try {
        await monitor.processMessage(message);
        processedCount++;
      } catch (e) {
        droppedCount++;
      }
    }
    
    const processingTime = Date.now() - processingStart;
    
    // Assertions
    expect(processingTime).toBeLessThan(2000); // Should process within 2 seconds
    expect(droppedCount).toBe(0); // No messages dropped
    expect(monitor.getBackpressure()).toBeLessThan(0.5); // Backpressure under control
    
    // Verify data accuracy
    const stats = monitor.getStats();
    expect(stats.totalMessages).toBe(10000);
    expect(stats.patternCount).toBe(4000);
    expect(stats.taskUpdateCount).toBe(3000);
  });

  test('maintains order during burst', async () => {
    const monitor = new CasperMonitor();
    const ordered = [];
    
    // Send 1000 ordered messages rapidly
    const sendPromises = Array(1000).fill(null).map((_, i) => 
      monitor.processMessage({
        id: `msg-${i}`,
        sequence: i,
        timestamp: Date.now() + i,
        type: 'ordered_test'
      }).then(() => ordered.push(i))
    );
    
    await Promise.all(sendPromises);
    
    // Verify order maintained
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]).toBeGreaterThan(ordered[i-1]);
    }
  });
});
```

### 3. State Corruption Recovery Test

**Scenario**: Monitor receives conflicting state updates from multiple agents

```javascript
// test-state-corruption.js
describe('State Corruption Recovery', () => {
  test('resolves conflicting task ownership', async () => {
    const monitor = new CasperMonitor();
    
    // Both dev-1 and dev-2 claim ownership of same task
    await monitor.processMessage({
      type: 'task_claimed',
      agent: 'dev-1',
      task: 'task-100',
      timestamp: '2024-01-01T10:00:00Z'
    });
    
    await monitor.processMessage({
      type: 'task_claimed',
      agent: 'dev-2',
      task: 'task-100',
      timestamp: '2024-01-01T10:00:01Z' // 1 second later
    });
    
    // Monitor should detect conflict
    const conflicts = monitor.getStateConflicts();
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({
      type: 'task_ownership_conflict',
      task: 'task-100',
      agents: ['dev-1', 'dev-2']
    });
    
    // Should resolve based on timestamp
    const owner = monitor.getTaskOwner('task-100');
    expect(owner).toBe('dev-2'); // Later timestamp wins
    
    // Should emit warning
    const warnings = monitor.getWarnings();
    expect(warnings).toContainEqual(
      expect.objectContaining({
        type: 'conflict_resolved',
        details: expect.any(String)
      })
    );
  });

  test('handles circular task dependencies', async () => {
    const monitor = new CasperMonitor();
    
    // Create circular dependency
    await monitor.addTaskDependency('task-A', 'task-B');
    await monitor.addTaskDependency('task-B', 'task-C');
    await monitor.addTaskDependency('task-C', 'task-A'); // Circle!
    
    // Should detect cycle
    const cycles = monitor.detectDependencyCycles();
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(['task-A', 'task-B', 'task-C', 'task-A']);
    
    // Should prevent deadlock
    const executionOrder = monitor.getExecutionOrder();
    expect(executionOrder.error).toBe('circular_dependency_detected');
    
    // Should suggest resolution
    const resolution = monitor.suggestCycleResolution(cycles[0]);
    expect(resolution).toMatchObject({
      breakPoint: expect.any(String),
      reason: expect.any(String)
    });
  });
});
```

### 4. Network Partition Test

**Scenario**: Network split between monitor and half of the agents

```javascript
// test-network-partition.js
describe('Network Partition Handling', () => {
  test('handles split-brain scenario', async () => {
    const monitor = new CasperMonitor();
    const network = new NetworkSimulator();
    
    // Setup: 6 agents, split into 2 groups
    const group1 = ['pm', 'policeman', 'dev-1'];
    const group2 = ['dev-2', 'tester', 'observer'];
    
    // Create partition
    network.createPartition(group1, group2);
    
    // Group 1 continues working
    await monitor.processMessage({
      source: 'dev-1',
      type: 'task_progress',
      task: 'task-shared',
      progress: 50
    });
    
    // Group 2 also works on same task (doesn't know about group 1)
    await monitor.processMessage({
      source: 'dev-2',
      type: 'task_progress',
      task: 'task-shared',
      progress: 30
    });
    
    // Heal partition
    network.healPartition();
    
    // Monitor should detect split-brain
    const splitBrainEvents = monitor.getSplitBrainEvents();
    expect(splitBrainEvents).toHaveLength(1);
    expect(splitBrainEvents[0]).toMatchObject({
      type: 'split_brain_detected',
      conflictingAgents: expect.arrayContaining(['dev-1', 'dev-2']),
      affectedTasks: ['task-shared']
    });
    
    // Should reconcile state
    const reconciledState = await monitor.reconcileState();
    expect(reconciledState.conflicts).toHaveLength(1);
    expect(reconciledState.resolution).toBe('latest_timestamp_wins');
    
    // Should maintain audit trail
    const audit = monitor.getAuditLog('task-shared');
    expect(audit).toContainEqual(
      expect.objectContaining({
        event: 'split_brain_reconciliation',
        details: expect.any(Object)
      })
    );
  });

  test('graceful degradation during partition', async () => {
    const monitor = new CasperMonitor();
    const network = new NetworkSimulator();
    
    // Partition observer (metrics) agent
    network.isolateAgent('observer');
    
    // Monitor should detect missing metrics
    await delay(5000); // Wait for timeout
    
    const health = monitor.getSystemHealth();
    expect(health.metricsAvailable).toBe(false);
    expect(health.degradedMode).toBe(true);
    expect(health.functionality).toContain('metrics_unavailable');
    
    // UI should show warning
    const uiState = monitor.getUIState();
    expect(uiState.warnings).toContainEqual(
      expect.objectContaining({
        type: 'metrics_unavailable',
        message: expect.stringContaining('Observer agent unreachable')
      })
    );
    
    // Should still track basic operations
    await monitor.processMessage({
      source: 'dev-1',
      type: 'task_complete',
      task: 'task-during-partition'
    });
    
    const tasks = monitor.getCompletedTasks();
    expect(tasks).toContain('task-during-partition');
  });
});
```

### 5. Memory Leak Detection Test

**Scenario**: Long-running test to detect memory leaks

```javascript
// test-memory-leaks.js
describe('Memory Leak Detection', () => {
  test('no leaks during 1-hour operation', async () => {
    const monitor = new CasperMonitor();
    const memoryTracker = new MemoryTracker();
    
    // Baseline memory
    await gc(); // Force garbage collection
    const baselineMemory = memoryTracker.capture();
    
    // Simulate 1 hour of operation
    const startTime = Date.now();
    const duration = 60 * 60 * 1000; // 1 hour
    const messageRate = 100; // messages per second
    
    let messageCount = 0;
    while (Date.now() - startTime < duration) {
      // Generate realistic traffic
      const batch = generateMessageBatch(messageRate);
      
      for (const message of batch) {
        await monitor.processMessage(message);
        messageCount++;
      }
      
      // Simulate UI interactions
      if (messageCount % 1000 === 0) {
        monitor.expandAgentView('dev-1');
        monitor.filterTasks('active');
        monitor.collapseAgentView('dev-1');
      }
      
      // Check memory every minute
      if (messageCount % 6000 === 0) {
        await gc();
        const currentMemory = memoryTracker.capture();
        const growth = currentMemory - baselineMemory;
        
        // Log growth for analysis
        console.log(`Memory growth after ${messageCount} messages: ${growth / 1024 / 1024}MB`);
        
        // Fail fast if excessive growth
        if (growth > 500 * 1024 * 1024) { // 500MB
          throw new Error(`Excessive memory growth: ${growth / 1024 / 1024}MB`);
        }
      }
      
      await delay(1000); // 1 second between batches
    }
    
    // Final memory check
    await gc();
    const finalMemory = memoryTracker.capture();
    const totalGrowth = finalMemory - baselineMemory;
    
    // Assert acceptable memory growth
    expect(totalGrowth).toBeLessThan(100 * 1024 * 1024); // Max 100MB growth
    
    // Check for leaked objects
    const leaks = memoryTracker.findLeaks();
    expect(leaks.eventListeners).toBe(0);
    expect(leaks.detachedNodes).toBe(0);
    expect(leaks.timers).toBe(0);
  });

  test('cleanup on agent removal', async () => {
    const monitor = new CasperMonitor();
    
    // Add and remove agents repeatedly
    for (let i = 0; i < 100; i++) {
      const agentId = `temp-agent-${i}`;
      
      // Register agent
      await monitor.registerAgent({
        id: agentId,
        type: 'temporary',
        capabilities: ['task_execution']
      });
      
      // Add some state
      await monitor.processMessage({
        source: agentId,
        type: 'task_claim',
        task: `task-${i}`
      });
      
      // Add to UI
      monitor.displayAgent(agentId);
      
      // Remove agent
      await monitor.removeAgent(agentId);
    }
    
    // Verify cleanup
    const activeAgents = monitor.getActiveAgents();
    expect(activeAgents).toHaveLength(6); // Only permanent agents
    
    const uiElements = document.querySelectorAll('.agent-node');
    expect(uiElements).toHaveLength(6); // No orphaned UI elements
    
    const eventListeners = monitor.getEventListenerCount();
    expect(eventListeners).toBeLessThan(100); // Reasonable listener count
  });
});
```

### 6. Performance Under Load Test

**Scenario**: Verify performance with production-level load

```javascript
// test-performance-load.js
describe('Performance Under Load', () => {
  test('maintains 60 FPS with 100 active agents', async () => {
    const monitor = new CasperMonitor();
    const performanceMonitor = new PerformanceMonitor();
    
    // Create 100 agents with subagents
    for (let i = 0; i < 100; i++) {
      await monitor.registerAgent({
        id: `agent-${i}`,
        type: 'worker',
        subagents: Array(5).fill(null).map((_, j) => ({
          id: `agent-${i}-sub-${j}`,
          status: 'active'
        }))
      });
    }
    
    // Start performance monitoring
    performanceMonitor.start();
    
    // Simulate heavy activity for 30 seconds
    const testDuration = 30000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < testDuration) {
      // Update agent states
      const agentUpdates = Array(20).fill(null).map(() => ({
        agent: `agent-${Math.floor(Math.random() * 100)}`,
        status: ['active', 'busy', 'idle'][Math.floor(Math.random() * 3)]
      }));
      
      for (const update of agentUpdates) {
        await monitor.updateAgentStatus(update.agent, update.status);
      }
      
      // Animate messages
      monitor.animateMessage(
        `agent-${Math.floor(Math.random() * 100)}`,
        `agent-${Math.floor(Math.random() * 100)}`
      );
      
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    // Stop monitoring
    const metrics = performanceMonitor.stop();
    
    // Assertions
    expect(metrics.avgFPS).toBeGreaterThan(60);
    expect(metrics.minFPS).toBeGreaterThan(30);
    expect(metrics.droppedFrames).toBeLessThan(100);
    expect(metrics.longTasks).toBeLessThan(10); // Tasks over 50ms
    
    // UI responsiveness
    const clickResponse = await measureClickResponse();
    expect(clickResponse).toBeLessThan(100); // 100ms
  });

  test('handles 1000 concurrent tasks', async () => {
    const monitor = new CasperMonitor();
    
    // Create 1000 tasks across agents
    const tasks = Array(1000).fill(null).map((_, i) => ({
      id: `task-${i}`,
      agent: `agent-${i % 50}`, // Distribute across 50 agents
      subagent: `sub-${i % 10}`,
      progress: 0,
      status: 'active'
    }));
    
    // Add all tasks
    const addStart = Date.now();
    for (const task of tasks) {
      await monitor.addTask(task);
    }
    const addTime = Date.now() - addStart;
    
    expect(addTime).toBeLessThan(1000); // Add all tasks in under 1 second
    
    // Update all task progress
    const updateStart = Date.now();
    for (let progress = 0; progress <= 100; progress += 10) {
      const updates = tasks.map(task => ({
        id: task.id,
        progress: progress
      }));
      
      await monitor.batchUpdateTasks(updates);
      
      // Verify UI updates
      const visibleTasks = monitor.getVisibleTasks();
      expect(visibleTasks.every(t => t.progress === progress)).toBe(true);
    }
    const updateTime = Date.now() - updateStart;
    
    expect(updateTime).toBeLessThan(5000); // Update all tasks in under 5 seconds
    
    // Verify final state
    const completedTasks = monitor.getTasksByStatus('completed');
    expect(completedTasks).toHaveLength(1000);
  });
});
```

### 7. Data Integrity Test

**Scenario**: Verify no data loss under various failure conditions

```javascript
// test-data-integrity.js
describe('Data Integrity', () => {
  test('no message loss during reconnection', async () => {
    const monitor = new CasperMonitor();
    const messageLog = new MessageLog();
    
    // Send messages before disconnect
    const beforeMessages = Array(100).fill(null).map((_, i) => ({
      id: `before-${i}`,
      type: 'task_update',
      timestamp: Date.now() + i
    }));
    
    for (const msg of beforeMessages) {
      messageLog.record(msg);
      await monitor.processMessage(msg);
    }
    
    // Simulate disconnect
    monitor.disconnect();
    
    // Send messages during disconnect (should be queued)
    const duringMessages = Array(50).fill(null).map((_, i) => ({
      id: `during-${i}`,
      type: 'task_update',
      timestamp: Date.now() + 100 + i
    }));
    
    for (const msg of duringMessages) {
      messageLog.record(msg);
      monitor.queueMessage(msg); // Should queue while disconnected
    }
    
    // Reconnect
    await monitor.reconnect();
    
    // Send messages after reconnect
    const afterMessages = Array(100).fill(null).map((_, i) => ({
      id: `after-${i}`,
      type: 'task_update',
      timestamp: Date.now() + 200 + i
    }));
    
    for (const msg of afterMessages) {
      messageLog.record(msg);
      await monitor.processMessage(msg);
    }
    
    // Verify all messages processed
    const processedMessages = monitor.getProcessedMessages();
    const recordedMessages = messageLog.getAll();
    
    expect(processedMessages.length).toBe(250); // All messages
    expect(processedMessages.map(m => m.id)).toEqual(recordedMessages.map(m => m.id));
    
    // Verify order maintained
    const timestamps = processedMessages.map(m => m.timestamp);
    const sorted = [...timestamps].sort((a, b) => a - b);
    expect(timestamps).toEqual(sorted);
  });

  test('accurate task completion tracking', async () => {
    const monitor = new CasperMonitor();
    const taskTracker = new TaskTracker();
    
    // Create complex task hierarchy
    const mainTasks = Array(10).fill(null).map((_, i) => ({
      id: `main-${i}`,
      subtasks: Array(5).fill(null).map((_, j) => `sub-${i}-${j}`)
    }));
    
    // Register all tasks
    for (const mainTask of mainTasks) {
      taskTracker.register(mainTask.id);
      await monitor.createTask(mainTask.id);
      
      for (const subtask of mainTask.subtasks) {
        taskTracker.register(subtask, mainTask.id);
        await monitor.createSubtask(mainTask.id, subtask);
      }
    }
    
    // Complete tasks in random order
    const allTasks = mainTasks.flatMap(t => [t.id, ...t.subtasks]);
    const shuffled = [...allTasks].sort(() => Math.random() - 0.5);
    
    for (const taskId of shuffled) {
      taskTracker.complete(taskId);
      await monitor.completeTask(taskId);
      
      // Verify consistency
      const monitorStatus = monitor.getTaskStatus(taskId);
      const trackerStatus = taskTracker.getStatus(taskId);
      expect(monitorStatus).toBe(trackerStatus);
    }
    
    // Verify aggregate statistics
    const monitorStats = monitor.getTaskStats();
    const trackerStats = taskTracker.getStats();
    
    expect(monitorStats.total).toBe(trackerStats.total);
    expect(monitorStats.completed).toBe(trackerStats.completed);
    expect(monitorStats.completionRate).toBeCloseTo(1.0, 2);
    
    // Verify parent task completion logic
    for (const mainTask of mainTasks) {
      const status = monitor.getTaskStatus(mainTask.id);
      expect(status).toBe('completed'); // Should be complete when all subtasks done
    }
  });
});
```

### 8. UI Stress Test

**Scenario**: Test UI performance with extreme visual load

```javascript
// test-ui-stress.js
describe('UI Stress Testing', () => {
  test('animation performance with 100 concurrent messages', async () => {
    const monitor = new CasperMonitor();
    const ui = monitor.getUI();
    
    // Create message animations
    const animations = [];
    for (let i = 0; i < 100; i++) {
      const fromAgent = `agent-${i % 20}`;
      const toAgent = `agent-${(i + 5) % 20}`;
      
      animations.push(ui.animateMessage(fromAgent, toAgent, {
        duration: 2000,
        color: `hsl(${i * 3.6}, 70%, 50%)`
      }));
    }
    
    // Measure frame rate during animations
    const frameRates = [];
    let lastTime = performance.now();
    
    const measureFrameRate = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      const fps = 1000 / delta;
      frameRates.push(fps);
      lastTime = currentTime;
      
      if (animations.some(a => a.isRunning())) {
        requestAnimationFrame(measureFrameRate);
      }
    };
    
    requestAnimationFrame(measureFrameRate);
    
    // Wait for animations to complete
    await Promise.all(animations.map(a => a.complete()));
    
    // Analyze frame rates
    const avgFPS = frameRates.reduce((a, b) => a + b) / frameRates.length;
    const minFPS = Math.min(...frameRates);
    
    expect(avgFPS).toBeGreaterThan(30);
    expect(minFPS).toBeGreaterThan(20);
  });

  test('scroll performance with 10000 log entries', async () => {
    const monitor = new CasperMonitor();
    const logWindow = monitor.getLogWindow();
    
    // Add 10000 log entries
    const entries = Array(10000).fill(null).map((_, i) => ({
      timestamp: new Date(),
      level: ['info', 'warning', 'error'][i % 3],
      message: `Log entry ${i}: ${generateRandomMessage()}`,
      source: `agent-${i % 10}`
    }));
    
    const addStart = performance.now();
    for (const entry of entries) {
      logWindow.addEntry(entry);
    }
    const addTime = performance.now() - addStart;
    
    expect(addTime).toBeLessThan(1000); // Add all in under 1 second
    
    // Test scroll performance
    const scrollTests = [
      { to: 'bottom', position: 10000 },
      { to: 'top', position: 0 },
      { to: 'middle', position: 5000 },
      { to: 'search', position: 7500, search: 'error' }
    ];
    
    for (const test of scrollTests) {
      const scrollStart = performance.now();
      
      if (test.search) {
        await logWindow.scrollToSearch(test.search);
      } else {
        await logWindow.scrollToPosition(test.position);
      }
      
      const scrollTime = performance.now() - scrollStart;
      expect(scrollTime).toBeLessThan(100); // Smooth scroll in under 100ms
      
      // Verify virtual scrolling
      const visibleEntries = logWindow.getVisibleEntries();
      expect(visibleEntries.length).toBeLessThan(100); // Only render visible
    }
  });
});
```

## Test Execution Plan

### Phase 1: Critical Path Tests (Days 1-3)
1. Agent Swarm Explosion Test
2. Message Storm Test
3. Network Partition Test
4. State Corruption Recovery Test

### Phase 2: Reliability Tests (Days 4-6)
5. Memory Leak Detection Test
6. Data Integrity Test
7. Performance Under Load Test

### Phase 3: Production Simulation (Days 7-10)
8. UI Stress Test
9. Full integration test with all scenarios
10. 48-hour soak test

### Test Environment Requirements

```yaml
Hardware:
  CPU: 8 cores minimum
  RAM: 16GB minimum
  Network: 1Gbps
  Storage: 100GB SSD

Software:
  - Node.js 18+
  - Chrome 120+ (for UI tests)
  - Docker (for agent simulation)
  - Redis (for state management)
  - PostgreSQL (for audit logs)

Test Data:
  - 1M pre-generated messages
  - 100 agent profiles
  - 10K task definitions
  - Network failure scenarios
  - Performance baselines
```

### Success Criteria

All tests must pass with:
- Zero data loss
- No memory leaks
- Performance within benchmarks
- Graceful failure handling
- Complete audit trails
- UI responsiveness maintained

This comprehensive test suite ensures the CASPER Monitor is production-ready for monitoring 50-100+ agents in parallel execution scenarios.