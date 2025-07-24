// Accessible Charts Component for Expense Tracker
const Charts = ({ expenses }) => {
  const pieChartRef = React.useRef(null);
  const barChartRef = React.useRef(null);
  const [chartDimensions, setChartDimensions] = React.useState({ width: 300, height: 300 });
  const [showDataTable, setShowDataTable] = React.useState(false);
  
  // Calculate chart dimensions based on container
  React.useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.chart-canvas-container');
      if (container) {
        const width = Math.min(container.offsetWidth - 40, 400);
        setChartDimensions({ width, height: width });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Category colors matching the app theme
  const categoryColors = {
    Food: '#f59e0b',
    Transport: '#3b82f6',
    Entertainment: '#ec4899',
    Utilities: '#8b5cf6',
    Other: '#6b7280'
  };
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate expenses by category
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
  
  // Calculate monthly expenses
  const monthlyExpenses = React.useMemo(() => {
    const monthMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (!monthMap[monthYear]) {
        monthMap[monthYear] = 0;
      }
      monthMap[monthYear] += expense.amount;
    });
    
    // Sort by date and get last 6 months
    const sortedMonths = Object.entries(monthMap)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA - dateB;
      })
      .slice(-6);
    
    return Object.fromEntries(sortedMonths);
  }, [expenses]);
  
  // Draw pie chart (same as original)
  const drawPieChart = React.useCallback(() => {
    const canvas = pieChartRef.current;
    if (!canvas || Object.keys(expensesByCategory).length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = chartDimensions;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate chart dimensions
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    // Calculate angles for each category
    let currentAngle = -Math.PI / 2; // Start at top
    const categories = Object.entries(expensesByCategory);
    
    // Draw pie slices
    categories.forEach(([category, amount]) => {
      const sliceAngle = (amount / totalExpenses) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = categoryColors[category];
      ctx.fill();
      
      // Draw slice border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Calculate label position
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      // Draw percentage
      const percentage = ((amount / totalExpenses) * 100).toFixed(1);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${percentage}%`, labelX, labelY);
      
      currentAngle += sliceAngle;
    });
    
    // Draw center circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Draw total in center
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`$${totalExpenses.toFixed(0)}`, centerX, centerY);
  }, [expensesByCategory, totalExpenses, chartDimensions]);
  
  // Draw bar chart (same as original)
  const drawBarChart = React.useCallback(() => {
    const canvas = barChartRef.current;
    if (!canvas || Object.keys(monthlyExpenses).length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = chartDimensions;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const months = Object.keys(monthlyExpenses);
    const values = Object.values(monthlyExpenses);
    const maxValue = Math.max(...values) * 1.2; // Add 20% padding
    
    const chartPadding = 40;
    const chartWidth = width - chartPadding * 2;
    const chartHeight = height - chartPadding * 2;
    const barWidth = chartWidth / months.length * 0.7;
    const barSpacing = chartWidth / months.length * 0.3;
    
    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartPadding, chartPadding);
    ctx.lineTo(chartPadding, height - chartPadding);
    ctx.lineTo(width - chartPadding, height - chartPadding);
    ctx.stroke();
    
    // Draw bars
    months.forEach((month, index) => {
      const value = monthlyExpenses[month];
      const barHeight = (value / maxValue) * chartHeight;
      const x = chartPadding + (index * (barWidth + barSpacing)) + barSpacing / 2;
      const y = height - chartPadding - barHeight;
      
      // Draw bar
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw value on top of bar
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`$${value.toFixed(0)}`, x + barWidth / 2, y - 5);
      
      // Draw month label
      ctx.save();
      ctx.translate(x + barWidth / 2, height - chartPadding + 20);
      ctx.rotate(-Math.PI / 6); // Rotate 30 degrees
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(month, 0, 0);
      ctx.restore();
    });
  }, [monthlyExpenses, chartDimensions]);
  
  // Redraw charts when data changes
  React.useEffect(() => {
    drawPieChart();
    drawBarChart();
  }, [drawPieChart, drawBarChart]);
  
  // Calculate statistics
  const avgMonthlySpending = React.useMemo(() => {
    const months = Object.keys(monthlyExpenses).length;
    return months > 0 ? totalExpenses / months : 0;
  }, [monthlyExpenses, totalExpenses]);
  
  const highestCategory = React.useMemo(() => {
    let highest = { category: 'None', amount: 0 };
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      if (amount > highest.amount) {
        highest = { category, amount };
      }
    });
    return highest;
  }, [expensesByCategory]);
  
  const categoryIcons = {
    Food: '🍔',
    Transport: '🚗',
    Entertainment: '🎮',
    Utilities: '💡',
    Other: '📦'
  };
  
  // Generate text summary for screen readers
  const generateChartSummary = () => {
    const categoryList = Object.entries(expensesByCategory)
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)} (${((amt/totalExpenses)*100).toFixed(1)}%)`)
      .join(', ');
    
    const monthlyList = Object.entries(monthlyExpenses)
      .map(([month, amt]) => `${month}: $${amt.toFixed(2)}`)
      .join(', ');
    
    return {
      categoryBreakdown: categoryList,
      monthlyTrend: monthlyList
    };
  };
  
  const chartSummary = generateChartSummary();
  
  if (expenses.length === 0) {
    return (
      <div className="charts-container">
        <div className="empty-state" role="status">
          <div className="empty-state-icon" aria-hidden="true">📊</div>
          <p className="empty-state-text">No data to display</p>
          <p className="empty-state-subtext">Start adding expenses to see your charts</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="charts-container">
      {/* Summary Cards */}
      <div className="summary-cards-grid" role="region" aria-label="Expense statistics">
        <div className="summary-card total-card">
          <div className="summary-card-icon" aria-hidden="true">💰</div>
          <div className="summary-card-content">
            <h3 className="summary-card-title" id="total-expenses-stat">Total Expenses</h3>
            <p className="summary-card-value" aria-labelledby="total-expenses-stat">
              ${totalExpenses.toFixed(2)}
            </p>
            <p className="summary-card-detail">
              <span className="sr-only">Number of transactions: </span>
              {expenses.length} transactions
            </p>
          </div>
        </div>
        
        <div className="summary-card avg-card">
          <div className="summary-card-icon" aria-hidden="true">📊</div>
          <div className="summary-card-content">
            <h3 className="summary-card-title" id="monthly-avg-stat">Monthly Average</h3>
            <p className="summary-card-value" aria-labelledby="monthly-avg-stat">
              ${avgMonthlySpending.toFixed(2)}
            </p>
            <p className="summary-card-detail">
              Last {Object.keys(monthlyExpenses).length} months
            </p>
          </div>
        </div>
        
        <div className="summary-card highest-card">
          <div className="summary-card-icon" aria-hidden="true">
            {categoryIcons[highestCategory.category] || '📦'}
          </div>
          <div className="summary-card-content">
            <h3 className="summary-card-title" id="highest-cat-stat">Highest Category</h3>
            <p className="summary-card-value" aria-labelledby="highest-cat-stat">
              {highestCategory.category}
            </p>
            <p className="summary-card-detail">
              <span className="sr-only">Amount: </span>
              ${highestCategory.amount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Table Toggle */}
      <div className="chart-controls">
        <button 
          onClick={() => setShowDataTable(!showDataTable)}
          className="btn btn-secondary"
          aria-expanded={showDataTable}
          aria-controls="chart-data-tables"
        >
          {showDataTable ? 'Hide' : 'Show'} Data Tables
          <span className="sr-only"> (Alternative to visual charts)</span>
        </button>
      </div>
      
      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title" id="pie-chart-title">Expense Breakdown by Category</h3>
          <div className="chart-canvas-container">
            <canvas 
              ref={pieChartRef}
              role="img"
              aria-labelledby="pie-chart-title pie-chart-desc"
            ></canvas>
            <p id="pie-chart-desc" className="sr-only">
              Pie chart showing expense distribution: {chartSummary.categoryBreakdown}
            </p>
          </div>
          <div className="chart-legend" role="list" aria-label="Category breakdown">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="legend-item" role="listitem">
                <span 
                  className="legend-color" 
                  style={{ backgroundColor: categoryColors[category] }}
                  aria-hidden="true"
                ></span>
                <span className="legend-label">{category}</span>
                <span className="legend-value" aria-label={`${category}: ${amount.toFixed(2)} dollars`}>
                  ${amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title" id="bar-chart-title">Monthly Spending Trends</h3>
          <div className="chart-canvas-container">
            <canvas 
              ref={barChartRef}
              role="img"
              aria-labelledby="bar-chart-title bar-chart-desc"
            ></canvas>
            <p id="bar-chart-desc" className="sr-only">
              Bar chart showing monthly spending: {chartSummary.monthlyTrend}
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Tables (Hidden by default, shown on toggle) */}
      {showDataTable && (
        <div id="chart-data-tables" className="chart-data-tables">
          {/* Category Data Table */}
          <table className="chart-data-table">
            <caption>Expense Breakdown by Category</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                <th scope="col">Percentage</th>
                <th scope="col">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(expensesByCategory).map(([category, amount]) => {
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                const count = expenses.filter(e => e.category === category).length;
                return (
                  <tr key={category}>
                    <th scope="row">{category}</th>
                    <td>${amount.toFixed(2)}</td>
                    <td>{percentage}%</td>
                    <td>{count}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>${totalExpenses.toFixed(2)}</td>
                <td>100%</td>
                <td>{expenses.length}</td>
              </tr>
            </tfoot>
          </table>
          
          {/* Monthly Data Table */}
          <table className="chart-data-table">
            <caption>Monthly Spending Trends</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Amount</th>
                <th scope="col">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlyExpenses).map(([month, amount]) => {
                const monthExpenses = expenses.filter(e => {
                  const date = new Date(e.date);
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const expenseMonth = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                  return expenseMonth === month;
                });
                return (
                  <tr key={month}>
                    <th scope="row">{month}</th>
                    <td>${amount.toFixed(2)}</td>
                    <td>{monthExpenses.length}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Average</th>
                <td>${avgMonthlySpending.toFixed(2)}</td>
                <td>-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      
      {/* Category Cards */}
      <div className="category-cards-container">
        <h3 className="section-title" id="category-details">Category Details</h3>
        <div className="category-cards-grid" role="list" aria-labelledby="category-details">
          {Object.entries(expensesByCategory).map(([category, amount]) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            const categoryExpenses = expenses.filter(e => e.category === category);
            
            return (
              <div 
                key={category} 
                className="category-card" 
                style={{ borderColor: categoryColors[category] }}
                role="listitem"
              >
                <div className="category-card-header">
                  <span className="category-card-icon" aria-hidden="true">
                    {categoryIcons[category]}
                  </span>
                  <span className="category-card-name">{category}</span>
                </div>
                <div className="category-card-body">
                  <p className="category-card-amount">
                    <span className="sr-only">{category} total: </span>
                    ${amount.toFixed(2)}
                  </p>
                  <p className="category-card-percentage">{percentage}% of total</p>
                  <p className="category-card-count">{categoryExpenses.length} transactions</p>
                </div>
                <div className="category-card-bar" role="progressbar" 
                     aria-valuenow={percentage} 
                     aria-valuemin="0" 
                     aria-valuemax="100"
                     aria-label={`${category}: ${percentage} percent of total expenses`}>
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
    </div>
  );
};

// Add Charts to global scope for use in other files
window.Charts = Charts;