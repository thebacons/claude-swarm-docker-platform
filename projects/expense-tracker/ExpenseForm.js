// ExpenseForm Component - Handles adding and editing expenses
const ExpenseForm = ({ expense, onSubmit, onCancel, categories }) => {
  const [formData, setFormData] = React.useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  // Initialize form with expense data if in edit mode
  React.useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount ? expense.amount.toString() : '',
        category: expense.category || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  // Format currency input
  const formatCurrency = (value) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return numericValue;
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      const formattedValue = formatCurrency(value);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      const submissionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        id: expense?.id || Date.now().toString(),
        createdAt: expense?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onSubmit(submissionData);
      
      // Reset form if not in edit mode
      if (!expense) {
        setFormData({
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        setTouched({});
        setErrors({});
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setTouched({});
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : '📝';
  };

  return React.createElement('form', {
    onSubmit: handleSubmit,
    className: 'expense-form'
  }, [
    React.createElement('h2', { key: 'title' }, expense ? 'Edit Expense' : 'Add New Expense'),
    
    // Description field
    React.createElement('div', { key: 'description-group', className: 'form-group' }, [
      React.createElement('label', { key: 'desc-label', htmlFor: 'description' }, 'Description *'),
      React.createElement('input', {
        key: 'desc-input',
        type: 'text',
        id: 'description',
        name: 'description',
        value: formData.description,
        onChange: handleChange,
        onBlur: handleBlur,
        placeholder: 'Enter expense description',
        className: errors.description && touched.description ? 'error' : '',
        maxLength: 100
      }),
      errors.description && touched.description && 
        React.createElement('span', { key: 'desc-error', className: 'error-message' }, errors.description)
    ]),
    
    // Amount and Category row
    React.createElement('div', { key: 'row-1', className: 'form-row' }, [
      // Amount field
      React.createElement('div', { key: 'amount-group', className: 'form-group' }, [
        React.createElement('label', { key: 'amount-label', htmlFor: 'amount' }, 'Amount *'),
        React.createElement('div', { key: 'amount-wrapper', className: 'input-wrapper' }, [
          React.createElement('span', { key: 'currency', className: 'currency-symbol' }, '$'),
          React.createElement('input', {
            key: 'amount-input',
            type: 'text',
            id: 'amount',
            name: 'amount',
            value: formData.amount,
            onChange: handleChange,
            onBlur: handleBlur,
            placeholder: '0.00',
            className: `currency-input ${errors.amount && touched.amount ? 'error' : ''}`,
            inputMode: 'decimal'
          })
        ]),
        errors.amount && touched.amount && 
          React.createElement('span', { key: 'amount-error', className: 'error-message' }, errors.amount)
      ]),
      
      // Category field
      React.createElement('div', { key: 'category-group', className: 'form-group' }, [
        React.createElement('label', { key: 'cat-label', htmlFor: 'category' }, 'Category *'),
        React.createElement('div', { key: 'cat-wrapper', className: 'select-wrapper' }, [
          formData.category && React.createElement('span', { 
            key: 'cat-icon', 
            className: 'category-icon' 
          }, getCategoryIcon(formData.category)),
          React.createElement('select', {
            key: 'cat-select',
            id: 'category',
            name: 'category',
            value: formData.category,
            onChange: handleChange,
            onBlur: handleBlur,
            className: errors.category && touched.category ? 'error' : ''
          }, [
            React.createElement('option', { key: 'default', value: '' }, 'Select category'),
            ...categories.map(cat => 
              React.createElement('option', { 
                key: cat.id, 
                value: cat.name 
              }, `${cat.icon} ${cat.name}`)
            )
          ])
        ]),
        errors.category && touched.category && 
          React.createElement('span', { key: 'cat-error', className: 'error-message' }, errors.category)
      ])
    ]),
    
    // Date field
    React.createElement('div', { key: 'date-group', className: 'form-group' }, [
      React.createElement('label', { key: 'date-label', htmlFor: 'date' }, 'Date *'),
      React.createElement('input', {
        key: 'date-input',
        type: 'date',
        id: 'date',
        name: 'date',
        value: formData.date,
        onChange: handleChange,
        onBlur: handleBlur,
        max: new Date().toISOString().split('T')[0],
        className: errors.date && touched.date ? 'error' : ''
      }),
      errors.date && touched.date && 
        React.createElement('span', { key: 'date-error', className: 'error-message' }, errors.date)
    ]),
    
    // Notes field
    React.createElement('div', { key: 'notes-group', className: 'form-group' }, [
      React.createElement('label', { key: 'notes-label', htmlFor: 'notes' }, 'Notes (Optional)'),
      React.createElement('textarea', {
        key: 'notes-input',
        id: 'notes',
        name: 'notes',
        value: formData.notes,
        onChange: handleChange,
        placeholder: 'Add any additional notes...',
        rows: 3,
        maxLength: 500
      })
    ]),
    
    // Form actions
    React.createElement('div', { key: 'actions', className: 'form-actions' }, [
      React.createElement('button', {
        key: 'cancel',
        type: 'button',
        onClick: handleCancel,
        className: 'btn btn-secondary'
      }, 'Cancel'),
      React.createElement('button', {
        key: 'submit',
        type: 'submit',
        className: 'btn btn-primary'
      }, expense ? 'Update Expense' : 'Add Expense')
    ])
  ]);
};

// Styles for ExpenseForm
const expenseFormStyles = `
  .expense-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 0 auto;
  }

  .expense-form h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }

  .form-group input.error,
  .form-group select.error,
  .form-group textarea.error {
    border-color: #dc3545;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .currency-symbol {
    position: absolute;
    left: 0.75rem;
    color: #666;
    font-weight: 500;
  }

  .currency-input {
    padding-left: 2rem !important;
  }

  .select-wrapper {
    position: relative;
  }

  .category-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    pointer-events: none;
  }

  .select-wrapper select {
    padding-left: 2.5rem;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }

  .error-message {
    display: block;
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background: #0056b3;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #545b62;
  }

  @media (max-width: 600px) {
    .expense-form {
      padding: 1.5rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .btn {
      width: 100%;
    }
  }
`;

// Add styles to document
if (!document.getElementById('expense-form-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'expense-form-styles';
  styleSheet.textContent = expenseFormStyles;
  document.head.appendChild(styleSheet);
}