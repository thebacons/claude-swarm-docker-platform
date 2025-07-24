// JSON-based persistence layer for task management
// This will be loaded as a script tag, so no imports

const Storage = {
  // Storage keys
  PROJECTS_KEY: 'taskManager_projects',
  TASKS_KEY: 'taskManager_tasks',
  
  // Status definitions
  STATUSES: {
    "NS": "Not Started",
    "IP": "In Progress", 
    "Defect": "Defect Found",
    "Completed": "Completed",
    "R4-TUT": "Ready for Unit Testing",
    "R4-FUT": "Ready for Functional Testing",
    "R4-SIT": "Ready for Integration Testing",
    "R4R": "Ready for Retesting",
    "R4-UAT": "Ready for User Acceptance Testing"
  },
  
  // Initialize storage with default data if empty
  init: function() {
    if (!localStorage.getItem(this.PROJECTS_KEY)) {
      // Load initial data from our session
      const initialData = {
        projects: [
          {
            id: "PROJ-001",
            name: "Claude Swarm Docker Implementation",
            description: "Multi-agent AI development environment with validation hooks",
            created: new Date("2025-01-24T00:00:00Z").toISOString()
          }
        ],
        tasks: [
          {
            id: "TASK-001",
            projectId: "PROJ-001",
            title: "Create directory structure for claude-swarm-docker",
            description: "Set up initial project structure with Dockerfile, docker-compose, configs",
            status: "Completed",
            workflow: ["NS", "IP", "Completed"],
            created: "2025-01-24T00:00:00Z",
            updated: "2025-01-24T00:30:00Z"
          },
          {
            id: "TASK-002",
            projectId: "PROJ-001",
            title: "Fix Docker authentication issues",
            description: "Solve OAuth authentication error in container using Python SDK",
            status: "Completed",
            workflow: ["NS", "IP", "Defect", "IP", "Completed"],
            created: "2025-01-24T00:30:00Z",
            updated: "2025-01-24T01:00:00Z"
          },
          {
            id: "TASK-003",
            projectId: "PROJ-001",
            title: "Test parallel agent execution",
            description: "Implement true parallel execution with cognitive triangulation",
            status: "Completed",
            workflow: ["NS", "IP", "R4-TUT", "R4-FUT", "Completed"],
            created: "2025-01-24T01:00:00Z",
            updated: "2025-01-24T02:00:00Z"
          },
          {
            id: "TASK-004",
            projectId: "PROJ-001",
            title: "Identify white screen root cause",
            description: "Discovered ES6 modules with babel script tags causing errors",
            status: "Completed",
            workflow: ["NS", "IP", "Defect", "R4R", "Completed"],
            created: "2025-01-24T02:00:00Z",
            updated: "2025-01-24T02:30:00Z"
          },
          {
            id: "TASK-005",
            projectId: "PROJ-001",
            title: "Design hook-based validation system",
            description: "Create comprehensive plan for validation hooks and fixers",
            status: "Completed",
            workflow: ["NS", "IP", "Completed"],
            created: "2025-01-24T02:30:00Z",
            updated: "2025-01-24T03:00:00Z"
          },
          {
            id: "TASK-006",
            projectId: "PROJ-001",
            title: "Implement hook validation system",
            description: "Build validators, fixers, and testers for React code",
            status: "Completed",
            workflow: ["NS", "IP", "R4-TUT", "R4-FUT", "R4-SIT", "Completed"],
            created: "2025-01-24T03:00:00Z",
            updated: "2025-01-24T04:00:00Z"
          },
          {
            id: "TASK-007",
            projectId: "PROJ-001",
            title: "Test and fix todo-app",
            description: "Apply hooks to fix module system issues in todo-app",
            status: "Completed",
            workflow: ["NS", "IP", "R4-TUT", "R4-FUT", "Completed"],
            created: "2025-01-24T04:00:00Z",
            updated: "2025-01-24T04:30:00Z"
          },
          {
            id: "TASK-008",
            projectId: "PROJ-001",
            title: "Create enhanced validation system",
            description: "Build project-wide validation and integration testing",
            status: "Completed",
            workflow: ["NS", "IP", "R4-TUT", "R4-FUT", "R4-SIT", "Completed"],
            created: "2025-01-24T04:30:00Z",
            updated: "2025-01-24T05:00:00Z"
          },
          {
            id: "TASK-009",
            projectId: "PROJ-001",
            title: "Create task-manager app for UAT",
            description: "Build comprehensive task management app with persistence",
            status: "IP",
            workflow: ["NS", "IP"],
            created: "2025-01-24T05:00:00Z",
            updated: new Date().toISOString()
          },
          {
            id: "TASK-010",
            projectId: "PROJ-001",
            title: "Deploy hooks to Docker containers",
            description: "Integrate validation system with swarm agents",
            status: "NS",
            workflow: ["NS"],
            created: "2025-01-24T05:00:00Z",
            updated: "2025-01-24T05:00:00Z"
          },
          {
            id: "TASK-011",
            projectId: "PROJ-001",
            title: "Implement voice integration",
            description: "Add TTS/STT capabilities to hook system",
            status: "NS",
            workflow: ["NS"],
            created: "2025-01-24T05:00:00Z",
            updated: "2025-01-24T05:00:00Z"
          },
          {
            id: "TASK-012",
            projectId: "PROJ-001",
            title: "Create Policeman Agent",
            description: "Build oversight agent using hooks for enforcement",
            status: "NS",
            workflow: ["NS"],
            created: "2025-01-24T05:00:00Z",
            updated: "2025-01-24T05:00:00Z"
          }
        ]
      };
      
      this.saveProjects(initialData.projects);
      this.saveTasks(initialData.tasks);
    }
  },
  
  // Project operations
  getProjects: function() {
    const data = localStorage.getItem(this.PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveProjects: function(projects) {
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
  },
  
  addProject: function(project) {
    const projects = this.getProjects();
    project.id = project.id || `PROJ-${String(projects.length + 1).padStart(3, '0')}`;
    project.created = project.created || new Date().toISOString();
    projects.push(project);
    this.saveProjects(projects);
    return project;
  },
  
  // Task operations
  getTasks: function(projectId = null) {
    const data = localStorage.getItem(this.TASKS_KEY);
    const tasks = data ? JSON.parse(data) : [];
    return projectId ? tasks.filter(t => t.projectId === projectId) : tasks;
  },
  
  saveTasks: function(tasks) {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  },
  
  addTask: function(task) {
    const tasks = this.getTasks();
    task.id = task.id || `TASK-${String(tasks.length + 1).padStart(3, '0')}`;
    task.created = task.created || new Date().toISOString();
    task.updated = task.updated || task.created;
    task.workflow = task.workflow || [task.status || "NS"];
    tasks.push(task);
    this.saveTasks(tasks);
    return task;
  },
  
  updateTask: function(taskId, updates) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const task = tasks[index];
      
      // Track workflow changes
      if (updates.status && updates.status !== task.status) {
        task.workflow = task.workflow || [];
        if (!task.workflow.includes(updates.status)) {
          task.workflow.push(updates.status);
        }
      }
      
      // Apply updates
      Object.assign(task, updates);
      task.updated = new Date().toISOString();
      
      tasks[index] = task;
      this.saveTasks(tasks);
      return task;
    }
    return null;
  },
  
  deleteTask: function(taskId) {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    this.saveTasks(filtered);
    return filtered.length < tasks.length;
  },
  
  // Utility functions
  getNextStatus: function(currentStatus) {
    const progression = {
      "NS": ["IP", "R4-TUT"],
      "IP": ["R4-TUT", "R4-FUT", "R4-SIT", "Defect", "Completed"],
      "R4-TUT": ["R4-FUT", "Defect", "IP"],
      "R4-FUT": ["R4-SIT", "Defect", "IP"],
      "R4-SIT": ["R4-UAT", "Defect", "IP"],
      "R4-UAT": ["Completed", "Defect", "IP"],
      "Defect": ["IP", "R4R"],
      "R4R": ["IP", "R4-TUT", "R4-FUT", "R4-SIT"],
      "Completed": []
    };
    return progression[currentStatus] || [];
  },
  
  exportData: function() {
    return {
      projects: this.getProjects(),
      tasks: this.getTasks(),
      statuses: this.STATUSES,
      exported: new Date().toISOString()
    };
  },
  
  importData: function(data) {
    if (data.projects) {
      this.saveProjects(data.projects);
    }
    if (data.tasks) {
      this.saveTasks(data.tasks);
    }
  }
};

// Make Storage globally available
if (typeof window !== 'undefined') {
  window.Storage = Storage;
  // Initialize on load
  Storage.init();
}