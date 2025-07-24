/**
 * Error Handling System for Expense Tracker
 * Provides comprehensive error management, logging, and recovery mechanisms
 */

// Error types enumeration
const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  STORAGE: 'STORAGE_ERROR',
  NETWORK: 'NETWORK_ERROR',
  CALCULATION: 'CALCULATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  DATA_CORRUPTION: 'DATA_CORRUPTION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error logger class
class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
    this.loadErrors();
  }

  loadErrors() {
    try {
      const savedErrors = localStorage.getItem('expenseTracker_errorLog');
      if (savedErrors) {
        this.errors = JSON.parse(savedErrors);
      }
    } catch (e) {
      console.error('Failed to load error log:', e);
    }
  }

  saveErrors() {
    try {
      localStorage.setItem('expenseTracker_errorLog', JSON.stringify(this.errors));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  log(error, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, context = {}) {
    const errorEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      severity,
      message: error.message || error.toString(),
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errors.unshift(errorEntry);

    // Keep only the last maxErrors entries
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.saveErrors();

    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error('Error logged:', errorEntry);
    }

    return errorEntry;
  }

  getErrors(filter = {}) {
    let filtered = [...this.errors];

    if (filter.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter.severity) {
      filtered = filtered.filter(e => e.severity === filter.severity);
    }

    if (filter.since) {
      const sinceDate = new Date(filter.since);
      filtered = filtered.filter(e => new Date(e.timestamp) >= sinceDate);
    }

    return filtered;
  }

  clearErrors() {
    this.errors = [];
    this.saveErrors();
  }

  exportErrors() {
    return JSON.stringify(this.errors, null, 2);
  }
}

// Global error logger instance
const errorLogger = new ErrorLogger();

// Input validation utilities
const ValidationUtils = {
  // Validate expense amount
  validateAmount(amount) {
    const errors = [];
    
    if (amount === undefined || amount === null || amount === '') {
      errors.push('Amount is required');
      return { isValid: false, errors };
    }

    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      errors.push('Amount must be a valid number');
    } else if (numAmount <= 0) {
      errors.push('Amount must be greater than zero');
    } else if (numAmount > 999999.99) {
      errors.push('Amount exceeds maximum allowed value (999,999.99)');
    } else if (!/^\d+(\.\d{0,2})?$/.test(amount.toString())) {
      errors.push('Amount can have maximum 2 decimal places');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? numAmount : null
    };
  },

  // Validate description
  validateDescription(description) {
    const errors = [];
    
    if (!description || description.trim() === '') {
      errors.push('Description is required');
      return { isValid: false, errors };
    }

    const trimmed = description.trim();
    
    if (trimmed.length < 2) {
      errors.push('Description must be at least 2 characters long');
    } else if (trimmed.length > 200) {
      errors.push('Description must not exceed 200 characters');
    }

    // Check for potential XSS attempts
    const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
    if (dangerousPatterns.some(pattern => pattern.test(trimmed))) {
      errors.push('Description contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? trimmed : null
    };
  },

  // Validate date
  validateDate(date) {
    const errors = [];
    
    if (!date) {
      errors.push('Date is required');
      return { isValid: false, errors };
    }

    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      errors.push('Invalid date format');
    } else {
      const now = new Date();
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
      
      if (dateObj > oneYearFromNow) {
        errors.push('Date cannot be more than one year in the future');
      } else if (dateObj < hundredYearsAgo) {
        errors.push('Date cannot be more than 100 years in the past');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? dateObj.toISOString().split('T')[0] : null
    };
  },

  // Validate category
  validateCategory(category, allowedCategories) {
    const errors = [];
    
    if (!category || category.trim() === '') {
      errors.push('Category is required');
      return { isValid: false, errors };
    }

    if (!allowedCategories.includes(category)) {
      errors.push('Invalid category selected');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? category : null
    };
  },

  // Validate complete expense data
  validateExpenseData(data, allowedCategories) {
    const result = {
      isValid: true,
      errors: {},
      sanitized: {}
    };

    // Validate each field
    const descriptionValidation = this.validateDescription(data.description);
    if (!descriptionValidation.isValid) {
      result.isValid = false;
      result.errors.description = descriptionValidation.errors;
    } else {
      result.sanitized.description = descriptionValidation.sanitized;
    }

    const amountValidation = this.validateAmount(data.amount);
    if (!amountValidation.isValid) {
      result.isValid = false;
      result.errors.amount = amountValidation.errors;
    } else {
      result.sanitized.amount = amountValidation.sanitized;
    }

    const dateValidation = this.validateDate(data.date);
    if (!dateValidation.isValid) {
      result.isValid = false;
      result.errors.date = dateValidation.errors;
    } else {
      result.sanitized.date = dateValidation.sanitized;
    }

    const categoryValidation = this.validateCategory(data.category, allowedCategories);
    if (!categoryValidation.isValid) {
      result.isValid = false;
      result.errors.category = categoryValidation.errors;
    } else {
      result.sanitized.category = categoryValidation.sanitized;
    }

    return result;
  }
};

// Error recovery mechanisms
const RecoveryUtils = {
  // Attempt to recover corrupted localStorage data
  async recoverCorruptedData() {
    const results = {
      recovered: false,
      expenses: [],
      categories: null,
      errors: []
    };

    try {
      // Try to recover expenses
      const expensesRaw = localStorage.getItem('expenses');
      if (expensesRaw) {
        try {
          const parsed = JSON.parse(expensesRaw);
          if (Array.isArray(parsed)) {
            // Validate each expense and keep only valid ones
            results.expenses = parsed.filter(exp => {
              try {
                return exp.id && exp.description && typeof exp.amount === 'number';
              } catch {
                return false;
              }
            });
            results.recovered = true;
          }
        } catch (e) {
          results.errors.push('Failed to parse expenses data');
          
          // Try to extract valid JSON objects from corrupted string
          const jsonMatches = expensesRaw.match(/\{[^}]+\}/g);
          if (jsonMatches) {
            jsonMatches.forEach(match => {
              try {
                const expense = JSON.parse(match);
                if (expense.id && expense.description && expense.amount) {
                  results.expenses.push(expense);
                  results.recovered = true;
                }
              } catch {
                // Skip invalid matches
              }
            });
          }
        }
      }

      // Try to recover categories
      const categoriesRaw = localStorage.getItem('expenseTracker_categories');
      if (categoriesRaw) {
        try {
          const parsed = JSON.parse(categoriesRaw);
          if (Array.isArray(parsed)) {
            results.categories = parsed;
          }
        } catch {
          results.errors.push('Failed to parse categories data');
        }
      }

    } catch (e) {
      results.errors.push('Recovery process failed: ' + e.message);
    }

    return results;
  },

  // Create backup of current data
  createBackup() {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        expenses: localStorage.getItem('expenses'),
        categories: localStorage.getItem('expenseTracker_categories'),
        settings: localStorage.getItem('expenseTracker_settings')
      };

      const backupKey = `expenseTracker_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));

      // Keep only last 3 backups
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('expenseTracker_backup_'))
        .sort();

      if (backupKeys.length > 3) {
        backupKeys.slice(0, -3).forEach(key => localStorage.removeItem(key));
      }

      return { success: true, backupKey };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Restore from backup
  restoreFromBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const backup = JSON.parse(backupData);
      
      if (backup.expenses) {
        localStorage.setItem('expenses', backup.expenses);
      }
      if (backup.categories) {
        localStorage.setItem('expenseTracker_categories', backup.categories);
      }
      if (backup.settings) {
        localStorage.setItem('expenseTracker_settings', backup.settings);
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // List available backups
  listBackups() {
    try {
      const backups = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('expenseTracker_backup_')) {
          try {
            const backupData = JSON.parse(localStorage.getItem(key));
            backups.push({
              key,
              timestamp: backupData.timestamp,
              size: localStorage.getItem(key).length
            });
          } catch {
            // Skip invalid backups
          }
        }
      });

      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch {
      return [];
    }
  }
};

// Error handler factory
const ErrorHandler = {
  // Handle validation errors
  handleValidationError(errors, fieldName = null) {
    const errorMessage = fieldName 
      ? `Validation error in ${fieldName}: ${errors.join(', ')}`
      : `Validation errors: ${Object.entries(errors).map(([field, errs]) => `${field}: ${errs.join(', ')}`).join('; ')}`;

    errorLogger.log(new Error(errorMessage), ErrorTypes.VALIDATION, ErrorSeverity.LOW);

    return {
      type: ErrorTypes.VALIDATION,
      message: errorMessage,
      errors,
      userMessage: 'Please check your input and try again.'
    };
  },

  // Handle storage errors
  handleStorageError(error, operation) {
    const errorEntry = errorLogger.log(error, ErrorTypes.STORAGE, ErrorSeverity.HIGH, { operation });

    let userMessage = 'Unable to save data. ';
    
    if (error.name === 'QuotaExceededError') {
      userMessage += 'Storage quota exceeded. Please clear some data and try again.';
    } else {
      userMessage += 'Please check your browser settings and try again.';
    }

    return {
      type: ErrorTypes.STORAGE,
      message: error.message,
      userMessage,
      errorId: errorEntry.id,
      recovery: async () => {
        // Attempt to create space by removing old backups
        const backups = RecoveryUtils.listBackups();
        if (backups.length > 1) {
          backups.slice(1).forEach(backup => localStorage.removeItem(backup.key));
          return true;
        }
        return false;
      }
    };
  },

  // Handle calculation errors
  handleCalculationError(error, context) {
    errorLogger.log(error, ErrorTypes.CALCULATION, ErrorSeverity.MEDIUM, context);

    return {
      type: ErrorTypes.CALCULATION,
      message: error.message,
      userMessage: 'An error occurred while calculating totals. Please refresh the page.',
      context
    };
  },

  // Handle data corruption
  handleDataCorruption(error) {
    errorLogger.log(error, ErrorTypes.DATA_CORRUPTION, ErrorSeverity.CRITICAL);

    return {
      type: ErrorTypes.DATA_CORRUPTION,
      message: error.message,
      userMessage: 'Data corruption detected. Attempting recovery...',
      recovery: RecoveryUtils.recoverCorruptedData
    };
  },

  // Generic error handler
  handleError(error, context = {}) {
    const errorEntry = errorLogger.log(error, ErrorTypes.UNKNOWN, ErrorSeverity.MEDIUM, context);

    return {
      type: ErrorTypes.UNKNOWN,
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      errorId: errorEntry.id
    };
  }
};

// Export for use in other modules
window.ErrorHandler = ErrorHandler;
window.ValidationUtils = ValidationUtils;
window.RecoveryUtils = RecoveryUtils;
window.errorLogger = errorLogger;
window.ErrorTypes = ErrorTypes;
window.ErrorSeverity = ErrorSeverity;