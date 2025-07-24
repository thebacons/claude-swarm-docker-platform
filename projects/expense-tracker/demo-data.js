// Demo data generator for testing charts
const generateDemoData = () => {
  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];
  const descriptions = {
    Food: ['Groceries', 'Restaurant', 'Coffee', 'Lunch', 'Dinner', 'Snacks'],
    Transport: ['Gas', 'Uber', 'Bus ticket', 'Parking', 'Car maintenance'],
    Entertainment: ['Movie tickets', 'Concert', 'Games', 'Streaming service', 'Books'],
    Utilities: ['Electricity', 'Water', 'Internet', 'Phone bill', 'Gas bill'],
    Other: ['Clothes', 'Gifts', 'Medical', 'Home supplies', 'Pet supplies']
  };
  
  const demoExpenses = [];
  const today = new Date();
  
  // Generate expenses for the last 6 months
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const month = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    
    // Generate 10-20 expenses per month
    const expensesPerMonth = Math.floor(Math.random() * 11) + 10;
    
    for (let i = 0; i < expensesPerMonth; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const categoryDescriptions = descriptions[category];
      const description = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
      
      // Random amount based on category
      let amount;
      switch (category) {
        case 'Food':
          amount = Math.random() * 100 + 10; // $10-110
          break;
        case 'Transport':
          amount = Math.random() * 80 + 20; // $20-100
          break;
        case 'Entertainment':
          amount = Math.random() * 150 + 20; // $20-170
          break;
        case 'Utilities':
          amount = Math.random() * 200 + 50; // $50-250
          break;
        case 'Other':
          amount = Math.random() * 200 + 10; // $10-210
          break;
      }
      
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      
      demoExpenses.push({
        id: Date.now() + Math.random(),
        description: description,
        amount: parseFloat(amount.toFixed(2)),
        category: category,
        date: date.toISOString().split('T')[0]
      });
    }
  }
  
  // Sort by date (newest first)
  demoExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return demoExpenses;
};

// Add a button to load demo data
const DemoDataButton = ({ onLoadDemo }) => (
  <button 
    className="btn btn-secondary" 
    onClick={onLoadDemo}
    style={{ marginBottom: '1rem' }}
  >
    📊 Load Demo Data for Charts
  </button>
);

// Export for use in other files
window.generateDemoData = generateDemoData;
window.DemoDataButton = DemoDataButton;