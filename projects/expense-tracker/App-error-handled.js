const { useState, useEffect } = React;

// Main App Component with Error Handling
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
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];

  // Load from localStorage with error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const savedExpenses = localStorage.getItem('expenses');
        
        if (savedExpenses) {
          try {
            const parsed = JSON.parse(savedExpenses);
            if (!Array.isArray(parsed)) {
              throw new Error('Invalid expenses data format');
            }
            
            // Validate each expense
            const validExpenses = parsed.filter(exp => {
              try {
                return exp.id && exp.description && 
                       typeof exp.amount === 'number' && 
                       exp.category && exp.date;
              } catch {
                return false;
              }
            });

            if (validExpenses.length < parsed.length) {
              console.warn(`Filtered out ${parsed.length - validExpenses.length} invalid expenses`);
            }

            setExpenses(validExpenses);
          } catch (e) {
            console.error('Failed to parse expenses:', e);
            
            // Attempt recovery
            if (window.RecoveryUtils) {
              const recovery = await window.RecoveryUtils.recoverCorruptedData();
              if (recovery.recovered) {
                setExpenses(recovery.expenses);
                setGlobalError({
                  type: window.ErrorTypes.DATA_CORRUPTION,
                  userMessage: `Recovered ${recovery.expenses.length} expenses from corrupted data.`,
                  recovery: () => window.location.reload()
                });
              } else {
                throw new Error('Data recovery failed');
              }
            }
          }
        }
      } catch (error) {
        const errorInfo = window.ErrorHandler?.handleDataCorruption(error) || {
          userMessage: 'Failed to load expenses. Your data may be corrupted.',
          recovery: () => setShowRecoveryModal(true)
        };
        setGlobalError(errorInfo);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to localStorage with error handling
  useEffect(() => {
    if (!isLoading && expenses.length > 0) {
      try {
        // Create backup before saving
        if (window.RecoveryUtils) {
          window.RecoveryUtils.createBackup();
        }

        localStorage.setItem('expenses', JSON.stringify(expenses));
      } catch (error) {
        const errorInfo = window.ErrorHandler?.handleStorageError(error, 'save_expenses') || {
          userMessage: 'Failed to save expenses. Storage may be full.'
        };
        setGlobalError(errorInfo);
      }
    }
  }, [expenses, isLoading]);

  // Calculate total with error handling
  const calculateTotal = () => {
    try {
      const filtered = filterCategory === 'All' 
        ? expenses 
        : expenses.filter(exp => exp.category === filterCategory);
      
      const total = filtered.reduce((sum, expense) => {
        const amount = parseFloat(expense.amount);
        if (isNaN(amount)) {
          console.warn(`Invalid amount for expense ${expense.id}: ${expense.amount}`);
          return sum;
        }
        return sum + amount;
      }, 0);

      return total.toFixed(2);
    } catch (error) {
      const errorInfo = window.ErrorHandler?.handleCalculationError(error, { 
        filterCategory, 
        expenseCount: expenses.length 
      });
      setGlobalError(errorInfo);
      return '0.00';
    }
  };

  // Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      // Validate form data
      if (!window.ValidationUtils) {
        throw new Error('Validation utilities not loaded');
      }

      const validation = window.ValidationUtils.validateExpenseData(formData, categories);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      const sanitizedData = validation.sanitized;

      if (editingId) {
        // Update existing expense
        setExpenses(prevExpenses => {
          try {
            return prevExpenses.map(expense => 
              expense.id === editingId 
                ? { 
                    ...expense,
                    ...sanitizedData,
                    id: editingId,
                    updatedAt: new Date().toISOString()
                  }
                : expense
            );
          } catch (error) {
            setGlobalError(window.ErrorHandler?.handleError(error, { operation: 'update_expense' }));
            return prevExpenses;
          }
        });
        setEditingId(null);
      } else {
        // Add new expense
        const newExpense = {
          ...sanitizedData,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        
        setExpenses(prevExpenses => {
          try {
            return [...prevExpenses, newExpense];
          } catch (error) {
            setGlobalError(window.ErrorHandler?.handleError(error, { operation: 'add_expense' }));
            return prevExpenses;
          }
        });
      }

      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });
      
    } catch (error) {
      const errorInfo = window.ErrorHandler?.handleError(error, { 
        operation: 'submit_expense',
        formData 
      });
      setGlobalError(errorInfo);
    }
  };

  // Handle edit with error checking
  const handleEdit = (expense) => {
    try {
      if (!expense || !expense.id) {
        throw new Error('Invalid expense data');
      }

      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || 'Other',
        date: expense.date || new Date().toISOString().split('T')[0]
      });
      setEditingId(expense.id);
      setErrors({});
    } catch (error) {
      const errorInfo = window.ErrorHandler?.handleError(error, { 
        operation: 'edit_expense',
        expenseId: expense?.id 
      });
      setGlobalError(errorInfo);
    }
  };

  // Handle delete with confirmation and error handling
  const handleDelete = async (id) => {
    try {
      if (!id) {
        throw new Error('Invalid expense ID');
      }

      if (confirm('Are you sure you want to delete this expense?')) {
        // Create backup before deletion
        if (window.RecoveryUtils) {
          window.RecoveryUtils.createBackup();
        }

        setExpenses(prevExpenses => {
          try {
            const filtered = prevExpenses.filter(expense => expense.id !== id);
            if (filtered.length === prevExpenses.length) {
              throw new Error('Expense not found');
            }
            return filtered;
          } catch (error) {
            setGlobalError(window.ErrorHandler?.handleError(error, { 
              operation: 'delete_expense',
              expenseId: id 
            }));
            return prevExpenses;
          }
        });
      }
    } catch (error) {
      const errorInfo = window.ErrorHandler?.handleError(error, { 
        operation: 'delete_expense',
        expenseId: id 
      });
      setGlobalError(errorInfo);
    }
  };

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Real-time validation for amount field
    if (name === 'amount' && value !== '') {
      const validation = window.ValidationUtils?.validateAmount(value);
      if (validation && !validation.isValid) {
        setErrors(prev => ({
          ...prev,
          amount: validation.errors
        }));
      }
    }
  };

  // Filter expenses with error handling
  const filteredExpenses = React.useMemo(() => {
    try {
      return filterCategory === 'All' 
        ? expenses 
        : expenses.filter(expense => expense.category === filterCategory);
    } catch (error) {
      console.error('Error filtering expenses:', error);
      return expenses;
    }
  }, [expenses, filterCategory]);

  // Recovery handler
  const handleRecovery = (recoveryData) => {
    if (recoveryData?.expenses) {
      setExpenses(recoveryData.expenses);
    }
    setShowRecoveryModal(false);
    setGlobalError(null);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳</div>
        <p>Loading your expenses...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Header 
          onShowErrorLog={() => setShowErrorLog(true)}
          onShowRecovery={() => setShowRecoveryModal(true)}
        />
        
        {globalError && (
          <ErrorMessage 
            error={globalError}
            onDismiss={() => setGlobalError(null)}
            onRetry={() => window.location.reload()}
          />
        )}
        
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
                errors={errors}
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
                    try {
                      const demoData = generateDemoData();
                      setExpenses(demoData);
                      localStorage.setItem('expenses', JSON.stringify(demoData));
                    } catch (error) {
                      setGlobalError(window.ErrorHandler?.handleError(error, { 
                        operation: 'load_demo_data' 
                      }));
                    }
                  }} />
                </div>
              )}
              <ErrorBoundary>
                <Charts expenses={expenses} />
              </ErrorBoundary>
            </>
          )}
        </div>

        {/* Modals */}
        <RecoveryModal 
          isOpen={showRecoveryModal}
          onClose={() => setShowRecoveryModal(false)}
          onRecover={handleRecovery}
        />

        <ErrorLogViewer 
          isOpen={showErrorLog}
          onClose={() => setShowErrorLog(false)}
        />
      </div>
    </ErrorBoundary>
  );
};

// Enhanced Header Component with error tools
const Header = ({ onShowErrorLog, onShowRecovery }) => (
  <header className="app-header">
    <h1>💰 Expense Tracker</h1>
    <div className="header-tools">
      <button 
        onClick={onShowRecovery} 
        className="btn-icon"
        title="Data Recovery"
      >
        💾
      </button>
      <button 
        onClick={onShowErrorLog} 
        className="btn-icon"
        title="Error Log"
      >
        📋
      </button>
    </div>
  </header>
);

// Enhanced Expense Form Component with field validation
const ExpenseForm = ({ formData, handleSubmit, handleInputChange, categories, editingId, errors }) => (
  <div className="card">
    <h2 className="card-title">{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
    <form onSubmit={handleSubmit} className="expense-form" noValidate>
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description <span className="required">*</span>
        </label>
        <input
          type="text"
          id="description"
          name="description"
          className={`form-input ${errors.description ? 'error' : ''}`}
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter expense description"
          maxLength="200"
          required
        />
        <FieldError errors={errors.description} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount ($) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            className={`form-input ${errors.amount ? 'error' : ''}`}
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            max="999999.99"
            required
          />
          <FieldError errors={errors.amount} />
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            className={`form-select ${errors.category ? 'error' : ''}`}
            value={formData.category}
            onChange={handleInputChange}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <FieldError errors={errors.category} />
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">
            Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            className={`form-input ${errors.date ? 'error' : ''}`}
            value={formData.date}
            onChange={handleInputChange}
            max={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
            min={new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
            required
          />
          <FieldError errors={errors.date} />
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
          <ErrorBoundary key={expense.id}>
            <ExpenseItem 
              expense={expense}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </ErrorBoundary>
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

  // Safe date formatting
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Safe amount formatting
  const formatAmount = (amount) => {
    try {
      const num = parseFloat(amount);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    } catch {
      return '0.00';
    }
  };

  return (
    <div className="expense-item">
      <div className="expense-info">
        <span className="category-icon">{categoryIcons[expense.category] || '📦'}</span>
        <div className="expense-details">
          <h4>{expense.description || 'No description'}</h4>
          <p className="expense-meta">
            {expense.category || 'Uncategorized'} • {formatDate(expense.date)}
          </p>
        </div>
      </div>
      <div className="expense-actions">
        <span className="expense-amount">${formatAmount(expense.amount)}</span>
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