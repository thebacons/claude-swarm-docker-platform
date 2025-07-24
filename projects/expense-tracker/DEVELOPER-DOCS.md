# Expense Tracker Developer Documentation

## Overview

The Expense Tracker is a client-side web application built with React and vanilla JavaScript. It requires no build process and runs entirely in the browser, using localStorage for data persistence.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18 (via CDN)
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Data Visualization**: Canvas API (custom implementation)
- **Styling**: Vanilla CSS with CSS Custom Properties
- **Data Storage**: Browser localStorage
- **Build Tools**: None (runs directly in browser)
- **Dependencies**: None (all functionality custom-built)

### Application Structure

```
┌─────────────────────────────────────────────────────┐
│                   index.html                        │
│                  (Entry Point)                      │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐           ┌─────────────────┐
│    App.js     │           │    App.css      │
│ (Main React)  │           │   (Styles)      │
└───────┬───────┘           └─────────────────┘
        │
        ├────────────────┬────────────────┬──────────────┐
        │                │                │              │
        ▼                ▼                ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ExpenseForm.js│ │  Charts.js   │ │storage.js│ │demo-data.js  │
└──────────────┘ └──────────────┘ └──────────┘ └──────────────┘
```

### Component Hierarchy

```
App
├── Header
├── Navigation (Tabs)
├── Expenses View
│   ├── ExpenseForm
│   ├── ExpenseFilter
│   ├── ExpenseSummary
│   └── ExpenseList
│       └── ExpenseItem[]
└── Charts View
    ├── Summary Cards
    │   ├── TotalCard
    │   ├── AverageCard
    │   └── HighestCard
    ├── ChartsGrid
    │   ├── PieChart (Canvas)
    │   └── BarChart (Canvas)
    └── CategoryCards[]
```

## Core Modules

### App.js - Main Application

The central hub that manages application state and coordinates all components.

#### State Management

```javascript
const [expenses, setExpenses] = useState([]);        // All expense data
const [formData, setFormData] = useState({...});     // Form input state
const [editingId, setEditingId] = useState(null);    // Edit mode tracking
const [filterCategory, setFilterCategory] = useState('All'); // Active filter
const [activeView, setActiveView] = useState('expenses');    // Current tab
```

#### Key Functions

**handleSubmit(e)**
- Validates form data
- Creates/updates expense
- Resets form state
- Triggers localStorage save

**handleEdit(expense)**
- Populates form with expense data
- Sets editing mode
- Tracks expense ID for update

**handleDelete(id)**
- Shows confirmation dialog
- Removes expense from state
- Updates localStorage

**calculateTotal()**
- Sums filtered expenses
- Returns formatted string
- Respects active filter

#### Data Flow

1. User interaction → Event handler
2. State update → Re-render
3. Effect hook → localStorage save
4. Child components receive props
5. UI updates reflect new state

### Charts.js - Data Visualization

Custom chart implementation using Canvas API for performance and flexibility.

#### Chart Components

**Pie Chart**
```javascript
const drawPieChart = React.useCallback(() => {
  // Calculate angles for each category
  // Draw slices with colors
  // Add percentage labels
  // Create donut effect
  // Display total in center
}, [expensesByCategory, totalExpenses, chartDimensions]);
```

**Bar Chart**
```javascript
const drawBarChart = React.useCallback(() => {
  // Process monthly data
  // Calculate scale and dimensions
  // Draw axes and grid
  // Render bars with labels
  // Handle responsive sizing
}, [monthlyExpenses, chartDimensions]);
```

#### Responsive Design

- Monitors container dimensions
- Adjusts canvas size dynamically
- Maintains aspect ratios
- Scales text appropriately

#### Performance Optimizations

- Uses React.useCallback for expensive operations
- Memoizes calculated data
- Efficient canvas clearing
- Minimal re-renders

### storage.js - Data Persistence Layer

A comprehensive data management module using the Module pattern for encapsulation.

#### Core Features

1. **CRUD Operations**
   - Create, Read, Update, Delete for expenses
   - Validation before operations
   - Error handling with detailed messages

2. **Data Structure**
   ```javascript
   class Expense {
     id: string;          // Unique identifier
     description: string; // Expense description
     amount: number;      // Monetary value
     category: string;    // Category name
     date: Date;         // Expense date
     notes?: string;     // Optional notes
     createdAt: Date;    // Creation timestamp
     updatedAt: Date;    // Last update timestamp
   }
   ```

3. **Storage Schema**
   ```javascript
   const STORAGE_KEYS = {
     EXPENSES: 'expenseTracker_expenses',
     CATEGORIES: 'expenseTracker_categories',
     SETTINGS: 'expenseTracker_settings',
     LAST_ID: 'expenseTracker_lastId',
     VERSION: 'expenseTracker_version'
   };
   ```

4. **Advanced Features**
   - Search and filtering
   - Date range queries
   - Aggregation functions
   - Import/Export (JSON, CSV)
   - Data migration support

#### API Design Principles

- Consistent return types
- Error-first callbacks pattern
- Defensive programming
- Input validation
- Graceful degradation

### ExpenseForm.js - Form Component

A reusable form component with comprehensive validation and user feedback.

#### Features

1. **Dual Mode Operation**
   - Create mode for new expenses
   - Edit mode with pre-population

2. **Validation System**
   ```javascript
   const validateForm = () => {
     // Check required fields
     // Validate data types
     // Ensure business rules
     // Return error object
   };
   ```

3. **User Experience**
   - Real-time validation
   - Error messages per field
   - Touch tracking
   - Loading states

4. **Accessibility**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

## Development Workflow

### Setting Up Development Environment

1. **Clone Repository**
   ```bash
   git clone [repository-url]
   cd expense-tracker
   ```

2. **Start Local Server** (optional)
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # Or simply open index.html
   ```

3. **Development Tools**
   - Browser DevTools for debugging
   - React DevTools extension
   - Network tab for performance
   - Console for API testing

### Code Organization

#### File Naming Convention
- Components: PascalCase (e.g., `ExpenseForm.js`)
- Utilities: kebab-case (e.g., `error-handler.js`)
- Styles: kebab-case (e.g., `error-styles.css`)
- Tests: `*.test.js` or `*-test.html`

#### Code Style Guide

1. **JavaScript**
   ```javascript
   // Function declarations for hoisted functions
   function calculateTotal(expenses) {
     return expenses.reduce((sum, exp) => sum + exp.amount, 0);
   }
   
   // Arrow functions for callbacks
   const handleClick = (e) => {
     e.preventDefault();
     // Handle click
   };
   
   // Destructuring for cleaner code
   const { id, description, amount } = expense;
   ```

2. **React Patterns**
   ```javascript
   // Functional components only
   const Component = ({ prop1, prop2 }) => {
     // Hooks at the top
     const [state, setState] = useState();
     
     // Effects after state
     useEffect(() => {
       // Effect logic
     }, [dependencies]);
     
     // Event handlers
     const handleEvent = () => {};
     
     // Render
     return <div>...</div>;
   };
   ```

3. **CSS Organization**
   ```css
   /* Component styles */
   .component-name { }
   
   /* Element styles */
   .component-name__element { }
   
   /* Modifiers */
   .component-name--modifier { }
   
   /* State classes */
   .is-active { }
   .has-error { }
   ```

### Testing Strategy

#### Manual Testing Checklist

1. **Functionality Tests**
   - [ ] Add expense with all fields
   - [ ] Edit existing expense
   - [ ] Delete with confirmation
   - [ ] Filter by each category
   - [ ] Switch between views
   - [ ] Load demo data

2. **Edge Cases**
   - [ ] Empty state handling
   - [ ] Maximum amount values
   - [ ] Special characters in text
   - [ ] Past/future dates
   - [ ] Rapid interactions

3. **Cross-Browser Testing**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Edge (latest)
   - [ ] Mobile browsers

#### Automated Testing

Currently uses HTML-based test files:
- `data-validation-test.html`
- `error-handling-test.html`
- `performance-test.html`

### Performance Optimization

#### Current Optimizations

1. **Rendering**
   - Virtual DOM diffing (React)
   - Memoized calculations
   - Efficient list rendering
   - Canvas for charts

2. **Data Management**
   - localStorage for persistence
   - In-memory caching
   - Lazy loading of charts
   - Efficient filtering

3. **Asset Loading**
   - CDN for React
   - Inline critical CSS
   - Lazy component loading
   - Minimal dependencies

#### Performance Metrics

Target metrics:
- First Paint: <100ms
- Interactive: <300ms
- Chart Render: <200ms
- Add Expense: <50ms

### Debugging Guide

#### Common Issues

1. **State Not Updating**
   ```javascript
   // Check for immutable updates
   setExpenses([...expenses, newExpense]); // Correct
   expenses.push(newExpense); // Wrong!
   ```

2. **localStorage Issues**
   ```javascript
   // Always stringify/parse
   localStorage.setItem('key', JSON.stringify(data));
   const data = JSON.parse(localStorage.getItem('key'));
   ```

3. **Chart Rendering**
   ```javascript
   // Ensure canvas dimensions are set
   canvas.width = containerWidth;
   canvas.height = containerHeight;
   ```

#### Debug Tools

1. **Console Helpers**
   ```javascript
   // Log current state
   console.log('Expenses:', ExpenseStorage.getAllExpenses());
   
   // Check storage size
   console.log('Storage:', ExpenseStorage.getStorageSize());
   
   // Export for inspection
   console.log(ExpenseStorage.exportData());
   ```

2. **React DevTools**
   - Inspect component props
   - Monitor state changes
   - Profile performance
   - Track re-renders

## API Integration Guide

### Adding External APIs

While the app is currently offline-first, here's how to add API support:

1. **Create API Module**
   ```javascript
   const ExpenseAPI = {
     baseURL: 'https://api.example.com',
     
     async sync(expenses) {
       const response = await fetch(`${this.baseURL}/sync`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(expenses)
       });
       return response.json();
     }
   };
   ```

2. **Add Sync Logic**
   ```javascript
   useEffect(() => {
     const syncTimer = setInterval(() => {
       if (navigator.onLine) {
         ExpenseAPI.sync(expenses);
       }
     }, 60000); // Every minute
     
     return () => clearInterval(syncTimer);
   }, [expenses]);
   ```

### Adding Authentication

1. **Token Storage**
   ```javascript
   const Auth = {
     setToken(token) {
       localStorage.setItem('authToken', token);
     },
     
     getToken() {
       return localStorage.getItem('authToken');
     },
     
     isAuthenticated() {
       return !!this.getToken();
     }
   };
   ```

2. **Protected Routes**
   ```javascript
   const ProtectedView = ({ children }) => {
     if (!Auth.isAuthenticated()) {
       return <LoginForm />;
     }
     return children;
   };
   ```

## Extending the Application

### Adding New Features

#### 1. New Expense Fields

```javascript
// In App.js - Update state
const [formData, setFormData] = useState({
  // ... existing fields
  receipt: null,  // New field
  tags: []        // New field
});

// In storage.js - Update Expense class
class Expense {
  constructor(...args, receipt, tags) {
    // ... existing code
    this.receipt = receipt;
    this.tags = tags || [];
  }
}
```

#### 2. New Chart Types

```javascript
// In Charts.js - Add line chart
const drawLineChart = useCallback(() => {
  const ctx = lineChartRef.current.getContext('2d');
  // Implementation
}, [data]);
```

#### 3. New Categories

```javascript
// In storage.js
const DEFAULT_CATEGORIES = [
  // ... existing
  'Healthcare',
  'Education',
  'Savings'
];
```

### Plugin System

Create a plugin architecture:

```javascript
// Plugin interface
class ExpensePlugin {
  constructor(name, version) {
    this.name = name;
    this.version = version;
  }
  
  install(app) {
    // Modify app behavior
  }
  
  uninstall(app) {
    // Clean up
  }
}

// Usage
const budgetPlugin = new ExpensePlugin('Budget', '1.0');
budgetPlugin.install(app);
```

## Deployment

### Production Checklist

1. **Code Quality**
   - [ ] Remove console.logs
   - [ ] Minify CSS/JS (optional)
   - [ ] Optimize images
   - [ ] Test all features

2. **Performance**
   - [ ] Enable caching headers
   - [ ] Use CDN for assets
   - [ ] Compress files
   - [ ] Lazy load components

3. **Security**
   - [ ] Content Security Policy
   - [ ] HTTPS only
   - [ ] Input sanitization
   - [ ] XSS protection

### Deployment Options

1. **Static Hosting**
   ```bash
   # GitHub Pages
   git push origin main
   
   # Netlify
   netlify deploy --prod
   
   # Vercel
   vercel --prod
   ```

2. **Traditional Server**
   ```nginx
   server {
     listen 80;
     server_name example.com;
     root /var/www/expense-tracker;
     index index.html;
   }
   ```

## Maintenance

### Regular Tasks

1. **Monthly**
   - Review error logs
   - Update dependencies
   - Performance audit
   - Security scan

2. **Quarterly**
   - Feature usage analysis
   - User feedback review
   - Code refactoring
   - Documentation update

### Version Management

Follow semantic versioning:
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

Example: `v2.1.3`

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [localStorage Guide](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [BrowserStack](https://www.browserstack.com) for testing

### Community
- GitHub Issues for bug reports
- Discussions for features
- Stack Overflow for questions

---

Happy coding! 🚀