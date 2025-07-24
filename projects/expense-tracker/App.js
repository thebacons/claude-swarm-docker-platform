const { useState, useEffect } = React;

// Main App Component
const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeView, setActiveView] = useState('expenses'); // 'expenses' or 'charts'

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];

  // Load from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Calculate total
  const calculateTotal = () => {
    const filtered = filterCategory === 'All' 
      ? expenses 
      : expenses.filter(exp => exp.category === filterCategory);
    return filtered.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      alert('Please fill in all fields');
      return;
    }

    if (editingId) {
      // Update existing expense
      setExpenses(expenses.map(expense => 
        expense.id === editingId 
          ? { ...formData, id: editingId, amount: parseFloat(formData.amount) }
          : expense
      ));
      setEditingId(null);
    } else {
      // Add new expense
      const newExpense = {
        ...formData,
        id: Date.now(),
        amount: parseFloat(formData.amount)
      };
      setExpenses([...expenses, newExpense]);
    }

    // Reset form
    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Handle edit
  const handleEdit = (expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date
    });
    setEditingId(expense.id);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter expenses
  const filteredExpenses = filterCategory === 'All' 
    ? expenses 
    : expenses.filter(expense => expense.category === filterCategory);

  return (
    <div className="app">
      <Header />
      
      <div className="container">
        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeView === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveView('expenses')}
          >
            📝 Expenses
          </button>
          <button 
            className={`nav-tab ${activeView === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveView('charts')}
          >
            📊 Charts & Analytics
          </button>
        </div>

        {/* Conditional View Rendering */}
        {activeView === 'expenses' ? (
          <>
            <ExpenseForm 
              formData={formData}
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
              categories={categories}
              editingId={editingId}
            />

            <ExpenseFilter 
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
            />

            <ExpenseSummary 
              total={calculateTotal()}
              count={filteredExpenses.length}
            />

            <ExpenseList 
              expenses={filteredExpenses}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </>
        ) : (
          <>
            {expenses.length === 0 && (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <DemoDataButton onLoadDemo={() => {
                  const demoData = generateDemoData();
                  setExpenses(demoData);
                  localStorage.setItem('expenses', JSON.stringify(demoData));
                }} />
              </div>
            )}
            <Charts expenses={expenses} />
          </>
        )}
      </div>
    </div>
  );
};

// Header Component
const Header = () => (
  <header className="app-header">
    <h1>💰 Expense Tracker</h1>
  </header>
);

// Expense Form Component
const ExpenseForm = ({ formData, handleSubmit, handleInputChange, categories, editingId }) => (
  <div className="card">
    <h2 className="card-title">{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="form-group">
        <label htmlFor="description" className="form-label">Description</label>
        <input
          type="text"
          id="description"
          name="description"
          className="form-input"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter expense description"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount" className="form-label">Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            className="form-input"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            id="category"
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleInputChange}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-input"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        {editingId ? 'Update Expense' : 'Add Expense'}
      </button>
    </form>
  </div>
);

// Expense Filter Component
const ExpenseFilter = ({ filterCategory, setFilterCategory, categories }) => (
  <div className="filter-container">
    <label htmlFor="filter">Filter by Category:</label>
    <select
      id="filter"
      value={filterCategory}
      onChange={(e) => setFilterCategory(e.target.value)}
      className="filter-select"
    >
      <option value="All">All Categories</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  </div>
);

// Expense Summary Component
const ExpenseSummary = ({ total, count }) => (
  <div className="summary-container">
    <div className="summary-item">
      <h3>Total Expenses</h3>
      <p className="total-amount">${total}</p>
    </div>
    <div className="summary-item">
      <h3>Number of Expenses</h3>
      <p className="expense-count">{count}</p>
    </div>
  </div>
);

// Expense List Component
const ExpenseList = ({ expenses, handleEdit, handleDelete }) => (
  <div className="expense-list-container">
    <h2>Expense History</h2>
    {expenses.length === 0 ? (
      <p className="no-expenses">No expenses recorded yet.</p>
    ) : (
      <div className="expense-list">
        {expenses.map(expense => (
          <ExpenseItem 
            key={expense.id}
            expense={expense}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    )}
  </div>
);

// Individual Expense Item Component
const ExpenseItem = ({ expense, handleEdit, handleDelete }) => {
  const categoryIcons = {
    Food: '🍔',
    Transport: '🚗',
    Entertainment: '🎮',
    Utilities: '💡',
    Other: '📦'
  };

  return (
    <div className="expense-item">
      <div className="expense-info">
        <span className="category-icon">{categoryIcons[expense.category]}</span>
        <div className="expense-details">
          <h4>{expense.description}</h4>
          <p className="expense-meta">
            {expense.category} • {new Date(expense.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="expense-actions">
        <span className="expense-amount">${expense.amount.toFixed(2)}</span>
        <button 
          onClick={() => handleEdit(expense)} 
          className="btn btn-edit"
          title="Edit expense"
        >
          ✏️
        </button>
        <button 
          onClick={() => handleDelete(expense.id)} 
          className="btn btn-delete"
          title="Delete expense"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));