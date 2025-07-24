const { useState, useEffect, useRef } = React;

// Main App Component with Accessibility Enhancements
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
  const [activeView, setActiveView] = useState('expenses');
  const [announcement, setAnnouncement] = useState('');
  
  // Refs for focus management
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const expenseListRef = useRef(null);

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];

  // Load from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      const parsed = JSON.parse(savedExpenses);
      setExpenses(parsed);
      announceToScreenReader(`Loaded ${parsed.length} expenses from storage`);
    }
  }, []);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Announce changes to screen readers
  const announceToScreenReader = (message, priority = 'polite') => {
    setAnnouncement(message);
    if (window.announceToScreenReader) {
      window.announceToScreenReader(message, priority);
    }
    // Clear announcement after delay
    setTimeout(() => setAnnouncement(''), 100);
  };

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
      announceToScreenReader('Please fill in all required fields', 'assertive');
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
      announceToScreenReader('Expense updated successfully');
    } else {
      // Add new expense
      const newExpense = {
        ...formData,
        id: Date.now(),
        amount: parseFloat(formData.amount)
      };
      setExpenses([...expenses, newExpense]);
      announceToScreenReader('New expense added successfully');
    }

    // Reset form
    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });

    // Return focus to form
    if (formRef.current) {
      const firstInput = formRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }
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
    announceToScreenReader(`Editing expense: ${expense.description}`);
    
    // Focus the form
    if (formRef.current) {
      const firstInput = formRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  };

  // Handle delete with accessible confirmation
  const handleDelete = (id) => {
    const expense = expenses.find(e => e.id === id);
    const confirmed = confirm(`Are you sure you want to delete the expense: ${expense.description} for $${expense.amount}?`);
    
    if (confirmed) {
      setExpenses(expenses.filter(expense => expense.id !== id));
      announceToScreenReader(`Expense deleted: ${expense.description}`);
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

  // Handle view change
  const handleViewChange = (view) => {
    setActiveView(view);
    announceToScreenReader(`Switched to ${view} view`);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const newCategory = e.target.value;
    setFilterCategory(newCategory);
    const filtered = newCategory === 'All' 
      ? expenses 
      : expenses.filter(exp => exp.category === newCategory);
    announceToScreenReader(`Filter changed to ${newCategory}. Showing ${filtered.length} expenses.`);
  };

  // Filter expenses
  const filteredExpenses = filterCategory === 'All' 
    ? expenses 
    : expenses.filter(expense => expense.category === filterCategory);

  return (
    <div className="app">
      <Header ref={headingRef} />
      
      <main id="main-content" className="container" role="main">
        {/* Navigation Tabs with ARIA */}
        <nav role="navigation" aria-label="View navigation">
          <div className="nav-tabs" role="tablist" aria-label="Choose view">
            <button 
              role="tab"
              id="expenses-tab"
              aria-controls="expenses-panel"
              aria-selected={activeView === 'expenses'}
              data-view="expenses"
              className={`nav-tab ${activeView === 'expenses' ? 'active' : ''}`}
              onClick={() => handleViewChange('expenses')}
            >
              <span aria-hidden="true">📝</span> Expenses
            </button>
            <button 
              role="tab"
              id="charts-tab"
              aria-controls="charts-panel"
              aria-selected={activeView === 'charts'}
              data-view="charts"
              className={`nav-tab ${activeView === 'charts' ? 'active' : ''}`}
              onClick={() => handleViewChange('charts')}
            >
              <span aria-hidden="true">📊</span> Charts & Analytics
            </button>
          </div>
        </nav>

        {/* Screen Reader Announcement */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        {/* Expenses View */}
        <div 
          role="tabpanel"
          id="expenses-panel"
          aria-labelledby="expenses-tab"
          hidden={activeView !== 'expenses'}
        >
          <section id="expense-form" aria-labelledby="form-heading">
            <h2 id="form-heading" className="sr-only">
              {editingId ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <ExpenseForm 
              ref={formRef}
              formData={formData}
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
              categories={categories}
              editingId={editingId}
            />
          </section>

          <section aria-labelledby="filter-heading">
            <h2 id="filter-heading" className="sr-only">Filter Options</h2>
            <ExpenseFilter 
              filterCategory={filterCategory}
              handleFilterChange={handleFilterChange}
              categories={categories}
            />
          </section>

          <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">Expense Summary</h2>
            <ExpenseSummary 
              total={calculateTotal()}
              count={filteredExpenses.length}
              filterCategory={filterCategory}
            />
          </section>

          <section id="expense-list" aria-labelledby="list-heading">
            <h2 id="list-heading">Expense History</h2>
            <ExpenseList 
              ref={expenseListRef}
              expenses={filteredExpenses}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </section>
        </div>

        {/* Charts View */}
        <div 
          role="tabpanel"
          id="charts-panel"
          aria-labelledby="charts-tab"
          hidden={activeView !== 'charts'}
        >
          <section id="charts-section" aria-labelledby="charts-heading">
            <h2 id="charts-heading" className="sr-only">Expense Analytics</h2>
            {expenses.length === 0 && (
              <div className="empty-state" role="status">
                <DemoDataButton onLoadDemo={() => {
                  const demoData = generateDemoData();
                  setExpenses(demoData);
                  localStorage.setItem('expenses', JSON.stringify(demoData));
                  announceToScreenReader('Demo data loaded successfully');
                }} />
              </div>
            )}
            <Charts expenses={expenses} />
          </section>
        </div>
      </main>
    </div>
  );
};

// Header Component with ref forwarding
const Header = React.forwardRef((props, ref) => (
  <header className="app-header" role="banner">
    <h1 ref={ref} tabIndex="-1">
      <span aria-hidden="true">💰</span> Expense Tracker
    </h1>
  </header>
));

// Expense Form Component with accessibility
const ExpenseForm = React.forwardRef(({ formData, handleSubmit, handleInputChange, categories, editingId }, ref) => (
  <div className="card">
    <form ref={ref} onSubmit={handleSubmit} className="expense-form" aria-label={editingId ? 'Edit expense form' : 'Add expense form'}>
      <h2 className="card-title">{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
      
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description <span className="required-indicator" aria-label="required">*</span>
        </label>
        <input
          type="text"
          id="description"
          name="description"
          className="form-input"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter expense description"
          required
          aria-required="true"
          aria-describedby="description-hint"
        />
        <span id="description-hint" className="field-hint">Brief description of the expense</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount ($) <span className="required-indicator" aria-label="required">*</span>
          </label>
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
            aria-required="true"
            aria-describedby="amount-hint"
          />
          <span id="amount-hint" className="field-hint">Enter amount in dollars</span>
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category <span className="required-indicator" aria-label="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleInputChange}
            required
            aria-required="true"
            aria-describedby="category-hint"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <span id="category-hint" className="field-hint">Select expense category</span>
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">
            Date <span className="required-indicator" aria-label="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-input"
            value={formData.date}
            onChange={handleInputChange}
            required
            aria-required="true"
            aria-describedby="date-hint"
            max={new Date().toISOString().split('T')[0]}
          />
          <span id="date-hint" className="field-hint">Date of the expense</span>
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        {editingId ? 'Update Expense' : 'Add Expense'}
      </button>
    </form>
  </div>
));

// Expense Filter Component with accessibility
const ExpenseFilter = ({ filterCategory, handleFilterChange, categories }) => (
  <div className="filter-container" role="search">
    <label htmlFor="filter">Filter by Category:</label>
    <select
      id="filter"
      value={filterCategory}
      onChange={handleFilterChange}
      className="filter-select"
      aria-label="Filter expenses by category"
    >
      <option value="All">All Categories</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  </div>
);

// Expense Summary Component with accessibility
const ExpenseSummary = ({ total, count, filterCategory }) => (
  <div className="summary-container" role="region" aria-label="Expense summary">
    <div className="summary-item">
      <h3 id="total-heading">Total Expenses</h3>
      <p className="total-amount" aria-labelledby="total-heading">
        <span className="sr-only">Total amount: </span>${total}
      </p>
    </div>
    <div className="summary-item">
      <h3 id="count-heading">Number of Expenses</h3>
      <p className="expense-count" aria-labelledby="count-heading">
        <span className="sr-only">{filterCategory === 'All' ? 'Total' : filterCategory} expenses: </span>
        {count}
      </p>
    </div>
  </div>
);

// Expense List Component with accessibility
const ExpenseList = React.forwardRef(({ expenses, handleEdit, handleDelete }, ref) => (
  <div ref={ref} className="expense-list-container">
    {expenses.length === 0 ? (
      <p className="no-expenses" role="status">No expenses recorded yet.</p>
    ) : (
      <ul className="expense-list" role="list" aria-label="List of expenses">
        {expenses.map(expense => (
          <ExpenseItem 
            key={expense.id}
            expense={expense}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ))}
      </ul>
    )}
  </div>
));

// Individual Expense Item Component with accessibility
const ExpenseItem = ({ expense, handleEdit, handleDelete }) => {
  const categoryIcons = {
    Food: '🍔',
    Transport: '🚗',
    Entertainment: '🎮',
    Utilities: '💡',
    Other: '📦'
  };

  return (
    <li className="expense-item" role="listitem">
      <div className="expense-info">
        <span className="category-icon" aria-hidden="true">
          {categoryIcons[expense.category]}
        </span>
        <div className="expense-details">
          <h4>{expense.description}</h4>
          <p className="expense-meta">
            <span className="sr-only">Category: </span>{expense.category} 
            <span aria-hidden="true"> • </span>
            <span className="sr-only">Date: </span>{new Date(expense.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="expense-actions">
        <span className="expense-amount" aria-label={`Amount: ${expense.amount} dollars`}>
          ${expense.amount.toFixed(2)}
        </span>
        <button 
          onClick={() => handleEdit(expense)} 
          className="btn btn-edit"
          aria-label={`Edit expense: ${expense.description}`}
        >
          <span aria-hidden="true">✏️</span>
          <span className="sr-only">Edit</span>
        </button>
        <button 
          onClick={() => handleDelete(expense.id)} 
          className="btn btn-delete"
          aria-label={`Delete expense: ${expense.description}`}
        >
          <span aria-hidden="true">🗑️</span>
          <span className="sr-only">Delete</span>
        </button>
      </div>
    </li>
  );
};

// Demo Data Button Component
const DemoDataButton = ({ onLoadDemo }) => (
  <button 
    onClick={onLoadDemo} 
    className="btn btn-secondary"
    aria-label="Load demo data to see charts"
  >
    Load Demo Data
  </button>
);

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));