# CASPER User Prompt Examples

## How to Interact with the Policeman Orchestrator

When using CASPER, you're talking to the Policeman who will orchestrate the entire team. Here are effective prompts:

## 🎯 Effective Prompt Patterns

### 1. **Direct Task Assignment**
```
"Create a React dashboard with user authentication and real-time data updates"
```
The Policeman will automatically decompose this and assign to appropriate agents.

### 2. **Swarm Optimization Request**
```
"I need to refactor 50 JavaScript files to TypeScript. Use parallel processing for speed."
```
Explicitly requesting parallel processing triggers swarm spawning.

### 3. **Specific Agent Targeting**
```
"Have Developer-1 create the frontend while Developer-2 builds the API, then run tests"
```
You can specify which agents should handle what.

### 4. **Complex Multi-Stage Projects**
```
"Build a complete e-commerce platform with:
- Product catalog
- Shopping cart
- Payment integration  
- Admin panel
- API documentation
Optimize for parallel development where possible."
```

## 📝 Example Conversations

### Example 1: Simple Web App
```
User: "Create a todo app with React and local storage"

Policeman: 👮 **Policeman Orchestrator Response**

I understand you want to create a todo app with React and local storage. I'll coordinate our team to handle this efficiently.

**Task Breakdown:**
1. Create React app structure → Assigned to Developer-1
2. Build todo components → Assigned to Developer-1  
3. Implement local storage → Assigned to Developer-1
4. Style the application → Assigned to Developer-1
5. Write tests → Assigned to Tester

**Execution Strategy:** Sequential (single developer with testing phase)

**Estimated Time:** 15 minutes

Let me start the orchestration...
```

### Example 2: Complex System with Swarm
```
User: "Convert our entire Next.js codebase from JavaScript to TypeScript. We have about 200 files. Maximum speed please!"

Policeman: 👮 **Policeman Orchestrator Response**

I understand you want to convert a large Next.js codebase (200 files) from JavaScript to TypeScript with maximum speed. This is perfect for our swarm approach!

**Task Breakdown:**
1. Analyze codebase structure → Assigned to Developer-1
2. Create TypeScript configuration → Assigned to Developer-2  
3. Convert files (parallel):
   - Files 1-70 → Developer-1 + 2 spawned instances
   - Files 71-140 → Developer-2 + 2 spawned instances
   - Files 141-200 → Shared between available instances
4. Resolve type conflicts → Assigned to Developer-1 (lead)
5. Run full test suite → Assigned to Tester

**Execution Strategy:** Swarm (6 parallel developer instances)

**Estimated Time:** 25 minutes (vs 2+ hours sequential)

Spawning additional agent instances now...
```

### Example 3: Full Stack Development
```
User: "Build a real-time chat application with user authentication, message history, and file sharing"

Policeman: 👮 **Policeman Orchestrator Response**

I understand you want to build a real-time chat application with authentication, message history, and file sharing. I'll orchestrate our team for efficient parallel development.

**Task Breakdown:**
1. **Backend Development** (Developer-2):
   - Set up Node.js/Express server
   - Implement Socket.io for real-time
   - Create authentication system
   - Design database schema
   - Build file upload API

2. **Frontend Development** (Developer-1):
   - Create React app structure
   - Build chat UI components
   - Implement socket client
   - Create auth forms
   - Add file sharing UI

3. **Integration & Testing** (All agents):
   - Connect frontend to backend
   - Test real-time features
   - Validate file uploads
   - Security testing

**Execution Strategy:** Parallel (frontend/backend simultaneous development)

**Estimated Time:** 45 minutes

Starting parallel development streams...
```

## 🚀 Advanced Prompts

### Performance Optimization
```
"Analyze and optimize our React app's performance. Check for memory leaks, unnecessary re-renders, and bundle size issues. Use parallel analysis where possible."
```

### Code Review with Fixes
```
"Review this codebase for security vulnerabilities, code smells, and performance issues. Fix all critical issues found. Coordinate multiple agents for faster processing."
```

### Documentation Generation
```
"Generate complete documentation for our API including:
- OpenAPI/Swagger specs
- README files
- Code comments
- Usage examples
Use parallel processing to document multiple modules simultaneously."
```

## 💡 Tips for Best Results

1. **Be Specific**: The more details you provide, the better the orchestration
2. **Request Optimization**: Explicitly ask for parallel/swarm processing for large tasks
3. **Set Priorities**: Mention what's most important (speed, quality, completeness)
4. **Provide Context**: Include relevant information about your project
5. **Iterative Approach**: Start with high-level requests, then refine

## 🎮 Interactive Commands

Once connected to the Policeman container, you can also use these commands:

```bash
# Check agent status
casper status

# View active tasks
casper tasks

# Monitor specific agent
casper monitor developer-1

# Spawn additional agents
casper spawn developer --count 2

# View orchestration logs
casper logs --tail 50
```

## 🔧 Debugging Prompts

If something goes wrong:

```
"Show me the current status of all agents and active tasks"

"Debug why the last task failed and retry with fixes"

"Check system resources and optimize agent allocation"
```

Remember: The Policeman is designed to handle complex orchestration automatically. Start with what you want to build, and let the Policeman figure out the optimal execution strategy!