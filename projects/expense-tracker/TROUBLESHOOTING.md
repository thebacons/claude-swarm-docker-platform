# Expense Tracker Troubleshooting Guide

## Quick Fixes

Before diving into detailed troubleshooting, try these quick fixes that solve 90% of issues:

1. **Refresh the page** (Ctrl+R / Cmd+R)
2. **Hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) 
3. **Close and reopen browser**
4. **Try a different browser**
5. **Check if JavaScript is enabled**
6. **Exit private/incognito mode**

## Common Issues and Solutions

### 🚫 Application Won't Load

#### Symptoms
- Blank white page
- "Loading..." stuck on screen
- Page partially loads

#### Solutions

**1. Check Browser Console**
```
1. Press F12 (or right-click → Inspect)
2. Click "Console" tab
3. Look for red error messages
4. Take screenshot of errors for support
```

**2. Verify All Files Present**
```bash
# Required files:
index.html
App.js
Charts.js
ExpenseForm.js
storage.js
App.css
demo-data.js
```

**3. Check File Paths**
- Ensure all files are in the same folder
- No files in subfolders
- File names are case-sensitive on some systems

**4. JavaScript Disabled?**
- Chrome: Settings → Privacy → Site Settings → JavaScript
- Firefox: about:config → javascript.enabled
- Safari: Preferences → Security → Enable JavaScript

**5. Browser Extensions Interfering**
- Try incognito/private mode
- Disable ad blockers temporarily
- Disable script blockers

### 💾 Data Not Saving

#### Symptoms
- Expenses disappear on refresh
- "Add Expense" does nothing
- Changes don't persist

#### Solutions

**1. Check localStorage Support**
```javascript
// Open console (F12) and run:
if (typeof(Storage) !== "undefined") {
  console.log("localStorage is supported");
  // Test it:
  localStorage.setItem("test", "123");
  console.log(localStorage.getItem("test")); // Should show "123"
} else {
  console.log("No localStorage support!");
}
```

**2. Private/Incognito Mode?**
- localStorage often disabled in private mode
- Switch to normal browsing mode

**3. Storage Quota Exceeded**
```javascript
// Check storage usage:
ExpenseStorage.getStorageSize()

// If near 5MB limit, clear old data:
const oldExpenses = ExpenseStorage.getAllExpenses()
  .filter(e => new Date(e.date) < new Date('2023-01-01'));
const oldIds = oldExpenses.map(e => e.id);
ExpenseStorage.deleteMultipleExpenses(oldIds);
```

**4. Browser Settings**
- Check site permissions
- Ensure cookies/site data allowed
- Some corporate policies block localStorage

**5. Corrupted Data**
```javascript
// Backup current data first:
const backup = localStorage.getItem('expenseTracker_expenses');
console.log(backup); // Copy this

// Then try to repair:
try {
  const expenses = JSON.parse(backup);
  localStorage.setItem('expenseTracker_expenses', JSON.stringify(expenses));
} catch(e) {
  console.error("Data corrupted, clearing...");
  localStorage.removeItem('expenseTracker_expenses');
  location.reload();
}
```

### 📊 Charts Not Displaying

#### Symptoms
- Charts tab is empty
- "No data to display" message
- Charts partially render

#### Solutions

**1. Add Data First**
- Charts require at least one expense
- Try adding a test expense
- Or load demo data

**2. Canvas Support**
```javascript
// Test canvas support:
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (ctx) {
  console.log("Canvas is supported");
} else {
  console.log("Canvas not supported - update browser");
}
```

**3. Check Chart Dimensions**
```javascript
// In console:
const container = document.querySelector('.chart-canvas-container');
console.log(`Width: ${container.offsetWidth}, Height: ${container.offsetHeight}`);
// Both should be > 0
```

**4. Memory Issues**
- Too many expenses can cause rendering issues
- Try with fewer expenses:
```javascript
// Keep only last 3 months:
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

const recent = ExpenseStorage.getAllExpenses()
  .filter(e => new Date(e.date) >= threeMonthsAgo);

// Clear and re-add
ExpenseStorage.clearAllData();
recent.forEach(e => {
  ExpenseStorage.saveExpense(e.description, e.amount, e.category, e.date);
});
```

### ❌ Can't Delete or Edit Expenses

#### Symptoms
- Edit button doesn't work
- Delete confirmation appears but nothing happens
- Form doesn't populate when editing

#### Solutions

**1. Check Console for Errors**
- Click edit/delete while console is open
- Look for JavaScript errors

**2. ID Mismatch**
```javascript
// Verify expense IDs are valid:
const expenses = ExpenseStorage.getAllExpenses();
expenses.forEach(e => {
  if (!e.id) {
    console.log("Found expense without ID:", e);
  }
});
```

**3. Event Handler Issues**
- Refresh the page
- Clear browser cache
- Check for browser console errors

**4. Form State Issues**
```javascript
// Reset form state manually:
window.location.reload(true);
```

### 📝 Form Validation Errors

#### Symptoms
- "Please fill in all fields" despite filling them
- Amount field won't accept numbers
- Date picker not working

#### Solutions

**1. Amount Field Issues**
- Use numbers only (no currency symbols)
- Use period for decimals (25.50 not 25,50)
- Must be positive number

**2. Date Issues**
- Can't select future dates
- Format: YYYY-MM-DD
- Try manual entry if picker fails

**3. Description Length**
- Minimum 3 characters required
- Maximum 100 characters
- No special validation on content

**4. Clear Form and Retry**
- Click Cancel button
- Refresh page
- Try again with simple test data

### 🐌 Performance Issues

#### Symptoms
- App feels sluggish
- Delays when adding expenses
- Charts take long to render
- Browser becomes unresponsive

#### Solutions

**1. Check Data Volume**
```javascript
// How many expenses?
const count = ExpenseStorage.getAllExpenses().length;
console.log(`Total expenses: ${count}`);

// If > 1000, consider archiving:
const oldExpenses = ExpenseStorage.getAllExpenses()
  .filter(e => new Date(e.date) < new Date('2023-01-01'));
  
// Export old data first:
const backup = ExpenseStorage.exportData();
// Save this somewhere safe!

// Then remove old:
const oldIds = oldExpenses.map(e => e.id);
ExpenseStorage.deleteMultipleExpenses(oldIds);
```

**2. Browser Performance**
- Close unnecessary tabs
- Restart browser
- Check available RAM
- Disable browser extensions

**3. Optimize Chart Rendering**
```javascript
// Reduce data points for charts:
// Only show last 3 months in bar chart
// This is automatic, but verify it's working
```

**4. Clear Browser Cache**
- Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- Select "Cached images and files"
- Clear and restart browser

### 🔄 Import/Export Problems

#### Symptoms
- Export creates empty file
- Import says "invalid data"
- Import succeeds but no data appears

#### Solutions

**1. Export Issues**
```javascript
// Manual export in console:
const data = ExpenseStorage.exportData();
console.log(data); // Copy this output
// Save to file manually if download fails
```

**2. Import Format**
```javascript
// Correct format example:
{
  "version": "1.0",
  "expenses": [
    {
      "id": "exp_1_1234567890",
      "description": "Test expense",
      "amount": 25.50,
      "category": "Food",
      "date": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "categories": ["Food", "Transport", "Entertainment", "Utilities", "Other"]
}
```

**3. Import Validation**
```javascript
// Test your import data:
const testData = '{"expenses":[]}'; // Your data here
try {
  const parsed = JSON.parse(testData);
  console.log("Valid JSON");
  console.log("Has expenses:", Array.isArray(parsed.expenses));
} catch(e) {
  console.error("Invalid JSON:", e);
}
```

**4. Partial Import**
```javascript
// If full import fails, try expenses only:
const importData = {
  expenses: [
    // Your expenses here
  ]
};
ExpenseStorage.importData(JSON.stringify(importData));
```

### 📱 Mobile-Specific Issues

#### Symptoms
- Buttons too small to tap
- Charts cut off
- Keyboard covers form
- Can't scroll properly

#### Solutions

**1. Rotation**
- Try landscape mode for charts
- Portrait for expense entry

**2. Zoom Issues**
- Double-tap to zoom
- Pinch to zoom out
- Check browser zoom settings

**3. Touch Not Working**
```html
<!-- Add to index.html if needed: -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

**4. iOS Safari Issues**
- Settings → Safari → Advanced → JavaScript (must be ON)
- Try Chrome for iOS instead

### 🌐 Browser-Specific Issues

#### Chrome
- Disable "Lite mode" if enabled
- Check Site Settings for JavaScript
- Clear browsing data if issues persist

#### Firefox
- Check Enhanced Tracking Protection
- May block localStorage in strict mode
- Try standard mode

#### Safari
- Preferences → Privacy → "Prevent cross-site tracking" may cause issues
- Try unchecking temporarily
- Enable Developer menu for debugging

#### Edge
- Similar to Chrome solutions
- Check InPrivate mode isn't active
- Verify JavaScript enabled

### 🔧 Advanced Debugging

#### Enable Debug Mode
```javascript
// In console:
window.DEBUG_MODE = true;

// Now all operations will log:
ExpenseStorage.saveExpense("Test", 10, "Food", new Date());
// Will show detailed logs
```

#### Check React State
```javascript
// If using React DevTools:
// 1. Install React DevTools extension
// 2. Open DevTools → React tab
// 3. Search for "App" component
// 4. Inspect state values
```

#### Network Issues
```javascript
// Check if offline:
console.log("Online:", navigator.onLine);

// Monitor connection:
window.addEventListener('online', () => console.log('Back online'));
window.addEventListener('offline', () => console.log('Gone offline'));
```

#### Memory Profiling
```javascript
// Check memory usage:
if (performance.memory) {
  console.log({
    used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + " MB",
    total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + " MB",
    limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + " MB"
  });
}
```

## Error Messages Explained

### "Description is required and must be a non-empty string"
- Enter at least 3 characters in description field

### "Amount must be a positive number"
- Remove currency symbols
- Use numbers only
- Must be greater than 0

### "Cannot delete category that is in use"
- Change expenses using this category first
- Then delete the category

### "Expense not found"
- The expense was already deleted
- Refresh the page

### "No valid expenses found in import data"
- Import file format is incorrect
- Check the import format section above

## Prevention Tips

### Regular Maintenance
1. **Weekly**: Review and clean up expenses
2. **Monthly**: Export backup
3. **Quarterly**: Archive old data
4. **Yearly**: Clear ancient history

### Best Practices
1. **One browser tab** - Don't open multiple tabs
2. **Regular saves** - Add expenses as they occur
3. **Simple descriptions** - Avoid special characters
4. **Consistent categories** - Don't create too many

### Performance Tips
1. **Limit to current year** - Archive older data
2. **Use standard categories** - Don't create dozens
3. **Close unused tabs** - Free up memory
4. **Update browser** - Use latest version

## Getting Additional Help

### Self-Help Resources
1. Read all error messages carefully
2. Check browser console for details
3. Try demo mode to verify app works
4. Search error message online

### Information to Gather for Support
```javascript
// Run this diagnostic:
console.log({
  browser: navigator.userAgent,
  localStorage: typeof(Storage) !== "undefined",
  expenses: ExpenseStorage.getAllExpenses().length,
  storage: ExpenseStorage.getStorageSize(),
  categories: ExpenseStorage.getAllCategories().length,
  online: navigator.onLine
});
// Copy output for support
```

### Reset Everything (Last Resort)
```javascript
// WARNING: This deletes ALL data!
// First, export backup:
const backup = ExpenseStorage.exportData();
console.log(backup); // SAVE THIS!

// Then clear everything:
localStorage.clear();
location.reload();
```

---

Remember: Most issues are solved by refreshing the page or trying a different browser. Don't panic, your data is safe in localStorage! 🙂