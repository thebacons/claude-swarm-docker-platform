# Expense Tracker with Charts

A modern, feature-rich expense tracking application with beautiful data visualizations built using React and Canvas API. Track your spending habits, categorize expenses, and gain insights through interactive charts and analytics.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [User Guide](#user-guide)
- [Developer Documentation](#developer-documentation)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Features

### Core Features

#### 💰 Expense Management
- **Add Expenses**: Quick and intuitive form to add new expenses
- **Edit Expenses**: Modify existing expenses with pre-filled forms
- **Delete Expenses**: Remove unwanted expenses with confirmation
- **Categorization**: Organize expenses into predefined categories
- **Date Tracking**: Record when each expense occurred
- **Notes**: Add optional notes to expenses for additional context

#### 📊 Data Visualization
- **Pie Chart**: Visual breakdown of expenses by category
  - Donut-style design with percentages
  - Interactive hover effects
  - Total amount displayed in center
- **Bar Chart**: Monthly spending trends
  - Last 6 months of data
  - Grid lines for easy reading
  - Responsive sizing
- **Summary Cards**: At-a-glance metrics
  - Total expenses overview
  - Monthly average spending
  - Highest spending category
- **Category Cards**: Detailed breakdown per category
  - Total amount spent
  - Percentage of total expenses
  - Number of transactions
  - Visual progress bar

#### 🔍 Filtering & Search
- Filter expenses by category
- View all expenses or specific categories
- Real-time updates as filters change

#### 💾 Data Persistence
- All data stored locally in browser's localStorage
- Automatic saving on every change
- Data survives browser restarts
- Export/Import functionality for backups

#### 📱 Responsive Design
- Works seamlessly on desktop, tablet, and mobile
- Touch-friendly interface
- Adaptive layouts for different screen sizes

### Technical Features

- **No Build Required**: Runs directly in browser with CDN-loaded dependencies
- **Modern React**: Uses React 18 with Hooks
- **Canvas Charts**: Custom chart implementations without external libraries
- **Real-time Updates**: Charts and summaries update instantly
- **Error Handling**: Comprehensive error handling and validation
- **Performance Optimized**: Efficient rendering and data processing

## 📦 Installation

### Option 1: Direct Usage (Recommended)

1. Download or clone the repository:
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. Open `index.html` in any modern web browser:
   - Chrome (recommended)
   - Firefox
   - Safari
   - Edge

That's it! No installation, no build process, no dependencies to install.

### Option 2: Serve Locally

If you prefer to serve the files through a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## 🎯 Quick Start

1. **Open the Application**: Launch `index.html` in your browser
2. **Add Your First Expense**:
   - Click on the "Expenses" tab (default view)
   - Fill in the description (e.g., "Lunch at restaurant")
   - Enter the amount (e.g., 25.50)
   - Select a category (e.g., Food)
   - Choose the date
   - Click "Add Expense"
3. **View Your Charts**:
   - Click on "Charts & Analytics" tab
   - See your expense breakdown in the pie chart
   - View monthly trends in the bar chart
4. **Try Demo Data**:
   - In the Charts view, click "Load Demo Data for Charts"
   - Explore all features with sample data

## 📖 User Guide

### Adding Expenses

1. **Navigate to Expenses Tab**: The default view when you open the app
2. **Fill the Form**:
   - **Description**: What did you spend money on? (Required)
   - **Amount**: How much did it cost? (Required, positive numbers only)
   - **Category**: Select from Food, Transport, Entertainment, Utilities, or Other
   - **Date**: When did this expense occur? (Defaults to today)
   - **Notes**: Any additional information (Optional)
3. **Submit**: Click "Add Expense" to save

### Editing Expenses

1. **Find the Expense**: Locate it in the expense list
2. **Click Edit**: Press the ✏️ button
3. **Modify Details**: The form will populate with current values
4. **Update**: Click "Update Expense" to save changes

### Deleting Expenses

1. **Find the Expense**: Locate it in the expense list
2. **Click Delete**: Press the 🗑️ button
3. **Confirm**: Click OK in the confirmation dialog

### Understanding the Charts

#### Pie Chart (Expense Breakdown)
- **Purpose**: Shows how your spending is distributed across categories
- **Features**:
  - Each slice represents a category
  - Percentages shown on each slice
  - Total amount in the center
  - Legend below with exact amounts

#### Bar Chart (Monthly Trends)
- **Purpose**: Visualizes spending patterns over time
- **Features**:
  - Last 6 months of data
  - Monthly totals above each bar
  - Grid lines for easy comparison
  - Month labels at the bottom

#### Summary Cards
- **Total Expenses**: Sum of all recorded expenses
- **Monthly Average**: Average spending per month
- **Highest Category**: Category where you spend the most

#### Category Cards
- **Individual Metrics**: Detailed view for each category
- **Progress Bar**: Visual representation of category percentage
- **Transaction Count**: Number of expenses in that category

### Filtering Expenses

1. **Use the Filter Dropdown**: Located above the expense list
2. **Select a Category**: Choose specific category or "All Categories"
3. **View Results**: List updates automatically

### Data Management

#### Export Data
```javascript
// In browser console:
const data = ExpenseStorage.exportData();
// Copy the output and save to a file
```

#### Import Data
```javascript
// In browser console:
ExpenseStorage.importData(jsonDataString);
```

#### Clear All Data
```javascript
// In browser console:
ExpenseStorage.clearAllData();
```

## 🛠️ Developer Documentation

### Project Structure

```
expense-tracker/
├── index.html              # Main HTML file
├── App.js                  # Main React application
├── Charts.js               # Chart components and rendering
├── ExpenseForm.js          # Form component for adding/editing
├── storage.js              # Data persistence layer
├── error-handler.js        # Error handling utilities
├── performance-monitor.js  # Performance monitoring
├── App.css                 # Main stylesheet
├── error-styles.css        # Error component styles
└── demo-data.js           # Demo data generator
```

### Architecture Overview

The application follows a component-based architecture with clear separation of concerns:

1. **Presentation Layer**: React components handle UI rendering
2. **Data Layer**: Storage module manages persistence
3. **Business Logic**: Validation and calculations in components
4. **Styling**: CSS with custom properties for theming

### Key Components

#### App.js
- Main application component
- Manages global state
- Handles routing between views
- Coordinates child components

#### Charts.js
- Renders pie and bar charts using Canvas API
- Calculates statistics and aggregations
- Responsive chart sizing
- No external dependencies

#### ExpenseForm.js
- Handles expense input and validation
- Supports both create and edit modes
- Real-time validation feedback
- Accessible form design

#### storage.js
- Complete CRUD operations for expenses
- Category management
- Data export/import
- Search and filtering
- Aggregation functions

### State Management

The application uses React's useState for state management:

```javascript
// Main state in App.js
const [expenses, setExpenses] = useState([]);
const [formData, setFormData] = useState({...});
const [editingId, setEditingId] = useState(null);
const [filterCategory, setFilterCategory] = useState('All');
const [activeView, setActiveView] = useState('expenses');
```

### Data Flow

1. User interacts with UI components
2. Components update local state
3. State changes trigger re-renders
4. Data persisted to localStorage
5. Charts update automatically

### Styling System

The application uses a custom CSS system with:
- CSS custom properties for theming
- BEM-like naming convention
- Mobile-first responsive design
- Utility classes for common patterns

## 📚 API Documentation

### Storage Module API

The `ExpenseStorage` module provides a comprehensive API for data management:

#### Core CRUD Operations

```javascript
// Create a new expense
ExpenseStorage.saveExpense(description, amount, category, date)
// Returns: { success: boolean, data?: Expense, error?: string }

// Get all expenses
ExpenseStorage.getAllExpenses()
// Returns: Expense[]

// Get single expense
ExpenseStorage.getExpenseById(id)
// Returns: Expense | null

// Update expense
ExpenseStorage.updateExpense(id, updates)
// Returns: { success: boolean, data?: Expense, error?: string }

// Delete expense
ExpenseStorage.deleteExpense(id)
// Returns: { success: boolean, message?: string, error?: string }

// Delete multiple expenses
ExpenseStorage.deleteMultipleExpenses(ids)
// Returns: { success: boolean, deletedCount?: number, message?: string, error?: string }
```

#### Category Management

```javascript
// Get all categories
ExpenseStorage.getAllCategories()
// Returns: string[]

// Add new category
ExpenseStorage.addCategory(categoryName)
// Returns: { success: boolean, data?: string[], error?: string }

// Delete category
ExpenseStorage.deleteCategory(categoryName)
// Returns: { success: boolean, data?: string[], error?: string }
```

#### Data Queries

```javascript
// Get expenses by date range
ExpenseStorage.getExpensesByDateRange(startDate, endDate)
// Returns: Expense[]

// Get expenses by month
ExpenseStorage.getExpensesByMonth(year, month)
// Returns: Expense[]

// Get expenses by year
ExpenseStorage.getExpensesByYear(year)
// Returns: Expense[]

// Get expenses by category
ExpenseStorage.getExpensesByCategory(category)
// Returns: Expense[]
```

#### Aggregation Functions

```javascript
// Get total by category
ExpenseStorage.getTotalByCategory(category, startDate?, endDate?)
// Returns: number

// Get monthly total
ExpenseStorage.getMonthlyTotal(year, month)
// Returns: number

// Get yearly total
ExpenseStorage.getYearlyTotal(year)
// Returns: number

// Get category totals
ExpenseStorage.getCategoryTotals(startDate?, endDate?)
// Returns: { [category: string]: number }

// Get monthly breakdown
ExpenseStorage.getMonthlyBreakdown(year)
// Returns: MonthlyBreakdown[]
```

#### Search and Filter

```javascript
// Search expenses
ExpenseStorage.searchExpenses(query, options)
// Options: { includeCategory?: boolean, includeAmount?: boolean }
// Returns: Expense[]

// Filter expenses
ExpenseStorage.filterExpenses(filters)
// Filters: {
//   startDate?: Date,
//   endDate?: Date,
//   categories?: string[],
//   minAmount?: number,
//   maxAmount?: number,
//   sortBy?: 'date' | 'amount' | 'description',
//   sortOrder?: 'asc' | 'desc'
// }
// Returns: Expense[]
```

#### Import/Export

```javascript
// Export all data
ExpenseStorage.exportData(includeSettings?)
// Returns: string (JSON)

// Import data
ExpenseStorage.importData(jsonData)
// Returns: { success: boolean, imported?: number, errors?: string[], error?: string }

// Export to CSV
ExpenseStorage.exportToCSV()
// Returns: string (CSV format)
```

#### Utility Functions

```javascript
// Clear all data
ExpenseStorage.clearAllData()
// Returns: boolean

// Get storage size
ExpenseStorage.getStorageSize()
// Returns: { bytes: number, kilobytes: string, megabytes: string }

// Get statistics
ExpenseStorage.getStatistics()
// Returns: Statistics object
```

### Data Types

```typescript
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Statistics {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  categoriesUsed: number;
  totalCategories: number;
  dateRange: {
    earliest: Date;
    latest: Date;
  } | null;
}

interface MonthlyBreakdown {
  month: number;
  monthName: string;
  total: number;
  count: number;
  expenses: Expense[];
}
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Data Not Saving

**Problem**: Expenses disappear after page refresh

**Solutions**:
- Check if localStorage is enabled in your browser
- Verify browser isn't in private/incognito mode
- Check browser console for errors
- Try clearing browser cache

#### 2. Charts Not Displaying

**Problem**: Charts tab shows empty or broken

**Solutions**:
- Ensure you have at least one expense added
- Check if JavaScript is enabled
- Try refreshing the page
- Load demo data to test functionality

#### 3. Form Validation Errors

**Problem**: Can't submit expense form

**Solutions**:
- Ensure all required fields are filled
- Amount must be a positive number
- Date cannot be in the future
- Description must be at least 3 characters

#### 4. Performance Issues

**Problem**: App feels slow or unresponsive

**Solutions**:
- Clear old data if you have thousands of expenses
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Close other browser tabs
- Check available system memory

#### 5. Import/Export Problems

**Problem**: Can't import previously exported data

**Solutions**:
- Ensure JSON format is valid
- Check that the file hasn't been corrupted
- Verify the data structure matches expected format
- Try importing smaller portions of data

### Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 80+ | Recommended |
| Firefox | 75+ | Full support |
| Safari | 13+ | Full support |
| Edge | 80+ | Full support |
| IE | Not supported | Use Edge instead |

### Storage Limits

- **localStorage Limit**: Typically 5-10MB per domain
- **Expense Limit**: Approximately 5,000-10,000 expenses
- **Performance**: Optimal with <1,000 expenses

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Budget tracking and alerts
- [ ] Recurring expenses
- [ ] Multiple currency support
- [ ] Cloud sync capability
- [ ] Mobile app version

### Version 2.5 (Future)
- [ ] Receipt photo upload
- [ ] Bank integration
- [ ] Expense sharing for groups
- [ ] Advanced analytics
- [ ] Custom categories

### Version 3.0 (Long-term)
- [ ] AI-powered insights
- [ ] Predictive budgeting
- [ ] Investment tracking
- [ ] Tax report generation
- [ ] Multi-user support

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: Open an issue describing the problem
2. **Suggest Features**: Share your ideas in discussions
3. **Submit PRs**: Fork, make changes, and submit pull requests
4. **Improve Docs**: Help make documentation clearer
5. **Share**: Tell others about the project

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/expense-tracker.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make changes and test thoroughly
5. Commit: `git commit -m "Add your feature"`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Comment complex logic
- Keep functions small and focused
- Write descriptive commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React, Canvas API, and modern web technologies**