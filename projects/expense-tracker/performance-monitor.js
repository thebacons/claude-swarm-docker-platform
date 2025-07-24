// Real-time Performance Monitor for Expense Tracker
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: [],
      renderTime: [],
      memoryUsage: [],
      operationTimes: {}
    };
    this.isMonitoring = false;
    this.fpsInterval = null;
    this.lastFrameTime = performance.now();
  }

  // Start monitoring
  start() {
    this.isMonitoring = true;
    this.startFPSMonitoring();
    this.injectPerformanceHooks();
    this.createMonitorUI();
  }

  // Stop monitoring
  stop() {
    this.isMonitoring = false;
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval);
    }
    this.removeMonitorUI();
  }

  // Monitor FPS
  startFPSMonitoring() {
    let frameCount = 0;
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - this.lastFrameTime;
      
      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        this.metrics.fps.push(fps);
        if (this.metrics.fps.length > 60) {
          this.metrics.fps.shift();
        }
        this.updateFPSDisplay(fps);
        frameCount = 0;
        this.lastFrameTime = currentTime;
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };
    
    requestAnimationFrame(measureFPS);
  }

  // Measure operation performance
  measureOperation(operationName, operation) {
    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;
    
    if (!this.metrics.operationTimes[operationName]) {
      this.metrics.operationTimes[operationName] = [];
    }
    
    this.metrics.operationTimes[operationName].push(duration);
    if (this.metrics.operationTimes[operationName].length > 100) {
      this.metrics.operationTimes[operationName].shift();
    }
    
    this.updateOperationDisplay(operationName, duration);
    return result;
  }

  // Inject performance hooks into app
  injectPerformanceHooks() {
    // Hook into localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === 'expenses') {
        return this.measureOperation('localStorage.setItem', () => {
          return originalSetItem.call(localStorage, key, value);
        });
      }
      return originalSetItem.call(localStorage, key, value);
    };

    // Hook into array operations
    if (window.expenses) {
      const originalFilter = Array.prototype.filter;
      Array.prototype.filter = function(...args) {
        if (this === window.expenses) {
          return window.performanceMonitor.measureOperation('Array.filter', () => {
            return originalFilter.apply(this, args);
          });
        }
        return originalFilter.apply(this, args);
      };
    }
  }

  // Create monitor UI
  createMonitorUI() {
    const monitorHTML = `
      <div id="performance-monitor" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        min-width: 200px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      ">
        <div style="margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #444; padding-bottom: 5px;">
          🚀 Performance Monitor
        </div>
        <div id="fps-display" style="margin: 5px 0;">FPS: --</div>
        <div id="memory-display" style="margin: 5px 0;">Memory: --</div>
        <div id="operations-display" style="margin-top: 10px; border-top: 1px solid #444; padding-top: 5px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Recent Operations:</div>
        </div>
        <button onclick="window.performanceMonitor.toggle()" style="
          margin-top: 10px;
          background: #6366f1;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        ">Toggle Details</button>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', monitorHTML);
    
    // Update memory usage
    if (performance.memory) {
      setInterval(() => {
        const memoryMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
        document.getElementById('memory-display').textContent = `Memory: ${memoryMB} MB`;
      }, 1000);
    }
  }

  // Remove monitor UI
  removeMonitorUI() {
    const monitor = document.getElementById('performance-monitor');
    if (monitor) {
      monitor.remove();
    }
  }

  // Update displays
  updateFPSDisplay(fps) {
    const fpsDisplay = document.getElementById('fps-display');
    if (fpsDisplay) {
      const avgFPS = this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length;
      const color = fps < 30 ? '#ef4444' : fps < 50 ? '#f59e0b' : '#10b981';
      fpsDisplay.innerHTML = `FPS: <span style="color: ${color}">${fps}</span> (avg: ${avgFPS.toFixed(1)})`;
    }
  }

  updateOperationDisplay(operationName, duration) {
    const opsDisplay = document.getElementById('operations-display');
    if (opsDisplay) {
      const opDiv = document.getElementById(`op-${operationName}`) || document.createElement('div');
      opDiv.id = `op-${operationName}`;
      opDiv.style.margin = '2px 0';
      opDiv.style.fontSize = '11px';
      
      const color = duration > 100 ? '#ef4444' : duration > 50 ? '#f59e0b' : '#10b981';
      opDiv.innerHTML = `${operationName}: <span style="color: ${color}">${duration.toFixed(2)}ms</span>`;
      
      if (!document.getElementById(`op-${operationName}`)) {
        opsDisplay.appendChild(opDiv);
      }
      
      // Keep only last 5 operations visible
      const ops = opsDisplay.querySelectorAll('div[id^="op-"]');
      if (ops.length > 5) {
        ops[0].remove();
      }
    }
  }

  // Toggle detailed view
  toggle() {
    const monitor = document.getElementById('performance-monitor');
    if (monitor) {
      monitor.style.minWidth = monitor.style.minWidth === '200px' ? '300px' : '200px';
    }
  }

  // Get performance report
  getReport() {
    const avgFPS = this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length;
    const report = {
      averageFPS: avgFPS,
      currentMemoryMB: performance.memory ? 
        (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1) : 'N/A',
      operations: {}
    };
    
    for (const [op, times] of Object.entries(this.metrics.operationTimes)) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      report.operations[op] = {
        averageTime: avg.toFixed(2),
        callCount: times.length
      };
    }
    
    return report;
  }
}

// Create global instance
window.performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.addEventListener('load', () => {
    // window.performanceMonitor.start();
    console.log('Performance Monitor available. Call performanceMonitor.start() to begin monitoring.');
  });
}