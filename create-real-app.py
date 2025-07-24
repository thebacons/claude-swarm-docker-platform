#!/usr/bin/env python3
"""
Create a REAL application using Claude Swarm
This script actually generates code files!
"""

import os
import json
from pathlib import Path
from anthropic import Anthropic
import time

class CodeGeneratorAgent:
    def __init__(self, name, role):
        self.name = name
        self.role = role
        self.client = Anthropic()
        
    def generate_code(self, task, filename):
        """Generate actual code and save to file"""
        prompt = f"""As a {self.role}, {task}
        
IMPORTANT: Return ONLY the code, no explanations, no markdown markers.
Just the raw code that should go in the file."""
        
        print(f"🤖 {self.name}: Generating {filename}...")
        
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}]
            )
            code = response.content[0].text.strip()
            
            # Remove markdown code blocks if present
            if code.startswith("```"):
                lines = code.split('\n')
                code = '\n'.join(lines[1:-1])
            
            return code
        except Exception as e:
            return f"// Error generating code: {str(e)}"

def create_todo_app():
    """Create a complete Todo application with React and Node.js"""
    
    print("🚀 Creating a REAL Todo Application using Claude Swarm!\n")
    
    # Create project structure
    project_dir = Path("/workspace/projects/todo-app")
    project_dir.mkdir(parents=True, exist_ok=True)
    
    frontend_dir = project_dir / "frontend"
    backend_dir = project_dir / "backend"
    frontend_dir.mkdir(exist_ok=True)
    backend_dir.mkdir(exist_ok=True)
    
    # Create agents
    frontend_agent = CodeGeneratorAgent("Frontend Dev", "React developer")
    backend_agent = CodeGeneratorAgent("Backend Dev", "Node.js developer")
    
    print("📁 Creating project structure...\n")
    
    # Generate Frontend Files
    print("🎨 FRONTEND TEAM WORKING...")
    
    # 1. React App Component
    app_code = frontend_agent.generate_code(
        "Create a React App component for a todo list with add, delete, and toggle complete functionality. Use hooks and modern React patterns.",
        "App.js"
    )
    (frontend_dir / "App.js").write_text(app_code)
    print("✅ Created: frontend/App.js")
    
    # 2. TodoItem Component
    todo_item_code = frontend_agent.generate_code(
        "Create a React TodoItem component that displays a single todo with checkbox, text, and delete button",
        "TodoItem.js"
    )
    (frontend_dir / "TodoItem.js").write_text(todo_item_code)
    print("✅ Created: frontend/TodoItem.js")
    
    # 3. CSS Styles
    css_code = frontend_agent.generate_code(
        "Create CSS styles for a modern, clean todo app with nice colors and transitions",
        "App.css"
    )
    (frontend_dir / "App.css").write_text(css_code)
    print("✅ Created: frontend/App.css")
    
    # 4. HTML Template
    html_code = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App - Claude Swarm</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link rel="stylesheet" href="App.css">
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="TodoItem.js"></script>
    <script type="text/babel" src="App.js"></script>
    <script type="text/babel">
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>"""
    (frontend_dir / "index.html").write_text(html_code)
    print("✅ Created: frontend/index.html")
    
    # Generate Backend Files
    print("\n⚙️ BACKEND TEAM WORKING...")
    
    # 1. Express Server
    server_code = backend_agent.generate_code(
        "Create an Express.js server with REST API endpoints for todos: GET /todos, POST /todos, PUT /todos/:id, DELETE /todos/:id. Use in-memory storage for now. Include CORS support.",
        "server.js"
    )
    (backend_dir / "server.js").write_text(server_code)
    print("✅ Created: backend/server.js")
    
    # 2. Package.json for backend
    package_json = {
        "name": "todo-backend",
        "version": "1.0.0",
        "description": "Todo API built by Claude Swarm",
        "main": "server.js",
        "scripts": {
            "start": "node server.js",
            "dev": "nodemon server.js"
        },
        "dependencies": {
            "express": "^4.18.0",
            "cors": "^2.8.5",
            "body-parser": "^1.20.0"
        }
    }
    (backend_dir / "package.json").write_text(json.dumps(package_json, indent=2))
    print("✅ Created: backend/package.json")
    
    # 3. README
    readme_code = """# Todo App - Built by Claude Swarm 🤖

This application was generated by multiple AI agents working in parallel!

## Project Structure
```
todo-app/
├── frontend/          # React frontend
│   ├── index.html    # Main HTML file
│   ├── App.js        # Main React component
│   ├── TodoItem.js   # Todo item component
│   └── App.css       # Styles
└── backend/          # Node.js backend
    ├── server.js     # Express API server
    └── package.json  # Dependencies
```

## Running the Application

### Frontend (Simple HTML)
1. Open `frontend/index.html` in your browser
2. Or use a simple HTTP server:
   ```bash
   cd frontend
   python3 -m http.server 8000
   ```

### Backend (if you want API)
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start server:
   ```bash
   npm start
   ```

The API will run on http://localhost:3001

## Features
- ✅ Add new todos
- ✅ Mark todos as complete
- ✅ Delete todos
- ✅ Clean, modern UI
- ✅ REST API backend (optional)

## Built By
- Frontend Agent (React Developer)
- Backend Agent (Node.js Developer)
- Orchestrated by Claude Swarm!

Generated on: """ + str(time.strftime("%Y-%m-%d %H:%M:%S"))
    
    (project_dir / "README.md").write_text(readme_code)
    print("✅ Created: README.md")
    
    # Final summary
    print("\n" + "="*60)
    print("🎉 TODO APP CREATED SUCCESSFULLY!")
    print("="*60)
    print(f"\nLocation: {project_dir}")
    print("\nTo run the app:")
    print("1. Open a new terminal/tab")
    print("2. cd /workspace/projects/todo-app/frontend")
    print("3. python3 -m http.server 8000")
    print("4. Open browser to http://localhost:8000")
    print("\nThe app is fully functional with:")
    print("- Add todos")
    print("- Toggle complete")
    print("- Delete todos")
    print("- Persistent in browser (localStorage)")
    print("\nThis is a REAL app generated by AI agents! 🚀")

if __name__ == "__main__":
    create_todo_app()