/**
 * Storage module for Expense Tracker
 * Handles all data persistence and retrieval operations
 */

const ExpenseStorage = (function() {
    'use strict';

    // Storage keys
    const STORAGE_KEYS = {
        EXPENSES: 'expenseTracker_expenses',
        CATEGORIES: 'expenseTracker_categories',
        SETTINGS: 'expenseTracker_settings',
        LAST_ID: 'expenseTracker_lastId',
        VERSION: 'expenseTracker_version'
    };

    // Current storage version for migration purposes
    const STORAGE_VERSION = '1.0';

    // Default categories
    const DEFAULT_CATEGORIES = [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Education',
        'Travel',
        'Personal',
        'Other'
    ];

    // Expense data structure
    class Expense {
        constructor(description, amount, category, date = new Date()) {
            this.id = generateId();
            this.description = description;
            this.amount = parseFloat(amount);
            this.category = category;
            this.date = date instanceof Date ? date : new Date(date);
            this.createdAt = new Date();
            this.updatedAt = new Date();
        }
    }

    // Generate unique ID
    function generateId() {
        const lastId = localStorage.getItem(STORAGE_KEYS.LAST_ID) || '0';
        const newId = parseInt(lastId) + 1;
        localStorage.setItem(STORAGE_KEYS.LAST_ID, newId.toString());
        return `exp_${newId}_${Date.now()}`;
    }

    // Initialize storage
    function init() {
        // Check version and migrate if needed
        const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
        if (currentVersion !== STORAGE_VERSION) {
            migrate(currentVersion, STORAGE_VERSION);
        }

        // Initialize categories if not present
        if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        }

        // Initialize expenses array if not present
        if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
        }
    }

    // Migration handler for future versions
    function migrate(fromVersion, toVersion) {
        console.log(`Migrating storage from version ${fromVersion} to ${toVersion}`);
        // Add migration logic here when needed
        localStorage.setItem(STORAGE_KEYS.VERSION, toVersion);
    }

    // Data validation
    function validateExpense(data) {
        const errors = [];

        if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
            errors.push('Description is required and must be a non-empty string');
        }

        if (typeof data.amount !== 'number' || isNaN(data.amount) || data.amount <= 0) {
            errors.push('Amount must be a positive number');
        }

        if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
            errors.push('Category is required');
        }

        if (!(data.date instanceof Date) || isNaN(data.date.getTime())) {
            errors.push('Invalid date');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Safe JSON parse with error handling
    function safeJsonParse(json, defaultValue = []) {
        try {
            return JSON.parse(json) || defaultValue;
        } catch (e) {
            console.error('JSON parse error:', e);
            return defaultValue;
        }
    }

    // CRUD Operations

    // Create expense
    function saveExpense(description, amount, category, date) {
        try {
            const expense = new Expense(description, amount, category, date);
            
            const validation = validateExpense(expense);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('; '));
            }

            const expenses = getAllExpenses();
            expenses.push(expense);
            
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
            
            return {
                success: true,
                data: expense,
                message: 'Expense saved successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Read all expenses
    function getAllExpenses() {
        const expensesJson = localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]';
        const expenses = safeJsonParse(expensesJson, []);
        
        // Convert date strings back to Date objects
        return expenses.map(exp => ({
            ...exp,
            date: new Date(exp.date),
            createdAt: new Date(exp.createdAt),
            updatedAt: new Date(exp.updatedAt)
        }));
    }

    // Read single expense
    function getExpenseById(id) {
        const expenses = getAllExpenses();
        return expenses.find(exp => exp.id === id) || null;
    }

    // Update expense
    function updateExpense(id, updates) {
        try {
            const expenses = getAllExpenses();
            const index = expenses.findIndex(exp => exp.id === id);
            
            if (index === -1) {
                throw new Error('Expense not found');
            }

            const updatedExpense = {
                ...expenses[index],
                ...updates,
                id: id, // Prevent ID change
                updatedAt: new Date()
            };

            // Convert date if provided as string
            if (updates.date) {
                updatedExpense.date = new Date(updates.date);
            }

            const validation = validateExpense(updatedExpense);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('; '));
            }

            expenses[index] = updatedExpense;
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));

            return {
                success: true,
                data: updatedExpense,
                message: 'Expense updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete expense
    function deleteExpense(id) {
        try {
            const expenses = getAllExpenses();
            const filteredExpenses = expenses.filter(exp => exp.id !== id);
            
            if (expenses.length === filteredExpenses.length) {
                throw new Error('Expense not found');
            }

            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filteredExpenses));

            return {
                success: true,
                message: 'Expense deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete multiple expenses
    function deleteMultipleExpenses(ids) {
        try {
            const expenses = getAllExpenses();
            const filteredExpenses = expenses.filter(exp => !ids.includes(exp.id));
            
            const deletedCount = expenses.length - filteredExpenses.length;
            
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filteredExpenses));

            return {
                success: true,
                deletedCount: deletedCount,
                message: `${deletedCount} expense(s) deleted successfully`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Category Management

    function getAllCategories() {
        const categoriesJson = localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]';
        return safeJsonParse(categoriesJson, DEFAULT_CATEGORIES);
    }

    function addCategory(category) {
        try {
            if (!category || typeof category !== 'string' || category.trim() === '') {
                throw new Error('Category name is required');
            }

            const categories = getAllCategories();
            
            if (categories.includes(category.trim())) {
                throw new Error('Category already exists');
            }

            categories.push(category.trim());
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

            return {
                success: true,
                data: categories,
                message: 'Category added successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    function deleteCategory(category) {
        try {
            const categories = getAllCategories();
            const filteredCategories = categories.filter(cat => cat !== category);
            
            if (categories.length === filteredCategories.length) {
                throw new Error('Category not found');
            }

            // Check if category is in use
            const expenses = getAllExpenses();
            const categoryInUse = expenses.some(exp => exp.category === category);
            
            if (categoryInUse) {
                throw new Error('Cannot delete category that is in use');
            }

            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filteredCategories));

            return {
                success: true,
                data: filteredCategories,
                message: 'Category deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Aggregation Functions

    function getExpensesByDateRange(startDate, endDate) {
        const expenses = getAllExpenses();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        
        return expenses.filter(exp => exp.date >= start && exp.date <= end);
    }

    function getExpensesByMonth(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        return getExpensesByDateRange(startDate, endDate);
    }

    function getExpensesByYear(year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        return getExpensesByDateRange(startDate, endDate);
    }

    function getExpensesByCategory(category) {
        const expenses = getAllExpenses();
        return expenses.filter(exp => exp.category === category);
    }

    function getTotalByCategory(category, startDate, endDate) {
        let expenses = getExpensesByCategory(category);
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            expenses = expenses.filter(exp => exp.date >= start && exp.date <= end);
        }
        
        return expenses.reduce((total, exp) => total + exp.amount, 0);
    }

    function getMonthlyTotal(year, month) {
        const expenses = getExpensesByMonth(year, month);
        return expenses.reduce((total, exp) => total + exp.amount, 0);
    }

    function getYearlyTotal(year) {
        const expenses = getExpensesByYear(year);
        return expenses.reduce((total, exp) => total + exp.amount, 0);
    }

    function getCategoryTotals(startDate, endDate) {
        const expenses = startDate && endDate ? 
            getExpensesByDateRange(startDate, endDate) : 
            getAllExpenses();
        
        const totals = {};
        
        expenses.forEach(exp => {
            if (!totals[exp.category]) {
                totals[exp.category] = 0;
            }
            totals[exp.category] += exp.amount;
        });
        
        return totals;
    }

    function getMonthlyBreakdown(year) {
        const breakdown = [];
        
        for (let month = 1; month <= 12; month++) {
            const expenses = getExpensesByMonth(year, month);
            const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            
            breakdown.push({
                month: month,
                monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
                total: total,
                count: expenses.length,
                expenses: expenses
            });
        }
        
        return breakdown;
    }

    // Export/Import Functions

    function exportData(includeSettings = true) {
        const data = {
            version: STORAGE_VERSION,
            exportDate: new Date().toISOString(),
            expenses: getAllExpenses(),
            categories: getAllCategories()
        };
        
        if (includeSettings) {
            const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            data.settings = safeJsonParse(settingsJson, {});
        }
        
        return JSON.stringify(data, null, 2);
    }

    function importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate import data structure
            if (!data.expenses || !Array.isArray(data.expenses)) {
                throw new Error('Invalid import data: missing expenses array');
            }
            
            // Validate each expense
            const validExpenses = [];
            const errors = [];
            
            data.expenses.forEach((exp, index) => {
                try {
                    const expense = new Expense(
                        exp.description,
                        exp.amount,
                        exp.category,
                        exp.date
                    );
                    
                    // Preserve original ID if valid
                    if (exp.id && typeof exp.id === 'string') {
                        expense.id = exp.id;
                    }
                    
                    const validation = validateExpense(expense);
                    if (validation.isValid) {
                        validExpenses.push(expense);
                    } else {
                        errors.push(`Expense ${index + 1}: ${validation.errors.join(', ')}`);
                    }
                } catch (e) {
                    errors.push(`Expense ${index + 1}: ${e.message}`);
                }
            });
            
            if (errors.length > 0 && validExpenses.length === 0) {
                throw new Error('No valid expenses found in import data');
            }
            
            // Import categories if present
            if (data.categories && Array.isArray(data.categories)) {
                localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
            }
            
            // Import settings if present
            if (data.settings && typeof data.settings === 'object') {
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            }
            
            // Save valid expenses
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(validExpenses));
            
            return {
                success: true,
                imported: validExpenses.length,
                errors: errors,
                message: `Successfully imported ${validExpenses.length} expenses`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    function exportToCSV() {
        const expenses = getAllExpenses();
        
        if (expenses.length === 0) {
            return '';
        }
        
        // CSV headers
        const headers = ['Date', 'Description', 'Category', 'Amount'];
        const csvRows = [headers.join(',')];
        
        // Add expense rows
        expenses.forEach(exp => {
            const row = [
                exp.date.toISOString().split('T')[0],
                `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes
                `"${exp.category.replace(/"/g, '""')}"`,
                exp.amount.toFixed(2)
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    // Utility Functions

    function clearAllData() {
        if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            init(); // Reinitialize with defaults
            return true;
        }
        return false;
    }

    function getStorageSize() {
        let totalSize = 0;
        
        Object.values(STORAGE_KEYS).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += item.length + key.length;
            }
        });
        
        return {
            bytes: totalSize,
            kilobytes: (totalSize / 1024).toFixed(2),
            megabytes: (totalSize / 1024 / 1024).toFixed(4)
        };
    }

    function getStatistics() {
        const expenses = getAllExpenses();
        const categories = getAllCategories();
        
        if (expenses.length === 0) {
            return {
                totalExpenses: 0,
                totalAmount: 0,
                averageAmount: 0,
                categoriesUsed: 0,
                dateRange: null
            };
        }
        
        const amounts = expenses.map(exp => exp.amount);
        const dates = expenses.map(exp => exp.date);
        const usedCategories = new Set(expenses.map(exp => exp.category));
        
        return {
            totalExpenses: expenses.length,
            totalAmount: amounts.reduce((sum, amt) => sum + amt, 0),
            averageAmount: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length,
            minAmount: Math.min(...amounts),
            maxAmount: Math.max(...amounts),
            categoriesUsed: usedCategories.size,
            totalCategories: categories.length,
            dateRange: {
                earliest: new Date(Math.min(...dates)),
                latest: new Date(Math.max(...dates))
            }
        };
    }

    // Search and Filter Functions

    function searchExpenses(query, options = {}) {
        const expenses = getAllExpenses();
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            return expenses;
        }
        
        return expenses.filter(exp => {
            // Search in description
            if (exp.description.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in category if enabled
            if (options.includeCategory && exp.category.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search by amount if query is numeric
            if (options.includeAmount && !isNaN(searchTerm)) {
                const amount = parseFloat(searchTerm);
                if (Math.abs(exp.amount - amount) < 0.01) {
                    return true;
                }
            }
            
            return false;
        });
    }

    function filterExpenses(filters = {}) {
        let expenses = getAllExpenses();
        
        // Filter by date range
        if (filters.startDate) {
            const start = new Date(filters.startDate);
            expenses = expenses.filter(exp => exp.date >= start);
        }
        
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            expenses = expenses.filter(exp => exp.date <= end);
        }
        
        // Filter by categories
        if (filters.categories && filters.categories.length > 0) {
            expenses = expenses.filter(exp => filters.categories.includes(exp.category));
        }
        
        // Filter by amount range
        if (filters.minAmount !== undefined) {
            expenses = expenses.filter(exp => exp.amount >= filters.minAmount);
        }
        
        if (filters.maxAmount !== undefined) {
            expenses = expenses.filter(exp => exp.amount <= filters.maxAmount);
        }
        
        // Sort results
        if (filters.sortBy) {
            expenses.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'date':
                        return filters.sortOrder === 'desc' ? 
                            b.date - a.date : a.date - b.date;
                    case 'amount':
                        return filters.sortOrder === 'desc' ? 
                            b.amount - a.amount : a.amount - b.amount;
                    case 'description':
                        return filters.sortOrder === 'desc' ? 
                            b.description.localeCompare(a.description) : 
                            a.description.localeCompare(b.description);
                    default:
                        return 0;
                }
            });
        }
        
        return expenses;
    }

    // Initialize on load
    init();

    // Public API
    return {
        // Core CRUD operations
        saveExpense: saveExpense,
        getAllExpenses: getAllExpenses,
        getExpenseById: getExpenseById,
        updateExpense: updateExpense,
        deleteExpense: deleteExpense,
        deleteMultipleExpenses: deleteMultipleExpenses,
        
        // Category management
        getAllCategories: getAllCategories,
        addCategory: addCategory,
        deleteCategory: deleteCategory,
        
        // Date-based queries
        getExpensesByDateRange: getExpensesByDateRange,
        getExpensesByMonth: getExpensesByMonth,
        getExpensesByYear: getExpensesByYear,
        getExpensesByCategory: getExpensesByCategory,
        
        // Aggregation functions
        getTotalByCategory: getTotalByCategory,
        getMonthlyTotal: getMonthlyTotal,
        getYearlyTotal: getYearlyTotal,
        getCategoryTotals: getCategoryTotals,
        getMonthlyBreakdown: getMonthlyBreakdown,
        
        // Export/Import
        exportData: exportData,
        importData: importData,
        exportToCSV: exportToCSV,
        
        // Search and filter
        searchExpenses: searchExpenses,
        filterExpenses: filterExpenses,
        
        // Utility functions
        clearAllData: clearAllData,
        getStorageSize: getStorageSize,
        getStatistics: getStatistics,
        
        // Constants
        DEFAULT_CATEGORIES: DEFAULT_CATEGORIES
    };
})();

// Make available globally for browser usage
window.ExpenseStorage = ExpenseStorage;