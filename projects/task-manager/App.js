// React hooks for browser usage
const { useState, useEffect } = React;

// Main Task Manager Application

function App() {
  const [projects, setProjects] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    projectId: '',
    status: 'NS'
  });
  const [filter, setFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  // Load data on mount
  React.useEffect(() => {
    const loadedProjects = window.Storage.getProjects();
    const loadedTasks = window.Storage.getTasks();
    setProjects(loadedProjects);
    setTasks(loadedTasks);
    if (loadedProjects.length > 0) {
      setSelectedProject(loadedProjects[0].id);
      setNewTask(prev => ({ ...prev, projectId: loadedProjects[0].id }));
    }
  }, []);

  // Filter tasks
  const getFilteredTasks = () => {
    let filtered = selectedProject 
      ? tasks.filter(t => t.projectId === selectedProject)
      : tasks;
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Add new task
  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const task = window.Storage.addTask(newTask);
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        projectId: selectedProject,
        status: 'NS'
      });
      setShowAddTask(false);
    }
  };

  // Update task
  const handleUpdateTask = (taskId, updates) => {
    const updated = window.Storage.updateTask(taskId, updates);
    if (updated) {
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    }
  };

  // Delete task
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      window.Storage.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  // Export data
  const handleExport = () => {
    const data = window.Storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-manager-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Get task statistics
  const getStats = () => {
    const projectTasks = selectedProject 
      ? tasks.filter(t => t.projectId === selectedProject)
      : tasks;
    
    const stats = {};
    Object.keys(window.Storage.STATUSES).forEach(status => {
      stats[status] = projectTasks.filter(t => t.status === status).length;
    });
    return stats;
  };

  const stats = getStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager - Claude Swarm UAT</h1>
        <button onClick={handleExport} className="export-btn">Export Data</button>
      </header>

      <div className="container">
        {/* Project selector */}
        <div className="project-selector">
          <label>Project: </label>
          <select 
            value={selectedProject || ''} 
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setNewTask(prev => ({ ...prev, projectId: e.target.value }));
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>

        {/* Statistics */}
        <div className="stats-bar">
          {Object.entries(stats).map(([status, count]) => (
            <div key={status} className="stat-item">
              <span className="stat-label">{window.Storage.STATUSES[status]}:</span>
              <span className="stat-count">{count}</span>
            </div>
          ))}
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-count">{Object.values(stats).reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="controls">
          <div className="filter-group">
            <label>Filter by Status: </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              {Object.entries(window.Storage.STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="search-group">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setShowAddTask(!showAddTask)}
            className="add-task-btn"
          >
            + Add Task
          </button>
        </div>

        {/* Add task form */}
        {showAddTask && (
          <div className="add-task-form">
            <h3>New Task</h3>
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              rows="3"
            />
            <div>
              <button onClick={handleAddTask}>Add Task</button>
              <button onClick={() => setShowAddTask(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <p className="no-tasks">No tasks found</p>
          ) : (
            filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}


// Make component available globally
if (typeof window !== 'undefined') {
  window.App = App;
}
