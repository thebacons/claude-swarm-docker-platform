# Expense Tracker API Reference

## Overview

The ExpenseStorage module provides a comprehensive API for managing expense data in the browser's localStorage. This document details all available methods, their parameters, return values, and usage examples.

## Table of Contents

1. [Core CRUD Operations](#core-crud-operations)
2. [Category Management](#category-management)
3. [Data Queries](#data-queries)
4. [Aggregation Functions](#aggregation-functions)
5. [Search and Filter](#search-and-filter)
6. [Import/Export](#importexport)
7. [Utility Functions](#utility-functions)
8. [Data Types](#data-types)
9. [Error Handling](#error-handling)
10. [Usage Examples](#usage-examples)

## Core CRUD Operations

### saveExpense

Creates a new expense record.

```javascript
ExpenseStorage.saveExpense(description, amount, category, date)
```

#### Parameters
- `description` (string, required): Description of the expense
- `amount` (number, required): Amount spent (positive number)
- `category` (string, required): Category name
- `date` (Date|string, optional): Date of expense (defaults to today)

#### Returns
```javascript
{
  success: boolean,
  data?: Expense,    // The created expense object
  error?: string     // Error message if failed
}
```

#### Example
```javascript
const result = ExpenseStorage.saveExpense(
  "Lunch at restaurant",
  25.50,
  "Food",
  new Date("2024-01-24")
);

if (result.success) {
  console.log("Expense created:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### getAllExpenses

Retrieves all stored expenses.

```javascript
ExpenseStorage.getAllExpenses()
```

#### Returns
`Expense[]` - Array of all expense objects

#### Example
```javascript
const expenses = ExpenseStorage.getAllExpenses();
console.log(`Total expenses: ${expenses.length}`);
```

### getExpenseById

Retrieves a single expense by ID.

```javascript
ExpenseStorage.getExpenseById(id)
```

#### Parameters
- `id` (string, required): Unique expense identifier

#### Returns
`Expense | null` - The expense object or null if not found

#### Example
```javascript
const expense = ExpenseStorage.getExpenseById("exp_123_1706115200000");
if (expense) {
  console.log(`Found: ${expense.description}`);
}
```

### updateExpense

Updates an existing expense.

```javascript
ExpenseStorage.updateExpense(id, updates)
```

#### Parameters
- `id` (string, required): Expense ID to update
- `updates` (object, required): Fields to update

#### Returns
```javascript
{
  success: boolean,
  data?: Expense,    // Updated expense object
  error?: string     // Error message if failed
}
```

#### Example
```javascript
const result = ExpenseStorage.updateExpense("exp_123", {
  amount: 30.00,
  description: "Lunch at Italian restaurant"
});
```

### deleteExpense

Deletes a single expense.

```javascript
ExpenseStorage.deleteExpense(id)
```

#### Parameters
- `id` (string, required): Expense ID to delete

#### Returns
```javascript
{
  success: boolean,
  message?: string,
  error?: string
}
```

#### Example
```javascript
const result = ExpenseStorage.deleteExpense("exp_123");
if (result.success) {
  console.log("Expense deleted successfully");
}
```

### deleteMultipleExpenses

Deletes multiple expenses at once.

```javascript
ExpenseStorage.deleteMultipleExpenses(ids)
```

#### Parameters
- `ids` (string[], required): Array of expense IDs to delete

#### Returns
```javascript
{
  success: boolean,
  deletedCount?: number,
  message?: string,
  error?: string
}
```

#### Example
```javascript
const idsToDelete = ["exp_123", "exp_124", "exp_125"];
const result = ExpenseStorage.deleteMultipleExpenses(idsToDelete);
console.log(`Deleted ${result.deletedCount} expenses`);
```

## Category Management

### getAllCategories

Retrieves all available categories.

```javascript
ExpenseStorage.getAllCategories()
```

#### Returns
`string[]` - Array of category names

#### Example
```javascript
const categories = ExpenseStorage.getAllCategories();
// ["Food", "Transport", "Entertainment", "Utilities", "Other"]
```

### addCategory

Adds a new category.

```javascript
ExpenseStorage.addCategory(categoryName)
```

#### Parameters
- `categoryName` (string, required): Name of the new category

#### Returns
```javascript
{
  success: boolean,
  data?: string[],   // Updated categories array
  error?: string
}
```

#### Example
```javascript
const result = ExpenseStorage.addCategory("Healthcare");
if (result.success) {
  console.log("Categories:", result.data);
}
```

### deleteCategory

Deletes a category (only if not in use).

```javascript
ExpenseStorage.deleteCategory(categoryName)
```

#### Parameters
- `categoryName` (string, required): Category to delete

#### Returns
```javascript
{
  success: boolean,
  data?: string[],   // Updated categories array
  error?: string
}
```

#### Example
```javascript
const result = ExpenseStorage.deleteCategory("Other");
if (!result.success) {
  console.error(result.error); // "Cannot delete category that is in use"
}
```

## Data Queries

### getExpensesByDateRange

Retrieves expenses within a date range.

```javascript
ExpenseStorage.getExpensesByDateRange(startDate, endDate)
```

#### Parameters
- `startDate` (Date|string, required): Start date (inclusive)
- `endDate` (Date|string, required): End date (inclusive)

#### Returns
`Expense[]` - Filtered expense array

#### Example
```javascript
const january2024 = ExpenseStorage.getExpensesByDateRange(
  "2024-01-01",
  "2024-01-31"
);
```

### getExpensesByMonth

Retrieves expenses for a specific month.

```javascript
ExpenseStorage.getExpensesByMonth(year, month)
```

#### Parameters
- `year` (number, required): Year (e.g., 2024)
- `month` (number, required): Month (1-12)

#### Returns
`Expense[]` - Expenses for the specified month

#### Example
```javascript
const january = ExpenseStorage.getExpensesByMonth(2024, 1);
console.log(`January expenses: ${january.length}`);
```

### getExpensesByYear

Retrieves all expenses for a year.

```javascript
ExpenseStorage.getExpensesByYear(year)
```

#### Parameters
- `year` (number, required): Year to query

#### Returns
`Expense[]` - All expenses for the year

#### Example
```javascript
const year2024 = ExpenseStorage.getExpensesByYear(2024);
```

### getExpensesByCategory

Retrieves all expenses for a specific category.

```javascript
ExpenseStorage.getExpensesByCategory(category)
```

#### Parameters
- `category` (string, required): Category name

#### Returns
`Expense[]` - Expenses in the specified category

#### Example
```javascript
const foodExpenses = ExpenseStorage.getExpensesByCategory("Food");
```

## Aggregation Functions

### getTotalByCategory

Calculates total spending for a category.

```javascript
ExpenseStorage.getTotalByCategory(category, startDate?, endDate?)
```

#### Parameters
- `category` (string, required): Category name
- `startDate` (Date|string, optional): Start date filter
- `endDate` (Date|string, optional): End date filter

#### Returns
`number` - Total amount spent

#### Example
```javascript
// All time total for Food
const foodTotal = ExpenseStorage.getTotalByCategory("Food");

// Food total for January 2024
const janFoodTotal = ExpenseStorage.getTotalByCategory(
  "Food",
  "2024-01-01",
  "2024-01-31"
);
```

### getMonthlyTotal

Calculates total spending for a month.

```javascript
ExpenseStorage.getMonthlyTotal(year, month)
```

#### Parameters
- `year` (number, required): Year
- `month` (number, required): Month (1-12)

#### Returns
`number` - Total amount for the month

#### Example
```javascript
const januaryTotal = ExpenseStorage.getMonthlyTotal(2024, 1);
console.log(`January total: $${januaryTotal.toFixed(2)}`);
```

### getYearlyTotal

Calculates total spending for a year.

```javascript
ExpenseStorage.getYearlyTotal(year)
```

#### Parameters
- `year` (number, required): Year

#### Returns
`number` - Total amount for the year

#### Example
```javascript
const total2024 = ExpenseStorage.getYearlyTotal(2024);
```

### getCategoryTotals

Gets spending totals for all categories.

```javascript
ExpenseStorage.getCategoryTotals(startDate?, endDate?)
```

#### Parameters
- `startDate` (Date|string, optional): Start date filter
- `endDate` (Date|string, optional): End date filter

#### Returns
`Object` - Map of category names to totals

#### Example
```javascript
const totals = ExpenseStorage.getCategoryTotals();
// {
//   "Food": 234.56,
//   "Transport": 123.45,
//   "Entertainment": 89.00
// }

// For specific period
const janTotals = ExpenseStorage.getCategoryTotals(
  "2024-01-01",
  "2024-01-31"
);
```

### getMonthlyBreakdown

Gets detailed monthly spending breakdown.

```javascript
ExpenseStorage.getMonthlyBreakdown(year)
```

#### Parameters
- `year` (number, required): Year to analyze

#### Returns
```javascript
Array<{
  month: number,
  monthName: string,
  total: number,
  count: number,
  expenses: Expense[]
}>
```

#### Example
```javascript
const breakdown2024 = ExpenseStorage.getMonthlyBreakdown(2024);
breakdown2024.forEach(month => {
  console.log(`${month.monthName}: $${month.total} (${month.count} expenses)`);
});
```

## Search and Filter

### searchExpenses

Search expenses by text query.

```javascript
ExpenseStorage.searchExpenses(query, options?)
```

#### Parameters
- `query` (string, required): Search term
- `options` (object, optional):
  - `includeCategory` (boolean): Search in category names
  - `includeAmount` (boolean): Search by amount

#### Returns
`Expense[]` - Matching expenses

#### Example
```javascript
// Search in descriptions only
const results = ExpenseStorage.searchExpenses("coffee");

// Search including categories
const results2 = ExpenseStorage.searchExpenses("food", {
  includeCategory: true
});

// Search by amount
const results3 = ExpenseStorage.searchExpenses("25.50", {
  includeAmount: true
});
```

### filterExpenses

Advanced filtering with multiple criteria.

```javascript
ExpenseStorage.filterExpenses(filters)
```

#### Parameters
```javascript
{
  startDate?: Date|string,
  endDate?: Date|string,
  categories?: string[],
  minAmount?: number,
  maxAmount?: number,
  sortBy?: 'date' | 'amount' | 'description',
  sortOrder?: 'asc' | 'desc'
}
```

#### Returns
`Expense[]` - Filtered and sorted expenses

#### Example
```javascript
const filtered = ExpenseStorage.filterExpenses({
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  categories: ["Food", "Transport"],
  minAmount: 10,
  maxAmount: 100,
  sortBy: "amount",
  sortOrder: "desc"
});
```

## Import/Export

### exportData

Exports all data as JSON.

```javascript
ExpenseStorage.exportData(includeSettings?)
```

#### Parameters
- `includeSettings` (boolean, optional): Include app settings

#### Returns
`string` - JSON string of all data

#### Example
```javascript
const backup = ExpenseStorage.exportData();
// Save to file or clipboard
console.log(backup);

// Without settings
const expensesOnly = ExpenseStorage.exportData(false);
```

### importData

Imports data from JSON string.

```javascript
ExpenseStorage.importData(jsonData)
```

#### Parameters
- `jsonData` (string, required): JSON data to import

#### Returns
```javascript
{
  success: boolean,
  imported?: number,     // Number of imported expenses
  errors?: string[],     // Validation errors
  error?: string
}
```

#### Example
```javascript
const jsonData = '{"expenses": [...], "categories": [...]}';
const result = ExpenseStorage.importData(jsonData);

if (result.success) {
  console.log(`Imported ${result.imported} expenses`);
} else {
  console.error("Import errors:", result.errors);
}
```

### exportToCSV

Exports expenses as CSV format.

```javascript
ExpenseStorage.exportToCSV()
```

#### Returns
`string` - CSV formatted data

#### Example
```javascript
const csv = ExpenseStorage.exportToCSV();
// Download as file
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'expenses.csv';
a.click();
```

## Utility Functions

### clearAllData

Deletes all stored data (with confirmation).

```javascript
ExpenseStorage.clearAllData()
```

#### Returns
`boolean` - True if cleared, false if cancelled

#### Example
```javascript
if (ExpenseStorage.clearAllData()) {
  console.log("All data cleared");
} else {
  console.log("Clear cancelled");
}
```

### getStorageSize

Gets current storage usage.

```javascript
ExpenseStorage.getStorageSize()
```

#### Returns
```javascript
{
  bytes: number,
  kilobytes: string,
  megabytes: string
}
```

#### Example
```javascript
const size = ExpenseStorage.getStorageSize();
console.log(`Storage used: ${size.kilobytes} KB`);
```

### getStatistics

Gets comprehensive statistics.

```javascript
ExpenseStorage.getStatistics()
```

#### Returns
```javascript
{
  totalExpenses: number,
  totalAmount: number,
  averageAmount: number,
  minAmount: number,
  maxAmount: number,
  categoriesUsed: number,
  totalCategories: number,
  dateRange: {
    earliest: Date,
    latest: Date
  } | null
}
```

#### Example
```javascript
const stats = ExpenseStorage.getStatistics();
console.log(`
  Total Expenses: ${stats.totalExpenses}
  Total Amount: $${stats.totalAmount.toFixed(2)}
  Average: $${stats.averageAmount.toFixed(2)}
  Categories Used: ${stats.categoriesUsed}/${stats.totalCategories}
`);
```

## Data Types

### Expense Object

```typescript
interface Expense {
  id: string;              // Unique identifier (e.g., "exp_1_1706115200000")
  description: string;     // Expense description
  amount: number;          // Amount spent (positive number)
  category: string;        // Category name
  date: Date;             // Date of expense
  notes?: string;         // Optional notes
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last update timestamp
}
```

### Statistics Object

```typescript
interface Statistics {
  totalExpenses: number;   // Count of all expenses
  totalAmount: number;     // Sum of all amounts
  averageAmount: number;   // Average expense amount
  minAmount: number;       // Smallest expense
  maxAmount: number;       // Largest expense
  categoriesUsed: number;  // Number of used categories
  totalCategories: number; // Total available categories
  dateRange: {
    earliest: Date;        // Oldest expense date
    latest: Date;          // Newest expense date
  } | null;               // Null if no expenses
}
```

### MonthlyBreakdown Object

```typescript
interface MonthlyBreakdown {
  month: number;          // Month number (1-12)
  monthName: string;      // Month name (e.g., "January")
  total: number;          // Total spent in month
  count: number;          // Number of expenses
  expenses: Expense[];    // Array of month's expenses
}
```

## Error Handling

### Common Errors

1. **Validation Errors**
   ```javascript
   {
     success: false,
     error: "Description is required and must be a non-empty string"
   }
   ```

2. **Not Found Errors**
   ```javascript
   {
     success: false,
     error: "Expense not found"
   }
   ```

3. **Category In Use**
   ```javascript
   {
     success: false,
     error: "Cannot delete category that is in use"
   }
   ```

4. **Import Errors**
   ```javascript
   {
     success: false,
     errors: [
       "Expense 1: Amount must be a positive number",
       "Expense 3: Invalid date"
     ]
   }
   ```

### Error Handling Pattern

```javascript
// Always check success flag
const result = ExpenseStorage.saveExpense(...);
if (result.success) {
  // Handle success
  console.log("Saved:", result.data);
} else {
  // Handle error
  console.error("Error:", result.error);
  alert(result.error);
}
```

## Usage Examples

### Example 1: Monthly Budget Report

```javascript
function generateMonthlyReport(year, month) {
  const expenses = ExpenseStorage.getExpensesByMonth(year, month);
  const total = ExpenseStorage.getMonthlyTotal(year, month);
  const categoryTotals = ExpenseStorage.getCategoryTotals(
    new Date(year, month - 1, 1),
    new Date(year, month, 0)
  );
  
  console.log(`=== ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} ===`);
  console.log(`Total Spent: $${total.toFixed(2)}`);
  console.log(`Transactions: ${expenses.length}`);
  console.log("\nBy Category:");
  
  Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, amount]) => {
      const percentage = (amount / total * 100).toFixed(1);
      console.log(`  ${category}: $${amount.toFixed(2)} (${percentage}%)`);
    });
}

// Usage
generateMonthlyReport(2024, 1);
```

### Example 2: Find Expensive Purchases

```javascript
function findExpensivePurchases(threshold = 100) {
  const allExpenses = ExpenseStorage.getAllExpenses();
  const expensive = allExpenses
    .filter(exp => exp.amount >= threshold)
    .sort((a, b) => b.amount - a.amount);
  
  console.log(`Expenses over $${threshold}:`);
  expensive.forEach(exp => {
    console.log(`- ${exp.description}: $${exp.amount.toFixed(2)} (${exp.date.toLocaleDateString()})`);
  });
  
  return expensive;
}

// Usage
const bigPurchases = findExpensivePurchases(50);
```

### Example 3: Category Spending Trends

```javascript
function analyzeSpendingTrends(category, months = 6) {
  const now = new Date();
  const trends = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const year = now.getFullYear();
    const month = now.getMonth() - i + 1;
    
    const expenses = ExpenseStorage.getExpensesByMonth(year, month)
      .filter(exp => exp.category === category);
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    trends.push({
      month: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
      total: total,
      count: expenses.length,
      average: expenses.length > 0 ? total / expenses.length : 0
    });
  }
  
  return trends;
}

// Usage
const foodTrends = analyzeSpendingTrends("Food", 6);
console.table(foodTrends);
```

### Example 4: Backup and Restore

```javascript
// Create automated backup
function createBackup() {
  const data = ExpenseStorage.exportData();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `expense-backup-${timestamp}.json`;
  
  // Create download link
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  console.log(`Backup saved as ${filename}`);
}

// Restore from backup
function restoreFromBackup(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = ExpenseStorage.importData(e.target.result);
    if (result.success) {
      alert(`Restored ${result.imported} expenses successfully!`);
      location.reload(); // Refresh the app
    } else {
      alert(`Restore failed: ${result.errors.join('\n')}`);
    }
  };
  reader.readAsText(file);
}
```

### Example 5: Smart Insights

```javascript
function generateInsights() {
  const stats = ExpenseStorage.getStatistics();
  const categories = ExpenseStorage.getCategoryTotals();
  const insights = [];
  
  // Highest spending category
  const [topCategory, topAmount] = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0] || ['None', 0];
  
  insights.push(`Your highest spending is on ${topCategory} ($${topAmount.toFixed(2)})`);
  
  // Average transaction
  insights.push(`Average transaction: $${stats.averageAmount.toFixed(2)}`);
  
  // Unusual expenses
  const unusual = ExpenseStorage.getAllExpenses()
    .filter(exp => exp.amount > stats.averageAmount * 3);
  
  if (unusual.length > 0) {
    insights.push(`You have ${unusual.length} unusually large expenses`);
  }
  
  // Recent activity
  const lastWeek = ExpenseStorage.getExpensesByDateRange(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  );
  
  const weekTotal = lastWeek.reduce((sum, exp) => sum + exp.amount, 0);
  insights.push(`Last 7 days: $${weekTotal.toFixed(2)} across ${lastWeek.length} transactions`);
  
  return insights;
}

// Usage
const insights = generateInsights();
insights.forEach(insight => console.log(`💡 ${insight}`));
```

## Best Practices

1. **Always Check Return Values**
   ```javascript
   const result = ExpenseStorage.saveExpense(...);
   if (!result.success) {
     // Handle error appropriately
   }
   ```

2. **Use Date Objects**
   ```javascript
   // Preferred
   ExpenseStorage.saveExpense("Lunch", 20, "Food", new Date());
   
   // Also works but less type-safe
   ExpenseStorage.saveExpense("Lunch", 20, "Food", "2024-01-24");
   ```

3. **Batch Operations**
   ```javascript
   // Efficient for multiple deletes
   const idsToDelete = expenses.map(e => e.id);
   ExpenseStorage.deleteMultipleExpenses(idsToDelete);
   ```

4. **Regular Backups**
   ```javascript
   // Set up automated backups
   setInterval(() => {
     const backup = ExpenseStorage.exportData();
     // Send to server or save locally
   }, 24 * 60 * 60 * 1000); // Daily
   ```

5. **Monitor Storage**
   ```javascript
   const size = ExpenseStorage.getStorageSize();
   if (parseInt(size.megabytes) > 4) {
     console.warn("Approaching storage limit");
   }
   ```

---

For more information, see the [Developer Documentation](DEVELOPER-DOCS.md) or [User Guide](USER-GUIDE.md).