// Optimized Charts Component for Expense Tracker
const ChartsOptimized = React.memo(({ expenses }) => {
  const pieChartRef = React.useRef(null);
  const barChartRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const [chartDimensions, setChartDimensions] = React.useState({ width: 300, height: 300 });
  
  // Memoized chart dimensions calculation
  React.useEffect(() => {
    let resizeTimeout;
    const updateDimensions = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const container = document.querySelector('.chart-canvas-container');
        if (container) {
          const width = Math.min(container.offsetWidth - 40, 400);
          setChartDimensions({ width, height: width });
        }
      }, 150); // Debounce resize events
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  // Category colors matching the app theme
  const categoryColors = {
    Food: '#f59e0b',
    Transport: '#3b82f6',
    Entertainment: '#ec4899',
    Utilities: '#8b5cf6',
    Other: '#6b7280'
  };
  
  // Memoized total calculation
  const totalExpenses = React.useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);
  
  // Memoized category grouping with data aggregation
  const expensesByCategory = React.useMemo(() => {
    const categoryMap = {};
    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });
    return categoryMap;
  }, [expenses]);
  
  // Memoized monthly expenses with optimized grouping
  const monthlyExpenses = React.useMemo(() => {
    const monthMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Use a more efficient grouping algorithm
    const expensesByMonth = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          total: 0,
          date: date,
          sortKey: date.getFullYear() * 12 + date.getMonth()
        };
      }
      acc[monthYear].total += expense.amount;
      return acc;
    }, {});
    
    // Sort and get last 6 months efficiently
    const sorted = Object.entries(expensesByMonth)
      .sort((a, b) => a[1].sortKey - b[1].sortKey)
      .slice(-6)
      .reduce((acc, [key, value]) => {
        acc[key] = value.total;
        return acc;
      }, {});
    
    return sorted;
  }, [expenses]);
  
  // Optimized pie chart drawing with animation
  const drawPieChart = React.useCallback(() => {
    const canvas = pieChartRef.current;
    if (!canvas || Object.keys(expensesByCategory).length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = chartDimensions;
    
    // Set canvas size only if changed
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    
    // Use requestAnimationFrame for smooth rendering
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 40;
      
      let currentAngle = -Math.PI / 2;
      const categories = Object.entries(expensesByCategory);
      
      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      categories.forEach(([category, amount]) => {
        const sliceAngle = (amount / totalExpenses) * 2 * Math.PI;
        
        // Draw slice with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, categoryColors[category]);
        gradient.addColorStop(1, adjustColor(categoryColors[category], -20));
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Smoother borders
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Optimized label rendering
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        
        // Add shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, labelX, labelY);
        ctx.shadowBlur = 0;
        
        currentAngle += sliceAngle;
      });
      
      // Draw center donut with shadow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Total in center
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`$${totalExpenses.toFixed(0)}`, centerX, centerY);
    };
    
    animationRef.current = requestAnimationFrame(render);
  }, [expensesByCategory, totalExpenses, chartDimensions]);
  
  // Optimized bar chart with data aggregation
  const drawBarChart = React.useCallback(() => {
    const canvas = barChartRef.current;
    if (!canvas || Object.keys(monthlyExpenses).length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = chartDimensions;
    
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const months = Object.keys(monthlyExpenses);
      const values = Object.values(monthlyExpenses);
      const maxValue = Math.max(...values) * 1.2;
      
      const chartPadding = 40;
      const chartWidth = width - chartPadding * 2;
      const chartHeight = height - chartPadding * 2;
      const barWidth = chartWidth / months.length * 0.7;
      const barSpacing = chartWidth / months.length * 0.3;
      
      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw axes with better styling
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartPadding, chartPadding);
      ctx.lineTo(chartPadding, height - chartPadding);
      ctx.lineTo(width - chartPadding, height - chartPadding);
      ctx.stroke();
      
      // Draw bars with animation effect
      months.forEach((month, index) => {
        const value = monthlyExpenses[month];
        const barHeight = (value / maxValue) * chartHeight;
        const x = chartPadding + (index * (barWidth + barSpacing)) + barSpacing / 2;
        const y = height - chartPadding - barHeight;
        
        // Create gradient for bars
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#4f46e5');
        
        // Draw bar with rounded top
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.arcTo(x, y, x + 4, y, 4);
        ctx.arcTo(x + barWidth, y, x + barWidth, y + 4, 4);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.lineTo(x, y + barHeight);
        ctx.closePath();
        ctx.fill();
        
        // Value label with better formatting
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`$${value.toFixed(0)}`, x + barWidth / 2, y - 5);
        
        // Optimized month label rendering
        ctx.save();
        ctx.translate(x + barWidth / 2, height - chartPadding + 20);
        ctx.rotate(-Math.PI / 6);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
        ctx.textAlign = 'right';
        ctx.fillText(month, 0, 0);
        ctx.restore();
      });
      
      // Optimized Y-axis labels
      const steps = 5;
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial';
      for (let i = 0; i <= steps; i++) {
        const value = (maxValue / steps) * i;
        const y = height - chartPadding - (i * chartHeight / steps);
        
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`$${value.toFixed(0)}`, chartPadding - 10, y);
        
        // Grid lines
        if (i > 0) {
          ctx.strokeStyle = '#f3f4f6';
          ctx.lineWidth = 0.5;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(chartPadding, y);
          ctx.lineTo(width - chartPadding, y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    };
    
    animationRef.current = requestAnimationFrame(render);
  }, [monthlyExpenses, chartDimensions]);
  
  // Helper function to adjust color brightness
  const adjustColor = (color, amount) => {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  
  // Cleanup animation frames
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Redraw charts only when necessary
  React.useEffect(() => {
    drawPieChart();
    drawBarChart();
  }, [drawPieChart, drawBarChart]);
  
  // Memoized statistics calculations
  const statistics = React.useMemo(() => {
    const months = Object.keys(monthlyExpenses).length;
    const avgMonthlySpending = months > 0 ? totalExpenses / months : 0;
    
    let highestCategory = { category: 'None', amount: 0 };
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      if (amount > highestCategory.amount) {
        highestCategory = { category, amount };
      }
    });
    
    return { avgMonthlySpending, highestCategory };
  }, [monthlyExpenses, totalExpenses, expensesByCategory]);
  
  const categoryIcons = {
    Food: '🍔',
    Transport: '🚗',
    Entertainment: '🎮',
    Utilities: '💡',
    Other: '📦'
  };
  
  if (expenses.length === 0) {
    return (
      <div className="charts-container">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p className="empty-state-text">No data to display</p>
          <p className="empty-state-subtext">Start adding expenses to see your charts</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="charts-container">
      {/* Summary Cards - Memoized to prevent re-renders */}
      <SummaryCards 
        totalExpenses={totalExpenses}
        expensesCount={expenses.length}
        avgMonthlySpending={statistics.avgMonthlySpending}
        monthsCount={Object.keys(monthlyExpenses).length}
        highestCategory={statistics.highestCategory}
        categoryIcons={categoryIcons}
      />
      
      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Expense Breakdown by Category</h3>
          <div className="chart-canvas-container">
            <canvas ref={pieChartRef}></canvas>
          </div>
          <ChartLegend 
            expensesByCategory={expensesByCategory}
            categoryColors={categoryColors}
          />
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title">Monthly Spending Trends</h3>
          <div className="chart-canvas-container">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
      </div>
      
      {/* Category Cards - Optimized with memoization */}
      <CategoryCards 
        expensesByCategory={expensesByCategory}
        totalExpenses={totalExpenses}
        expenses={expenses}
        categoryColors={categoryColors}
        categoryIcons={categoryIcons}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if expenses actually changed
  return prevProps.expenses.length === nextProps.expenses.length &&
         prevProps.expenses.reduce((sum, e) => sum + e.amount, 0) === 
         nextProps.expenses.reduce((sum, e) => sum + e.amount, 0);
});

// Memoized Summary Cards Component
const SummaryCards = React.memo(({ 
  totalExpenses, 
  expensesCount, 
  avgMonthlySpending, 
  monthsCount, 
  highestCategory, 
  categoryIcons 
}) => (
  <div className="summary-cards-grid">
    <div className="summary-card total-card">
      <div className="summary-card-icon">💰</div>
      <div className="summary-card-content">
        <h3 className="summary-card-title">Total Expenses</h3>
        <p className="summary-card-value">${totalExpenses.toFixed(2)}</p>
        <p className="summary-card-detail">{expensesCount} transactions</p>
      </div>
    </div>
    
    <div className="summary-card avg-card">
      <div className="summary-card-icon">📊</div>
      <div className="summary-card-content">
        <h3 className="summary-card-title">Monthly Average</h3>
        <p className="summary-card-value">${avgMonthlySpending.toFixed(2)}</p>
        <p className="summary-card-detail">Last {monthsCount} months</p>
      </div>
    </div>
    
    <div className="summary-card highest-card">
      <div className="summary-card-icon">{categoryIcons[highestCategory.category] || '📦'}</div>
      <div className="summary-card-content">
        <h3 className="summary-card-title">Highest Category</h3>
        <p className="summary-card-value">{highestCategory.category}</p>
        <p className="summary-card-detail">${highestCategory.amount.toFixed(2)}</p>
      </div>
    </div>
  </div>
));

// Memoized Chart Legend Component
const ChartLegend = React.memo(({ expensesByCategory, categoryColors }) => (
  <div className="chart-legend">
    {Object.entries(expensesByCategory).map(([category, amount]) => (
      <div key={category} className="legend-item">
        <span 
          className="legend-color" 
          style={{ backgroundColor: categoryColors[category] }}
        ></span>
        <span className="legend-label">{category}</span>
        <span className="legend-value">${amount.toFixed(2)}</span>
      </div>
    ))}
  </div>
));

// Memoized Category Cards Component
const CategoryCards = React.memo(({ 
  expensesByCategory, 
  totalExpenses, 
  expenses, 
  categoryColors, 
  categoryIcons 
}) => (
  <div className="category-cards-container">
    <h3 className="section-title">Category Breakdown</h3>
    <div className="category-cards-grid">
      {Object.entries(expensesByCategory).map(([category, amount]) => {
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        const categoryExpenses = expenses.filter(e => e.category === category);
        
        return (
          <div key={category} className="category-card" style={{ borderColor: categoryColors[category] }}>
            <div className="category-card-header">
              <span className="category-card-icon">{categoryIcons[category]}</span>
              <span className="category-card-name">{category}</span>
            </div>
            <div className="category-card-body">
              <p className="category-card-amount">${amount.toFixed(2)}</p>
              <p className="category-card-percentage">{percentage}% of total</p>
              <p className="category-card-count">{categoryExpenses.length} transactions</p>
            </div>
            <div className="category-card-bar">
              <div 
                className="category-card-bar-fill" 
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: categoryColors[category]
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
));

// Replace the global Charts with the optimized version
window.Charts = ChartsOptimized;