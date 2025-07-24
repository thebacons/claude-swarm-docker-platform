/**
 * Optimized Utility Functions for Expense Tracker
 * Contains performance-optimized helpers and custom hooks
 */

// Debounce function for reducing function calls
const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function for limiting function execution
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Custom hook for localStorage with debouncing and error handling
const useLocalStorage = (key, initialValue, debounceDelay = 500) => {
  // Initialize state with localStorage value or initial value
  const [value, setValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Create debounced save function
  const debouncedSave = React.useMemo(
    () => debounce((newValue) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        // If localStorage is full, try to clear old data
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, attempting cleanup...');
          // Implement cleanup logic here if needed
        }
      }
    }, debounceDelay),
    [key, debounceDelay]
  );

  // Save to localStorage when value changes
  React.useEffect(() => {
    debouncedSave(value);
  }, [value, debouncedSave]);

  return [value, setValue];
};

// Custom hook for expense calculations with memoization
const useExpenseCalculations = (expenses, filterCategory) => {
  const filteredExpenses = React.useMemo(() => {
    if (filterCategory === 'All') return expenses;
    return expenses.filter(expense => expense.category === filterCategory);
  }, [expenses, filterCategory]);

  const total = React.useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const categoryTotals = React.useMemo(() => {
    return expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) acc[expense.category] = 0;
      acc[expense.category] += expense.amount;
      return acc;
    }, {});
  }, [expenses]);

  const monthlyTotals = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totals = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (!totals[monthYear]) {
        totals[monthYear] = { total: 0, count: 0, sortKey: date.getFullYear() * 12 + date.getMonth() };
      }
      totals[monthYear].total += expense.amount;
      totals[monthYear].count += 1;
    });

    // Sort and return last 12 months
    return Object.entries(totals)
      .sort((a, b) => a[1].sortKey - b[1].sortKey)
      .slice(-12)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }, [expenses]);

  return {
    filteredExpenses,
    total,
    categoryTotals,
    monthlyTotals,
    count: filteredExpenses.length
  };
};

// Custom hook for virtual scrolling
const useVirtualScroll = (items, itemHeight, containerHeight, buffer = 5) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = React.useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + containerHeight) / itemHeight);
    return {
      start: Math.max(0, start - buffer),
      end: Math.min(items.length, end + buffer)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, buffer]);

  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = React.useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  };
};

// Optimized currency formatter
const formatCurrency = (() => {
  // Create formatter once and reuse
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (amount) => {
    if (typeof amount === 'string') amount = parseFloat(amount);
    if (isNaN(amount)) return '$0.00';
    return formatter.format(amount);
  };
})();

// Optimized date formatter
const formatDate = (() => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (date) => {
    if (typeof date === 'string') date = new Date(date);
    return formatter.format(date);
  };
})();

// Efficient groupBy function
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

// Optimized sort function with memoization
const createSortFunction = (key, order = 'asc') => {
  const modifier = order === 'asc' ? 1 : -1;
  return (a, b) => {
    if (a[key] < b[key]) return -1 * modifier;
    if (a[key] > b[key]) return 1 * modifier;
    return 0;
  };
};

// Performance monitoring utility
const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
};

// Batch state updates utility
const useBatchedState = (initialState) => {
  const [state, setState] = React.useState(initialState);
  const pendingUpdates = React.useRef([]);
  const timeoutRef = React.useRef(null);

  const batchedSetState = React.useCallback((update) => {
    pendingUpdates.current.push(update);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        let newState = prevState;
        pendingUpdates.current.forEach(update => {
          newState = typeof update === 'function' ? update(newState) : { ...newState, ...update };
        });
        pendingUpdates.current = [];
        return newState;
      });
    }, 0);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [state, batchedSetState];
};

// Memoized filter function
const createFilterFunction = (filters) => {
  return (item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') continue;
      
      if (key === 'dateRange' && value.start && value.end) {
        const itemDate = new Date(item.date);
        const startDate = new Date(value.start);
        const endDate = new Date(value.end);
        if (itemDate < startDate || itemDate > endDate) return false;
      } else if (key === 'amountRange' && value.min !== undefined && value.max !== undefined) {
        if (item.amount < value.min || item.amount > value.max) return false;
      } else if (Array.isArray(value)) {
        if (!value.includes(item[key])) return false;
      } else if (item[key] !== value) {
        return false;
      }
    }
    return true;
  };
};

// Export all utilities
window.ExpenseTrackerUtils = {
  debounce,
  throttle,
  useLocalStorage,
  useExpenseCalculations,
  useVirtualScroll,
  formatCurrency,
  formatDate,
  groupBy,
  createSortFunction,
  measurePerformance,
  useBatchedState,
  createFilterFunction
};