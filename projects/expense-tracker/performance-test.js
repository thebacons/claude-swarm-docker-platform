// Performance Testing Suite for Expense Tracker
class PerformanceTestSuite {
  constructor() {
    this.results = {
      renderingTests: [],
      calculationTests: [],
      chartTests: [],
      memoryTests: [],
      interactionTests: [],
      largeDatasetTests: []
    };
    this.startTime = null;
    this.endTime = null;
  }

  // Utility to measure execution time
  measureTime(operation, callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    const duration = end - start;
    return { result, duration };
  }

  // Generate large dataset for stress testing
  generateLargeDataset(size) {
    const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];
    const descriptions = {
      Food: ['Groceries', 'Restaurant', 'Coffee', 'Lunch', 'Dinner', 'Snacks'],
      Transport: ['Gas', 'Uber', 'Bus ticket', 'Parking', 'Car maintenance'],
      Entertainment: ['Movie tickets', 'Concert', 'Games', 'Streaming service', 'Books'],
      Utilities: ['Electricity', 'Water', 'Internet', 'Phone bill', 'Gas bill'],
      Other: ['Clothes', 'Gifts', 'Medical', 'Home supplies', 'Pet supplies']
    };
    
    const expenses = [];
    const today = new Date();
    
    for (let i = 0; i < size; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const categoryDescriptions = descriptions[category];
      const description = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
      const amount = Math.random() * 200 + 10;
      const daysAgo = Math.floor(Math.random() * 365);
      const date = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      expenses.push({
        id: Date.now() + i + Math.random(),
        description: `${description} #${i + 1}`,
        amount: parseFloat(amount.toFixed(2)),
        category: category,
        date: date.toISOString().split('T')[0]
      });
    }
    
    return expenses;
  }

  // Test 1: Component Rendering Performance
  async testRenderingPerformance() {
    console.log('📊 Testing Rendering Performance...');
    const testSizes = [10, 50, 100, 500, 1000];
    
    for (const size of testSizes) {
      const expenses = this.generateLargeDataset(size);
      
      // Measure initial render
      const renderTest = this.measureTime(`Render ${size} expenses`, () => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
        location.reload();
      });
      
      this.results.renderingTests.push({
        test: `Initial render with ${size} expenses`,
        duration: renderTest.duration,
        itemsPerSecond: size / (renderTest.duration / 1000)
      });
      
      // Wait for render to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Test 2: Calculation Performance
  testCalculationPerformance() {
    console.log('🧮 Testing Calculation Performance...');
    const testSizes = [100, 500, 1000, 5000, 10000];
    
    for (const size of testSizes) {
      const expenses = this.generateLargeDataset(size);
      
      // Test total calculation
      const totalCalc = this.measureTime(`Calculate total for ${size} items`, () => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
      });
      
      // Test category grouping
      const categoryCalc = this.measureTime(`Group by category for ${size} items`, () => {
        const categoryMap = {};
        expenses.forEach(expense => {
          if (!categoryMap[expense.category]) {
            categoryMap[expense.category] = 0;
          }
          categoryMap[expense.category] += expense.amount;
        });
        return categoryMap;
      });
      
      // Test monthly grouping
      const monthlyCalc = this.measureTime(`Group by month for ${size} items`, () => {
        const monthMap = {};
        expenses.forEach(expense => {
          const date = new Date(expense.date);
          const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
          if (!monthMap[monthYear]) {
            monthMap[monthYear] = 0;
          }
          monthMap[monthYear] += expense.amount;
        });
        return monthMap;
      });
      
      // Test filtering
      const filterCalc = this.measureTime(`Filter by category for ${size} items`, () => {
        return expenses.filter(expense => expense.category === 'Food');
      });
      
      this.results.calculationTests.push({
        size,
        totalCalculation: totalCalc.duration,
        categoryGrouping: categoryCalc.duration,
        monthlyGrouping: monthlyCalc.duration,
        filtering: filterCalc.duration,
        totalOpsPerSecond: size / (totalCalc.duration / 1000)
      });
    }
  }

  // Test 3: Chart Rendering Performance
  testChartPerformance() {
    console.log('📈 Testing Chart Performance...');
    const testSizes = [10, 50, 100, 200, 500];
    
    for (const size of testSizes) {
      const expenses = this.generateLargeDataset(size);
      
      // Create mock canvas context for testing
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 400;
      mockCanvas.height = 400;
      const ctx = mockCanvas.getContext('2d');
      
      // Test pie chart rendering
      const pieChartTest = this.measureTime(`Render pie chart with ${size} items`, () => {
        // Simulate pie chart calculations and drawing
        const categoryMap = {};
        expenses.forEach(expense => {
          if (!categoryMap[expense.category]) {
            categoryMap[expense.category] = 0;
          }
          categoryMap[expense.category] += expense.amount;
        });
        
        const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);
        let currentAngle = 0;
        
        Object.entries(categoryMap).forEach(([category, amount]) => {
          const sliceAngle = (amount / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.arc(200, 200, 150, currentAngle, currentAngle + sliceAngle);
          ctx.fill();
          currentAngle += sliceAngle;
        });
      });
      
      // Test bar chart rendering
      const barChartTest = this.measureTime(`Render bar chart with ${size} items`, () => {
        // Simulate bar chart calculations and drawing
        const monthMap = {};
        expenses.forEach(expense => {
          const date = new Date(expense.date);
          const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
          if (!monthMap[monthYear]) {
            monthMap[monthYear] = 0;
          }
          monthMap[monthYear] += expense.amount;
        });
        
        const months = Object.keys(monthMap).slice(-6);
        months.forEach((month, index) => {
          const value = monthMap[month];
          const x = 50 + index * 50;
          const height = (value / 1000) * 200;
          ctx.fillRect(x, 400 - height, 40, height);
        });
      });
      
      this.results.chartTests.push({
        size,
        pieChartDuration: pieChartTest.duration,
        barChartDuration: barChartTest.duration,
        totalChartTime: pieChartTest.duration + barChartTest.duration,
        framesPerSecond: 1000 / (pieChartTest.duration + barChartTest.duration)
      });
    }
  }

  // Test 4: Memory Usage
  testMemoryUsage() {
    console.log('💾 Testing Memory Usage...');
    
    if (performance.memory) {
      const initialMemory = performance.memory.usedJSHeapSize;
      const testSizes = [100, 500, 1000, 5000];
      
      for (const size of testSizes) {
        const beforeMemory = performance.memory.usedJSHeapSize;
        const expenses = this.generateLargeDataset(size);
        const afterMemory = performance.memory.usedJSHeapSize;
        
        const memoryUsed = afterMemory - beforeMemory;
        const memoryPerItem = memoryUsed / size;
        
        this.results.memoryTests.push({
          size,
          totalMemoryUsed: memoryUsed,
          memoryPerItem,
          memoryInMB: memoryUsed / (1024 * 1024)
        });
        
        // Clean up
        expenses.length = 0;
      }
    } else {
      this.results.memoryTests.push({
        note: 'Memory API not available in this browser'
      });
    }
  }

  // Test 5: UI Interaction Performance
  testInteractionPerformance() {
    console.log('🖱️ Testing UI Interaction Performance...');
    
    // Test form input handling
    const inputTest = this.measureTime('Form input handling (1000 keystrokes)', () => {
      const input = document.createElement('input');
      for (let i = 0; i < 1000; i++) {
        input.value = `Test ${i}`;
        input.dispatchEvent(new Event('input'));
      }
    });
    
    // Test dropdown selection
    const selectTest = this.measureTime('Dropdown selection (500 changes)', () => {
      const select = document.createElement('select');
      ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        select.appendChild(option);
      });
      
      for (let i = 0; i < 500; i++) {
        select.selectedIndex = i % 5;
        select.dispatchEvent(new Event('change'));
      }
    });
    
    // Test button clicks
    const clickTest = this.measureTime('Button clicks (1000 clicks)', () => {
      const button = document.createElement('button');
      let clickCount = 0;
      button.addEventListener('click', () => clickCount++);
      
      for (let i = 0; i < 1000; i++) {
        button.click();
      }
    });
    
    this.results.interactionTests.push({
      inputHandling: {
        duration: inputTest.duration,
        eventsPerSecond: 1000 / (inputTest.duration / 1000)
      },
      dropdownSelection: {
        duration: selectTest.duration,
        eventsPerSecond: 500 / (selectTest.duration / 1000)
      },
      buttonClicks: {
        duration: clickTest.duration,
        eventsPerSecond: 1000 / (clickTest.duration / 1000)
      }
    });
  }

  // Test 6: Large Dataset Performance (100+ expenses)
  testLargeDatasetPerformance() {
    console.log('📦 Testing Large Dataset Performance...');
    const sizes = [100, 200, 500, 1000, 2000];
    
    for (const size of sizes) {
      const expenses = this.generateLargeDataset(size);
      
      // Test localStorage performance
      const saveTest = this.measureTime(`Save ${size} items to localStorage`, () => {
        localStorage.setItem('test-expenses', JSON.stringify(expenses));
      });
      
      const loadTest = this.measureTime(`Load ${size} items from localStorage`, () => {
        return JSON.parse(localStorage.getItem('test-expenses'));
      });
      
      // Test sorting performance
      const sortTest = this.measureTime(`Sort ${size} items by date`, () => {
        return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
      });
      
      // Test search performance
      const searchTest = this.measureTime(`Search ${size} items`, () => {
        const searchTerm = 'coffee';
        return expenses.filter(expense => 
          expense.description.toLowerCase().includes(searchTerm)
        );
      });
      
      // Clean up
      localStorage.removeItem('test-expenses');
      
      this.results.largeDatasetTests.push({
        size,
        localStorage: {
          save: saveTest.duration,
          load: loadTest.duration,
          totalTime: saveTest.duration + loadTest.duration
        },
        operations: {
          sorting: sortTest.duration,
          searching: searchTest.duration
        },
        throughput: {
          saveItemsPerSecond: size / (saveTest.duration / 1000),
          loadItemsPerSecond: size / (loadTest.duration / 1000),
          sortItemsPerSecond: size / (sortTest.duration / 1000),
          searchItemsPerSecond: size / (searchTest.duration / 1000)
        }
      });
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.values(this.results).flat().length,
        duration: this.endTime - this.startTime,
        browserInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          memory: performance.memory ? 'Available' : 'Not Available'
        }
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    
    // Analyze rendering performance
    const largeRenderTest = this.results.renderingTests.find(t => t.test.includes('1000'));
    if (largeRenderTest && largeRenderTest.duration > 100) {
      recommendations.push({
        category: 'Rendering',
        issue: 'Slow rendering with large datasets',
        recommendation: 'Implement virtual scrolling or pagination for expense lists',
        priority: 'High'
      });
    }
    
    // Analyze calculation performance
    const largeCalcTest = this.results.calculationTests.find(t => t.size >= 5000);
    if (largeCalcTest && largeCalcTest.totalCalculation > 50) {
      recommendations.push({
        category: 'Calculations',
        issue: 'Slow calculations with large datasets',
        recommendation: 'Use memoization for expensive calculations and implement Web Workers for heavy computations',
        priority: 'Medium'
      });
    }
    
    // Analyze chart performance
    const largeChartTest = this.results.chartTests.find(t => t.size >= 200);
    if (largeChartTest && largeChartTest.framesPerSecond < 30) {
      recommendations.push({
        category: 'Charts',
        issue: 'Low FPS in chart rendering',
        recommendation: 'Consider using WebGL-based charting libraries or implement data aggregation',
        priority: 'Medium'
      });
    }
    
    // Analyze memory usage
    const largeMemoryTest = this.results.memoryTests.find(t => t.size >= 1000);
    if (largeMemoryTest && largeMemoryTest.memoryInMB > 10) {
      recommendations.push({
        category: 'Memory',
        issue: 'High memory usage',
        recommendation: 'Implement data virtualization and cleanup unused references',
        priority: 'High'
      });
    }
    
    // Analyze localStorage performance
    const largeStorageTest = this.results.largeDatasetTests.find(t => t.size >= 1000);
    if (largeStorageTest && largeStorageTest.localStorage.save > 100) {
      recommendations.push({
        category: 'Storage',
        issue: 'Slow localStorage operations',
        recommendation: 'Consider using IndexedDB for large datasets or implement data compression',
        priority: 'Medium'
      });
    }
    
    return recommendations;
  }

  // Run all tests
  async runAllTests() {
    this.startTime = performance.now();
    
    console.log('🚀 Starting Performance Test Suite...\n');
    
    // Run tests
    this.testCalculationPerformance();
    this.testChartPerformance();
    this.testMemoryUsage();
    this.testInteractionPerformance();
    this.testLargeDatasetPerformance();
    
    this.endTime = performance.now();
    
    console.log('\n✅ Performance tests completed!');
    
    return this.generateReport();
  }
}

// Export for use
window.PerformanceTestSuite = PerformanceTestSuite;