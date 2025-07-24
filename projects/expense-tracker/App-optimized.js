const { useState, useEffect, useCallback, useMemo, memo } = React;

// Utility function for debouncing
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Custom hook for localStorage with debouncing
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const debouncedSave = useMemo(
    () => debounce((newValue) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }, 500),
    [key]
  );

  useEffect(() => {
    debouncedSave(value);
  }, [value, debouncedSave]);

  return [value, setValue];
};

// Memoized Header Component
const Header = memo(() => (
  <header className="app-header">
    <h1>💰 Expense Tracker</h1>
  </header>
));

// Memoized Navigation Tabs
const NavigationTabs = memo(({ activeView, setActiveView }) => (
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
));

// Memoized Expense Form Component
const ExpenseFormMemo = memo(({ 
  formData, 
  handleSubmit, 
  handleInputChange, 
  categories, 
  editingId 
}) => (
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
));

// Memoized Expense Filter Component
const ExpenseFilterMemo = memo(({ filterCategory, setFilterCategory, categories }) => (
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
));

// Memoized Expense Summary Component
const ExpenseSummaryMemo = memo(({ total, count }) => (
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
));

// Memoized Individual Expense Item Component
const ExpenseItemMemo = memo(({ expense, handleEdit, handleDelete }) => {
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
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if expense data changes
  return prevProps.expense.id === nextProps.expense.id &&
         prevProps.expense.description === nextProps.expense.description &&
         prevProps.expense.amount === nextProps.expense.amount &&
         prevProps.expense.category === nextProps.expense.category &&
         prevProps.expense.date === nextProps.expense.date;
});

// Virtual Scrolling Expense List Component
const VirtualizedExpenseList = memo(({ expenses, handleEdit, handleDelete, containerHeight = 400 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const itemHeight = 80;
  const buffer = 5;

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + containerHeight) / itemHeight);
    return {
      start: Math.max(0, start - buffer),
      end: Math.min(expenses.length, end + buffer)
    };
  }, [scrollTop, containerHeight, expenses.length]);

  const visibleExpenses = useMemo(() => {
    return expenses.slice(visibleRange.start, visibleRange.end);
  }, [expenses, visibleRange]);

  const totalHeight = expenses.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  if (expenses.length === 0) {
    return (
      <div className="expense-list-container">
        <h2>Expense History</h2>
        <p className="no-expenses">No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="expense-list-container">
      <h2>Expense History</h2>
      <div 
        className="expense-list-viewport"
        style={{ height: containerHeight, overflowY: 'auto' }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleExpenses.map((expense, index) => (
              <ExpenseItemMemo
                key={expense.id}
                expense={expense}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Main App Component - Optimized
const App = () => {
  const [expenses, setExpenses] = useLocalStorage('expenses', []);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeView, setActiveView] = useState('expenses');

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];

  // Memoized filtered expenses
  const filteredExpenses = useMemo(() => {
    return filterCategory === 'All' 
      ? expenses 
      : expenses.filter(expense => expense.category === filterCategory);
  }, [expenses, filterCategory]);

  // Memoized total calculation
  const calculatedTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2);
  }, [filteredExpenses]);

  // Optimized handlers with useCallback
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      alert('Please fill in all fields');
      return;
    }

    if (editingId) {
      setExpenses(prevExpenses => 
        prevExpenses.map(expense => 
          expense.id === editingId 
            ? { ...formData, id: editingId, amount: parseFloat(formData.amount) }
            : expense
        )
      );
      setEditingId(null);
    } else {
      const newExpense = {
        ...formData,
        id: Date.now(),
        amount: parseFloat(formData.amount)
      };
      setExpenses(prevExpenses => [...prevExpenses, newExpense]);
    }

    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });
  }, [formData, editingId]);

  const handleEdit = useCallback((expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date
    });
    setEditingId(expense.id);
  }, []);

  const handleDelete = useCallback((id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleLoadDemo = useCallback(() => {
    const demoData = generateDemoData();
    setExpenses(demoData);
  }, []);

  return (
    <div className="app">
      <Header />
      
      <div className="container">
        <NavigationTabs activeView={activeView} setActiveView={setActiveView} />

        {activeView === 'expenses' ? (
          <>
            <ExpenseFormMemo 
              formData={formData}
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
              categories={categories}
              editingId={editingId}
            />

            <ExpenseFilterMemo 
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
            />

            <ExpenseSummaryMemo 
              total={calculatedTotal}
              count={filteredExpenses.length}
            />

            <VirtualizedExpenseList 
              expenses={filteredExpenses}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              containerHeight={400}
            />
          </>
        ) : (
          <>
            {expenses.length === 0 && (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <DemoDataButton onLoadDemo={handleLoadDemo} />
              </div>
            )}
            <Charts expenses={expenses} />
          </>
        )}
      </div>
    </div>
  );
};

// Add styles for virtual scrolling
const virtualScrollStyles = `
  .expense-list-viewport {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
  }

  .expense-list-viewport::-webkit-scrollbar {
    width: 8px;
  }

  .expense-list-viewport::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }

  .expense-list-viewport::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }

  .expense-list-viewport::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

// Add virtual scroll styles to document
if (!document.getElementById('virtual-scroll-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'virtual-scroll-styles';
  styleSheet.textContent = virtualScrollStyles;
  document.head.appendChild(styleSheet);
}

// Render the optimized app
ReactDOM.render(<App />, document.getElementById('root'));